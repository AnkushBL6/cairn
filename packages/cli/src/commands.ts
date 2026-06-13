import type { CairnNode, EdgeType, NewNode, ResumeBrief } from '@cairn/core';
import { type Interview, StudioServer, validateInterview } from '@cairn/studio';
import type { CairnStore } from './store.js';

/** A node op may carry a temporary `ref` so edges can point at not-yet-created nodes. */
export type NodeOp = NewNode & { ref?: string };

export interface EdgeOp {
  type: EdgeType;
  from: string;
  to: string;
  note?: string;
}

/** A batch of graph mutations the agent synthesizes from an interview transcript. */
export interface GraphOps {
  nodes?: NodeOp[];
  edges?: EdgeOp[];
}

export interface ApplyResult {
  refs: Record<string, string>;
  createdNodes: number;
  createdEdges: number;
}

/** Initialize an empty project brain. */
export async function initProject(store: CairnStore): Promise<void> {
  if (store.exists()) return;
  await store.saveGraph(await store.loadGraph());
}

/**
 * Apply a batch of node/edge mutations atomically: load → mutate → persist.
 * Edge endpoints may reference either a real node id or a `ref` alias declared
 * on a node in the same batch.
 */
export async function applyGraphOps(store: CairnStore, ops: GraphOps): Promise<ApplyResult> {
  const graph = await store.loadGraph();
  const refs: Record<string, string> = {};
  let createdNodes = 0;
  let createdEdges = 0;

  for (const op of ops.nodes ?? []) {
    const { ref, ...input } = op;
    const node: CairnNode = graph.addNode(input);
    if (ref) refs[ref] = node.id;
    createdNodes += 1;
  }

  for (const edge of ops.edges ?? []) {
    graph.addEdge({
      type: edge.type,
      from: refs[edge.from] ?? edge.from,
      to: refs[edge.to] ?? edge.to,
      ...(edge.note !== undefined ? { note: edge.note } : {}),
    });
    createdEdges += 1;
  }

  await store.saveGraph(graph);
  return { refs, createdNodes, createdEdges };
}

export interface StudioSessionOptions {
  interview: Interview;
  store: CairnStore;
  host?: string;
  port?: number;
}

export interface StudioSessionHandle {
  url: string;
  port: number;
  /** Resolves once the user finishes; the transcript is saved to `.cairn/sessions/`. */
  finished: Promise<{ transcriptPath: string; sessionId: string }>;
  stop: () => Promise<void>;
}

/**
 * Start a live brainstorming session. The caller opens `url` in a browser; when
 * the user finishes, the transcript is persisted and `finished` resolves.
 */
export async function startStudioSession(
  options: StudioSessionOptions,
): Promise<StudioSessionHandle> {
  validateInterview(options.interview);
  const server = new StudioServer(options.interview, {
    host: options.host ?? '127.0.0.1',
    port: options.port ?? 0,
  });
  const { url, port } = await server.start();

  const finished = server.waitForFinish().then(async (transcript) => {
    const transcriptPath = await options.store.saveSession(transcript);
    await server.stop();
    return { transcriptPath, sessionId: transcript.sessionId };
  });

  return { url, port, finished, stop: () => server.stop() };
}

/** Render a resume brief as the readable summary a fresh session reads first. */
export function formatResume(brief: ResumeBrief): string {
  const lines: string[] = ['🪨  Cairn — resuming project context', ''];

  section(
    lines,
    'Goals',
    brief.goals.map((g) => g.title),
  );
  section(
    lines,
    'Accepted decisions',
    brief.acceptedDecisions.map((d) => (d.body ? `${d.title} — ${d.body}` : d.title)),
  );
  section(
    lines,
    'Components',
    brief.components.map((c) => {
      const deps = c.dependsOn.length ? ` (depends on: ${c.dependsOn.join(', ')})` : '';
      return `[${c.status}] ${c.node.title}${deps}`;
    }),
  );
  section(
    lines,
    'Open questions',
    brief.openQuestions.map((q) => q.title),
  );
  section(
    lines,
    'Risks',
    brief.risks.map((r) => r.title),
  );
  section(lines, 'Suggested next actions', brief.nextActions);

  if (lines.length === 2) {
    lines.push('No project brain found yet. Run a brainstorming session to create one.');
  }
  return lines.join('\n');
}

function section(lines: string[], heading: string, items: string[]): void {
  if (items.length === 0) return;
  lines.push(`## ${heading}`);
  for (const item of items) {
    lines.push(`  • ${item}`);
  }
  lines.push('');
}
