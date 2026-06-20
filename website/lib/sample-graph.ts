/**
 * A self-contained sample knowledge graph for the interactive playground.
 *
 * Standalone by design — the website is not part of the workspace, so the node
 * and edge types are inlined here rather than imported from @cairn/core. The
 * shape mirrors the engine exactly, and positions are fixed so the layout is
 * deterministic (no layout library, no randomness).
 */

export type NodeType =
  | 'goal'
  | 'requirement'
  | 'decision'
  | 'component'
  | 'constraint'
  | 'question'
  | 'risk'
  | 'test'
  | 'artifact';

export type EdgeType =
  | 'refines'
  | 'depends_on'
  | 'decided_by'
  | 'implements'
  | 'tests'
  | 'blocks'
  | 'supersedes'
  | 'derived_from';

export type NodeStatus = 'open' | 'accepted' | 'done' | 'superseded';

export type GraphNode = {
  id: string;
  type: NodeType;
  title: string;
  body: string;
  status: NodeStatus;
  x: number;
  y: number;
};

export type GraphEdge = { type: EdgeType; from: string; to: string };

export const TYPE_META: Record<NodeType, { color: string; blurb: string }> = {
  goal: { color: '#15803d', blurb: 'Why we are building it' },
  requirement: { color: '#16a34a', blurb: 'What it must do' },
  decision: { color: '#0f766e', blurb: 'A choice made, with rationale' },
  component: { color: '#047857', blurb: 'A thing to build' },
  constraint: { color: '#b4530a', blurb: 'A limit: tech, policy, time' },
  question: { color: '#b45309', blurb: 'Something still undecided' },
  risk: { color: '#be123c', blurb: 'A known danger' },
  test: { color: '#4d7c0f', blurb: 'Proof a unit behaves' },
  artifact: { color: '#0d9488', blurb: 'A produced output' },
};

export const NODE_TYPES = Object.keys(TYPE_META) as NodeType[];

export const VIEWBOX = { w: 760, h: 560 } as const;

export const SAMPLE_NODES: GraphNode[] = [
  {
    id: 'goal--reduce-checkout-abandonment',
    type: 'goal',
    title: 'Reduce checkout abandonment',
    body: 'Fewer shoppers drop out between cart and confirmation. The north star this whole brain refines.',
    status: 'accepted',
    x: 380,
    y: 56,
  },
  {
    id: 'requirement--one-page-checkout',
    type: 'requirement',
    title: 'One-page checkout',
    body: 'Address, shipping and payment collapse into a single, streaming page.',
    status: 'accepted',
    x: 232,
    y: 154,
  },
  {
    id: 'requirement--guest-checkout',
    type: 'requirement',
    title: 'Guest checkout',
    body: 'No account required to buy; offer to save details after the purchase.',
    status: 'accepted',
    x: 548,
    y: 150,
  },
  {
    id: 'decision--next-js-app-router',
    type: 'decision',
    title: 'Next.js App Router',
    body: 'RSC streaming and team familiarity. Server-first by default.',
    status: 'accepted',
    x: 118,
    y: 256,
  },
  {
    id: 'decision--stripe-as-the-psp',
    type: 'decision',
    title: 'Stripe as the PSP',
    body: 'Payment Element + webhooks; revisit if fees or coverage become a problem.',
    status: 'accepted',
    x: 318,
    y: 258,
  },
  {
    id: 'component--cartsummary',
    type: 'component',
    title: 'CartSummary',
    body: 'Line items, totals and promo state. Pure presentation over injected data.',
    status: 'done',
    x: 572,
    y: 264,
  },
  {
    id: 'component--paymentform',
    type: 'component',
    title: 'PaymentForm',
    body: 'Collects and validates payment; mounts the Stripe Payment Element.',
    status: 'open',
    x: 330,
    y: 372,
  },
  {
    id: 'constraint--wcag-aa-accessibility',
    type: 'constraint',
    title: 'WCAG AA accessibility',
    body: 'Labelled controls, visible focus, AA contrast. A hard gate, not a polish pass.',
    status: 'accepted',
    x: 108,
    y: 372,
  },
  {
    id: 'artifact--checkout-flow-tsx',
    type: 'artifact',
    title: 'checkout-flow.tsx',
    body: 'The shipped route that composes CartSummary and PaymentForm.',
    status: 'done',
    x: 556,
    y: 392,
  },
  {
    id: 'test--paymentform-validates-card-input',
    type: 'test',
    title: 'PaymentForm validates card input',
    body: 'Built test-first: a real assertion red before a line of implementation.',
    status: 'done',
    x: 176,
    y: 474,
  },
  {
    id: 'question--express-checkout-in-v1',
    type: 'question',
    title: 'Express checkout in v1?',
    body: 'Apple Pay / Google Pay at launch, or fast-follow? Still open.',
    status: 'open',
    x: 366,
    y: 486,
  },
  {
    id: 'risk--psp-latency-spikes-at-peak',
    type: 'risk',
    title: 'PSP latency spikes at peak',
    body: 'Payment confirmation may slow under Black-Friday load; needs a timeout + retry.',
    status: 'open',
    x: 600,
    y: 478,
  },
];

export const SAMPLE_EDGES: GraphEdge[] = [
  { type: 'refines', from: 'requirement--one-page-checkout', to: 'goal--reduce-checkout-abandonment' },
  { type: 'refines', from: 'requirement--guest-checkout', to: 'goal--reduce-checkout-abandonment' },
  { type: 'decided_by', from: 'requirement--one-page-checkout', to: 'decision--next-js-app-router' },
  { type: 'decided_by', from: 'requirement--one-page-checkout', to: 'decision--stripe-as-the-psp' },
  { type: 'implements', from: 'component--paymentform', to: 'requirement--one-page-checkout' },
  { type: 'implements', from: 'component--cartsummary', to: 'requirement--one-page-checkout' },
  { type: 'depends_on', from: 'component--paymentform', to: 'component--cartsummary' },
  { type: 'blocks', from: 'constraint--wcag-aa-accessibility', to: 'component--paymentform' },
  { type: 'tests', from: 'test--paymentform-validates-card-input', to: 'component--paymentform' },
  { type: 'implements', from: 'artifact--checkout-flow-tsx', to: 'component--paymentform' },
  { type: 'blocks', from: 'question--express-checkout-in-v1', to: 'component--paymentform' },
  { type: 'blocks', from: 'risk--psp-latency-spikes-at-peak', to: 'component--paymentform' },
];

/** Mirror of the engine's Mermaid id: `n_` + non-alphanumerics → `_`. */
export function mermaidId(id: string): string {
  return `n_${id.replace(/[^a-zA-Z0-9]/g, '_')}`;
}

/** Render nodes + edges as a Mermaid flowchart — byte-compatible with `renderMermaid`. */
export function renderMermaid(nodes: GraphNode[], edges: GraphEdge[]): string {
  const live = nodes.filter((n) => n.status !== 'superseded');
  const liveIds = new Set(live.map((n) => n.id));
  const lines = ['flowchart TD'];
  for (const node of live) {
    lines.push(`  ${mermaidId(node.id)}["${`${node.type}: ${node.title}`.replace(/"/g, "'")}"]`);
  }
  for (const edge of edges) {
    if (!liveIds.has(edge.from) || !liveIds.has(edge.to)) continue;
    lines.push(`  ${mermaidId(edge.from)} -->|${edge.type}| ${mermaidId(edge.to)}`);
  }
  return lines.join('\n');
}
