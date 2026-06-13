import { readFile } from 'node:fs/promises';
import {
  EDGE_TYPES,
  type EdgeType,
  NODE_STATUSES,
  NODE_TYPES,
  type NodeStatus,
  type NodeType,
  classifyTestFailure,
  renderMermaid,
  slugify,
} from '@cairn/core';
import { type Interview, type Transcript, renderWizard, validateInterview } from '@cairn/studio';
import { type ParsedArgs, numFlag as num, parseArgs as parse, strFlag as str } from './args.js';
import {
  type GraphOps,
  applyGraphOps,
  formatResume,
  initProject,
  startStudioSession,
} from './commands.js';
import { openBrowser as defaultOpenBrowser } from './open.js';
import { CairnStore } from './store.js';

export const VERSION = '0.1.0';

export const HELP = `🪨  cairn — give your agent continuity

Usage: cairn <command> [options]

Commands:
  init                         Create the project brain in ./.cairn
  studio --interview <file>    Run a live brainstorming session in the browser
         [--static] [--out f]    ...or render a static wizard for headless use
         [--port N] [--no-open]
  ingest <transcript.json>     Save a finished interview transcript
  graph apply <ops.json>       Apply a batch of nodes/edges (the agent's synthesis)
  graph add --type T --title "..."   Add a single node
  graph set <id> --status done       Update an existing node's status/body
  graph edge --type T --from id --to id   Connect two nodes
  graph show                   Print the project graph (ids, statuses, Mermaid)
  resume                       Print the context a fresh session should read
  classify [file] [--assert-red]   Classify test output: real red vs missing-symbol
  help | version

Global: --root <dir>  operate on a project rooted elsewhere (default: cwd)`;

/** Injectable I/O — lets the whole CLI run (and be tested) without touching the process. */
export interface CliIO {
  cwd?: string;
  out?: (line: string) => void;
  err?: (line: string) => void;
  openBrowser?: (url: string) => void;
  readStdin?: () => Promise<string>;
}

interface Ctx {
  out: (line: string) => void;
  cwd: string;
  open: (url: string) => void;
  stdin: () => Promise<string>;
}

/** Signals a controlled failure with an exit code, instead of killing the process. */
class CliError extends Error {
  readonly code: number;
  constructor(message: string, code = 1) {
    super(message);
    this.code = code;
  }
}

function failWith(message: string): never {
  throw new CliError(message);
}

function defaultReadStdin(): Promise<string> {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) {
      resolve('');
      return;
    }
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => resolve(data));
  });
}

function asNodeType(value: string | undefined): NodeType {
  if (!value || !(NODE_TYPES as readonly string[]).includes(value)) {
    failWith(`--type must be one of: ${NODE_TYPES.join(', ')}`);
  }
  return value as NodeType;
}

function asNodeStatus(value: string | undefined): NodeStatus | undefined {
  if (value === undefined) return undefined;
  if (!(NODE_STATUSES as readonly string[]).includes(value)) {
    failWith(`--status must be one of: ${NODE_STATUSES.join(', ')}`);
  }
  return value as NodeStatus;
}

function asEdgeType(value: string | undefined): EdgeType {
  if (!value || !(EDGE_TYPES as readonly string[]).includes(value)) {
    failWith(`--type must be one of: ${EDGE_TYPES.join(', ')}`);
  }
  return value as EdgeType;
}

async function runStudio(store: CairnStore, flags: ParsedArgs['flags'], ctx: Ctx): Promise<void> {
  const interviewPath = str(flags, 'interview');
  if (!interviewPath) failWith('studio requires --interview <file.json>');
  const interview = JSON.parse(await readFile(interviewPath, 'utf8')) as Interview;
  validateInterview(interview); // fail fast on a malformed interview, in both modes

  if (flags.static) {
    const out = str(flags, 'out') ?? `${store.runtimeDir}/wizard.html`;
    await store.writeArtifact(out, renderWizard(interview, { mode: 'static' }));
    ctx.out(`Static wizard written to: ${out}`);
    ctx.out('Open it, answer the questions, click Export, and paste the JSON back to the agent.');
    return;
  }

  const handle = await startStudioSession({ interview, store, port: num(flags, 'port') ?? 0 });
  ctx.out(`🪨  Cairn Studio is live at ${handle.url}`);
  if (!flags['no-open']) ctx.open(handle.url);
  ctx.out('Waiting for you to finish in the browser…');
  ctx.out(JSON.stringify(await handle.finished));
}

