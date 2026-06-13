#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  EDGE_TYPES,
  type EdgeType,
  NODE_STATUSES,
  NODE_TYPES,
  type NodeStatus,
  type NodeType,
  classifyTestFailure,
  renderMermaid,
} from '@cairn/core';
import { type Interview, type Transcript, renderWizard } from '@cairn/studio';
import {
  type GraphOps,
  applyGraphOps,
  formatResume,
  initProject,
  startStudioSession,
} from './commands.js';
import { openBrowser } from './open.js';
import { CairnStore } from './store.js';

const VERSION = '0.1.0';

const HELP = `🪨  cairn — give your agent continuity

Usage: cairn <command> [options]

Commands:
  init                         Create the project brain in ./.cairn
  studio --interview <file>    Run a live brainstorming session in the browser
         [--static] [--out f]    ...or render a static wizard for headless use
         [--port N] [--no-open]
  ingest <transcript.json>     Save a finished interview transcript
  graph apply <ops.json>       Apply a batch of nodes/edges (the agent's synthesis)
  graph add --type T --title "..."   Add a single node
  graph edge --type T --from id --to id   Connect two nodes
  graph show                   Print the project graph (Mermaid + counts)
  resume                       Print the context a fresh session should read
  classify [file] [--assert-red]   Classify test output: real red vs missing-symbol
  help | version

Global: --root <dir>  operate on a project rooted elsewhere (default: cwd)`;

interface Parsed {
  _: string[];
  flags: Record<string, string | boolean>;
}

function parse(argv: string[]): Parsed {
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === undefined) continue;
    if (token.startsWith('--')) {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('--')) {
        flags[key] = next;
        i += 1;
      } else {
        flags[key] = true;
      }
    } else {
      positional.push(token);
    }
  }
  return { _: positional, flags };
}

function str(flags: Record<string, string | boolean>, key: string): string | undefined {
  const value = flags[key];
  return typeof value === 'string' ? value : undefined;
}

function num(flags: Record<string, string | boolean>, key: string): number | undefined {
  const value = str(flags, key);
  if (value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function fail(message: string): never {
  console.error(`cairn: ${message}`);
  process.exit(1);
}

function readStdin(): Promise<string> {
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
    fail(`--type must be one of: ${NODE_TYPES.join(', ')}`);
  }
  return value as NodeType;
}

function asNodeStatus(value: string | undefined): NodeStatus | undefined {
  if (value === undefined) return undefined;
  if (!(NODE_STATUSES as readonly string[]).includes(value)) {
    fail(`--status must be one of: ${NODE_STATUSES.join(', ')}`);
  }
  return value as NodeStatus;
}

function asEdgeType(value: string | undefined): EdgeType {
  if (!value || !(EDGE_TYPES as readonly string[]).includes(value)) {
    fail(`--type must be one of: ${EDGE_TYPES.join(', ')}`);
  }
  return value as EdgeType;
}

async function runStudio(store: CairnStore, flags: Parsed['flags']): Promise<void> {
  const interviewPath = str(flags, 'interview');
  if (!interviewPath) fail('studio requires --interview <file.json>');
  const interview = JSON.parse(await readFile(interviewPath, 'utf8')) as Interview;

  if (flags.static) {
    const out = str(flags, 'out') ?? join(store.runtimeDir, 'wizard.html');
    await store.writeArtifact(out, renderWizard(interview, { mode: 'static' }));
    console.log(`Static wizard written to: ${out}`);
    console.log(
      'Open it, answer the questions, click Export, and paste the JSON back to the agent.',
    );
    return;
  }

  const handle = await startStudioSession({ interview, store, port: num(flags, 'port') ?? 0 });
  console.log(`🪨  Cairn Studio is live at ${handle.url}`);
  if (!flags['no-open']) openBrowser(handle.url);
  console.log('Waiting for you to finish in the browser…');
  const result = await handle.finished;
  console.log(JSON.stringify(result));
}

async function runGraph(args: string[], flags: Parsed['flags'], store: CairnStore): Promise<void> {
  const sub = args[1] ?? 'show';
  if (sub === 'apply') {
    const opsPath = args[2] ?? str(flags, 'ops');
    if (!opsPath) fail('graph apply requires <ops.json>');
    const ops = JSON.parse(await readFile(opsPath, 'utf8')) as GraphOps;
    console.log(JSON.stringify(await applyGraphOps(store, ops)));
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
          title: str(flags, 'title') ?? fail('graph add requires --title'),
          ...(body !== undefined ? { body } : {}),
          ...(status !== undefined ? { status } : {}),
          ...(tags ? { tags: tags.split(',').map((t) => t.trim()) } : {}),
        },
      ],
    });
    console.log(JSON.stringify(result));
    return;
  }
  if (sub === 'edge') {
    const note = str(flags, 'note');
    const result = await applyGraphOps(store, {
      edges: [
        {
          type: asEdgeType(str(flags, 'type')),
          from: str(flags, 'from') ?? fail('graph edge requires --from'),
          to: str(flags, 'to') ?? fail('graph edge requires --to'),
          ...(note !== undefined ? { note } : {}),
        },
      ],
    });
    console.log(JSON.stringify(result));
    return;
  }
  if (sub === 'show') {
    const graph = await store.loadGraph();
    const doc = graph.toJSON();
    console.log(renderMermaid(graph));
    console.log(`\n${doc.nodes.length} nodes, ${doc.edges.length} edges`);
    return;
  }
  fail(`unknown graph subcommand: ${sub}`);
}

async function main(): Promise<void> {
  const { _, flags } = parse(process.argv.slice(2));
  const command = _[0] ?? 'help';
  const store = new CairnStore(str(flags, 'root') ?? process.cwd());

  switch (command) {
    case 'init':
      await initProject(store);
      console.log(`Initialized Cairn project brain at ${store.dir}`);
      break;
    case 'studio':
      await runStudio(store, flags);
      break;
    case 'ingest': {
      const path = _[1];
      if (!path) fail('ingest requires <transcript.json>');
      const transcript = JSON.parse(await readFile(path, 'utf8')) as Transcript;
      console.log(`Saved transcript to ${await store.saveSession(transcript)}`);
      break;
    }
    case 'graph':
      await runGraph(_, flags, store);
      break;
    case 'resume':
      console.log(formatResume(await store.resumeBrief()));
      break;
    case 'classify': {
      const file = _[1];
      const output = file ? await readFile(file, 'utf8') : await readStdin();
      const result = classifyTestFailure(output);
      console.log(JSON.stringify(result, null, 2));
      // For scripting the TDD guarantee: exit non-zero unless this is a real red.
      if (flags['assert-red'] && !result.isRealRed) process.exit(2);
      break;
    }
    case 'version':
      console.log(VERSION);
      break;
    default:
      console.log(HELP);
  }
}

main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error));
});
