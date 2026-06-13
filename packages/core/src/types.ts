/**
 * Cairn graph type contracts.
 *
 * The graph is the project "brain": typed nodes connected by typed edges.
 * Everything here is data — pure, serializable, and committed to `.cairn/`.
 */

export const NODE_TYPES = [
  'goal',
  'requirement',
  'decision',
  'component',
  'constraint',
  'question',
  'risk',
  'test',
  'artifact',
] as const;

export type NodeType = (typeof NODE_TYPES)[number];

export const EDGE_TYPES = [
  'refines',
  'depends_on',
  'decided_by',
  'implements',
  'tests',
  'blocks',
  'supersedes',
  'derived_from',
] as const;

export type EdgeType = (typeof EDGE_TYPES)[number];

export const NODE_STATUSES = ['open', 'accepted', 'done', 'superseded'] as const;

export type NodeStatus = (typeof NODE_STATUSES)[number];

/** A single fact, decision, or unit of work in the project brain. */
export interface CairnNode {
  id: string;
  type: NodeType;
  title: string;
  body: string;
  status: NodeStatus;
  tags: string[];
  createdInSession: string;
  createdAt: string;
  /** Set only when this node has been retired by another node. */
  supersededBy?: string;
}

/** A typed, directed relationship between two nodes. */
export interface CairnEdge {
  id: string;
  type: EdgeType;
  from: string;
  to: string;
  note?: string;
}

/** Caller-supplied fields for a new node. Id/timestamp/session are assigned by the graph. */
export interface NewNode {
  type: NodeType;
  title: string;
  body?: string;
  status?: NodeStatus;
  tags?: string[];
}

/** Caller-supplied fields for a new edge. */
export interface NewEdge {
  type: EdgeType;
  from: string;
  to: string;
  note?: string;
}

/** The serialized graph document persisted to `.cairn/graph.json`. */
export interface GraphDoc {
  version: 1;
  nodes: CairnNode[];
  edges: CairnEdge[];
}

/** A component with its resolved dependency context, for the resume brief. */
export interface ComponentBrief {
  node: CairnNode;
  status: NodeStatus;
  dependsOn: string[];
}

/**
 * The structured brief a fresh, context-free session reads to "remember" the project.
 * This shape is stable and consumed identically by every Cairn skill.
 */
export interface ResumeBrief {
  goals: CairnNode[];
  acceptedDecisions: CairnNode[];
  openQuestions: CairnNode[];
  components: ComponentBrief[];
  risks: CairnNode[];
  nextActions: string[];
}

export interface CairnGraphOptions {
  /** Injected ISO-timestamp source — keeps the engine pure and deterministic. */
  now?: () => string;
  /** Session id stamped onto nodes created through this instance. */
  session?: string;
}

export interface QueryFilter {
  type?: NodeType;
  status?: NodeStatus;
  tag?: string;
  /** When false (default), superseded nodes are excluded. */
  includeSuperseded?: boolean;
}

export interface NeighborOptions {
  /** Restrict to a single edge type. */
  edge?: EdgeType;
  /** 'out' follows edges from→to (default), 'in' follows to→from. */
  direction?: 'out' | 'in';
}