async function runGraph(
  args: string[],
  flags: ParsedArgs['flags'],
  store: CairnStore,
  ctx: Ctx,
): Promise<void> {
  const sub = args[1] ?? 'show';
  if (sub === 'apply') {
    const opsPath = args[2] ?? str(flags, 'ops');
    if (!opsPath) failWith('graph apply requires <ops.json>');
    const ops = JSON.parse(await readFile(opsPath, 'utf8')) as GraphOps;
    ctx.out(JSON.stringify(await applyGraphOps(store, ops)));
    return;
  }
  if (sub === 'add') {
    const tags = str(flags, 'tags');
    const body = str(flags, 'body');
    const status = asNodeStatus(str(flags, 'status'));
    const result = await applyGraphOps(store, {
      nodes: [
        {
          type: asNodeType(str(flags, 'type')),
          title: str(flags, 'title') ?? failWith('graph add requires --title'),
          ...(body !== undefined ? { body } : {}),
          ...(status !== undefined ? { status } : {}),
          ...(tags ? { tags: tags.split(',').map((t) => t.trim()) } : {}),
        },
      ],
    });
    ctx.out(JSON.stringify(result));
    return;
  }
  if (sub === 'edge') {
    const note = str(flags, 'note');
    const result = await applyGraphOps(store, {
      edges: [
        {
          type: asEdgeType(str(flags, 'type')),
          from: str(flags, 'from') ?? failWith('graph edge requires --from'),
          to: str(flags, 'to') ?? failWith('graph edge requires --to'),
          ...(note !== undefined ? { note } : {}),
        },
      ],
    });
    ctx.out(JSON.stringify(result));
    return;
  }
  if (sub === 'set') {
    const id =
      args[2] ??
      `${asNodeType(str(flags, 'type'))}--${slugify(
        str(flags, 'title') ?? failWith('graph set requires <id> or --type and --title'),
      )}`;
    const status = asNodeStatus(str(flags, 'status'));
    const body = str(flags, 'body');
    if (status === undefined && body === undefined) {
      failWith('graph set requires --status and/or --body');
    }
    const graph = await store.loadGraph();
    graph.updateNode(id, {
      ...(status !== undefined ? { status } : {}),
      ...(body !== undefined ? { body } : {}),
    });
    await store.saveGraph(graph);
    ctx.out(`Updated ${id}`);
    return;
  }
  if (sub === 'show') {
    const graph = await store.loadGraph();
    const doc = graph.toJSON();
    ctx.out(renderMermaid(graph));
    if (doc.nodes.length > 0) {
      ctx.out('');
      for (const node of doc.nodes) {
        ctx.out(`  ${node.id}  [${node.status}]  ${node.title}`);
      }
    }
    ctx.out(`\n${doc.nodes.length} nodes, ${doc.edges.length} edges`);
    return;
  }
  failWith(`unknown graph subcommand: ${sub}`);
}

async function dispatch(argv: string[], ctx: Ctx): Promise<number> {
  const { _, flags } = parse(argv);
  const command = _[0] ?? 'help';
  const store = new CairnStore(str(flags, 'root') ?? ctx.cwd);

  switch (command) {
    case 'init':
      await initProject(store);
      ctx.out(`Initialized Cairn project brain at ${store.dir}`);
      return 0;
    case 'studio':
      await runStudio(store, flags, ctx);
      return 0;
    case 'ingest': {
      const path = _[1];
      if (!path) failWith('ingest requires <transcript.json>');
      const transcript = JSON.parse(await readFile(path, 'utf8')) as Transcript;
      ctx.out(`Saved transcript to ${await store.saveSession(transcript)}`);
      return 0;
    }
    case 'graph':
      await runGraph(_, flags, store, ctx);
      return 0;
    case 'resume':
      ctx.out(formatResume(await store.resumeBrief()));
      return 0;
    case 'classify': {
      const file = _[1];
      const output = file ? await readFile(file, 'utf8') : await ctx.stdin();
      const result = classifyTestFailure(output);
      ctx.out(JSON.stringify(result, null, 2));
      return flags['assert-red'] && !result.isRealRed ? 2 : 0;
    }
    case 'version':
      ctx.out(VERSION);
      return 0;
    default:
      ctx.out(HELP);
      return 0;
  }
}

/** Run the CLI with fully injectable I/O. Returns the process exit code. */
export async function runCli(argv: string[], io: CliIO = {}): Promise<number> {
  const ctx: Ctx = {
    out: io.out ?? ((line) => console.log(line)),
    cwd: io.cwd ?? process.cwd(),
    open: io.openBrowser ?? defaultOpenBrowser,
    stdin: io.readStdin ?? defaultReadStdin,
  };
  const err = io.err ?? ((line) => console.error(line));

  try {
    return await dispatch(argv, ctx);
  } catch (error) {
    if (error instanceof CliError) {
      err(`cairn: ${error.message}`);
      return error.code;
    }
    err(`cairn: ${error instanceof Error ? error.message : String(error)}`);
    return 1;
  }
}
