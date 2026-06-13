import { isLegalEdge } from './edge-rules.js';
import { makeEdgeId, makeNodeId } from './ids.js';
import {
  type CairnEdge,
  type CairnGraphOptions,
  type CairnNode,
  EDGE_TYPES,
  type GraphDoc,
  NODE_STATUSES,
  NODE_TYPES,
  type NeighborOptions,
  type NewEdge,
  type NewNode,
  type NodeStatus,
  type QueryFilter,
} from './types.js';

/**
 * The Cairn knowledge graph: typed nodes connected by typed edges, with
 * integrity invariants enforced at every mutation.
 *
 * Pure and deterministic — the only ambient inputs (a clock and the session id)
 * are injected, so the same operations always produce the same committed graph.
 */
export class CairnGraph {
  private readonly nodes = new Map<string, CairnNode>();
  private readonly edges: CairnEdge[] = [];
  private readonly edgeIds = new Set<string>();
  private readonly now: () => string;
  private readonly session: string;

  constructor(options: CairnGraphOptions = {}) {
    this.now = options.now ?? (() => new Date().toISOString());
    this.session = options.session ?? 'unknown';
  }

  addNode(input: NewNode): CairnNode {
    const id = makeNodeId(input.type, input.title, this.nodes);
    const node: CairnNode = {
      id,
      type: input.type,
      title: input.title,
      body: input.body ?? '',
      status: input.status ?? 'open',
      tags: input.tags ? [...input.tags] : [],
      createdInSession: this.session,
      createdAt: this.now(),
    };
    this.nodes.set(id, node);
    return this.copyNode(node);
  }

  addEdge(input: NewEdge): CairnEdge {
    const from = this.nodes.get(input.from);
    const to = this.nodes.get(input.to);
    if (!from || !to) {
      const missing = from ? input.to : input.from;
      throw new Error(`Cairn edge endpoint not found: "${missing}"`);
    }
    if (!isLegalEdge(input.type, from.type, to.type)) {
      throw new Error(
        `Cairn illegal edge: "${input.type}" is not allowed from ${from.type} to ${to.type}`,
      );
    }
    const edge: CairnEdge = {
      id: makeEdgeId(input.type, input.from, input.to),
      type: input.type,
      from: input.from,
      to: input.to,
      ...(input.note !== undefined ? { note: input.note } : {}),
    };
    if (!this.edgeIds.has(edge.id)) {
      this.edges.push(edge);
      this.edgeIds.add(edge.id);
    }
    return { ...edge };
  }

  getNode(id: string): CairnNode | undefined {
    const node = this.nodes.get(id);
    return node ? this.copyNode(node) : undefined;
  }

  /** Update mutable fields of an existing node (status/body). Identity is immutable. */
  updateNode(id: string, patch: { status?: NodeStatus; body?: string }): CairnNode {
    const node = this.nodes.get(id);
    if (!node) {
      throw new Error(`Cairn updateNode: node not found: "${id}"`);
    }
    if (patch.status !== undefined) node.status = patch.status;
    if (patch.body !== undefined) node.body = patch.body;
    return this.copyNode(node);
  }

  /** Retire `oldId` in favour of `newId`. Nodes are never deleted — only superseded. */
  supersede(oldId: string, newId: string): void {
    const oldNode = this.nodes.get(oldId);
    const newNode = this.nodes.get(newId);
    if (!oldNode || !newNode) {
      const missing = oldNode ? newId : oldId;
      throw new Error(`Cairn supersede: node not found: "${missing}"`);
    }
    oldNode.status = 'superseded';
    oldNode.supersededBy = newId;
    this.addEdge({ type: 'supersedes', from: newId, to: oldId });
  }

  query(filter: QueryFilter = {}): CairnNode[] {
    const wantSuperseded = (filter.includeSuperseded ?? false) || filter.status === 'superseded';
    const out: CairnNode[] = [];
    for (const node of this.nodes.values()) {
      if (!wantSuperseded && node.status === 'superseded') continue;
      if (filter.type && node.type !== filter.type) continue;
      if (filter.status && node.status !== filter.status) continue;
      if (filter.tag && !node.tags.includes(filter.tag)) continue;
      out.push(this.copyNode(node));
    }
    return out;
  }

  neighbors(id: string, opts: NeighborOptions = {}): CairnNode[] {
    const direction = opts.direction ?? 'out';
    const out: CairnNode[] = [];
    const seen = new Set<string>();
    for (const edge of this.edges) {
      if (opts.edge && edge.type !== opts.edge) continue;
      let neighborId: string | undefined;
      if (direction === 'out' && edge.from === id) neighborId = edge.to;
      else if (direction === 'in' && edge.to === id) neighborId = edge.from;
      if (!neighborId || seen.has(neighborId)) continue;
      const node = this.nodes.get(neighborId);
      if (node) {
        out.push(this.copyNode(node));
        seen.add(neighborId);
      }
    }
    return out;
  }

  openQuestions(): CairnNode[] {
    return this.query({ type: 'question', status: 'open' });
  }

  /** All edges, copied. */
  allEdges(): CairnEdge[] {
    return this.edges.map((edge) => ({ ...edge }));
  }

  toJSON(): GraphDoc {
    return {
      version: 1,
      nodes: [...this.nodes.values()].map((node) => this.copyNode(node)),
      edges: this.allEdges(),
    };
  }

  static fromJSON(doc: GraphDoc, options?: CairnGraphOptions): CairnGraph {
    CairnGraph.validate(doc);
    const graph = new CairnGraph(options);
    for (const node of doc.nodes) {
      graph.nodes.set(node.id, graph.copyNode(node));
    }
    for (const edge of doc.edges) {
      graph.edges.push({ ...edge });
      graph.edgeIds.add(edge.id);
    }
    return graph;
  }

  private copyNode(node: CairnNode): CairnNode {
    return {
      id: node.id,
      type: node.type,
      title: node.title,
      body: node.body,
      status: node.status,
      tags: [...node.tags],
      createdInSession: node.createdInSession,
      createdAt: node.createdAt,
      ...(node.supersededBy !== undefined ? { supersededBy: node.supersededBy } : {}),
    };
  }

  /** Reject any document that violates a graph invariant. Never load a corrupt brain. */
  private static validate(doc: GraphDoc): void {
    if (!doc || doc.version !== 1 || !Array.isArray(doc.nodes) || !Array.isArray(doc.edges)) {
      throw new Error('Cairn graph integrity error: malformed document');
    }
    const byId = new Map<string, CairnNode>();
    for (const node of doc.nodes) {
      const validType = (NODE_TYPES as readonly string[]).includes(node?.type);
      const validStatus = (NODE_STATUSES as readonly string[]).includes(node?.status);
      if (!node || typeof node.id !== 'string' || !validType || !validStatus) {
        throw new Error(`Cairn graph integrity error: malformed node "${node?.id ?? '?'}"`);
      }
      if (byId.has(node.id)) {
        throw new Error(`Cairn graph integrity error: duplicate node id "${node.id}"`);
      }
      byId.set(node.id, node);
    }
    for (const edge of doc.edges) {
      if (!edge || !(EDGE_TYPES as readonly string[]).includes(edge.type)) {
        throw new Error(`Cairn graph integrity error: malformed edge "${edge?.id ?? '?'}"`);
      }
      const from = byId.get(edge.from);
      const to = byId.get(edge.to);
      if (!from || !to) {
        const missing = from ? edge.to : edge.from;
        throw new Error(
          `Cairn graph integrity error: edge "${edge.id}" references missing endpoint "${missing}"`,
        );
      }
      if (!isLegalEdge(edge.type, from.type, to.type)) {
        throw new Error(
          `Cairn graph integrity error: illegal edge "${edge.id}" (${edge.type} from ${from.type} to ${to.type})`,
        );
      }
    }
  }
}
