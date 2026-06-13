import { describe, expect, it } from 'vitest';
import { CairnGraph } from '../src/graph.js';

const FIXED_NOW = '2026-06-13T00:00:00.000Z';

function newGraph(): CairnGraph {
  return new CairnGraph({ now: () => FIXED_NOW, session: 'test-session' });
}

describe('CairnGraph — nodes', () => {
  it('starts empty', () => {
    const g = newGraph();
    expect(g.query({})).toEqual([]);
    expect(g.toJSON().nodes).toEqual([]);
    expect(g.toJSON().edges).toEqual([]);
  });

  it('assigns a deterministic, slug-based id from type + title', () => {
    const g = newGraph();
    const node = g.addNode({ type: 'goal', title: 'Ship Cairn v1!' });
    expect(node.id).toBe('goal--ship-cairn-v1');
  });

  it('defaults status to open, body to empty, tags to empty, and stamps clock + session', () => {
    const g = newGraph();
    const node = g.addNode({ type: 'requirement', title: 'Persist graph' });
    expect(node.status).toBe('open');
    expect(node.body).toBe('');
    expect(node.tags).toEqual([]);
    expect(node.createdAt).toBe(FIXED_NOW);
    expect(node.createdInSession).toBe('test-session');
    expect(node.supersededBy).toBeUndefined();
  });

  it('honors caller-supplied status, body, and tags', () => {
    const g = newGraph();
    const node = g.addNode({
      type: 'decision',
      title: 'Use pnpm',
      body: 'Faster, monorepo-native.',
      status: 'accepted',
      tags: ['tooling'],
    });
    expect(node.status).toBe('accepted');
    expect(node.body).toBe('Faster, monorepo-native.');
    expect(node.tags).toEqual(['tooling']);
  });

  it('disambiguates colliding ids deterministically', () => {
    const g = newGraph();
    const a = g.addNode({ type: 'requirement', title: 'Persist graph' });
    const b = g.addNode({ type: 'requirement', title: 'Persist graph' });
    expect(a.id).toBe('requirement--persist-graph');
    expect(b.id).toBe('requirement--persist-graph--2');
  });

  it('retrieves a node by id and returns undefined for unknown ids', () => {
    const g = newGraph();
    const node = g.addNode({ type: 'goal', title: 'Continuity' });
    expect(g.getNode(node.id)?.title).toBe('Continuity');
    expect(g.getNode('nope')).toBeUndefined();
  });
});

describe('CairnGraph — edges & integrity', () => {
  it('connects two existing nodes with a legal edge', () => {
    const g = newGraph();
    const goal = g.addNode({ type: 'goal', title: 'Continuity' });
    const req = g.addNode({ type: 'requirement', title: 'Reload graph on resume' });
    const edge = g.addEdge({ type: 'refines', from: req.id, to: goal.id });
    expect(edge.from).toBe(req.id);
    expect(edge.to).toBe(goal.id);
    expect(edge.type).toBe('refines');
  });

  it('rejects an edge whose endpoint does not exist', () => {
    const g = newGraph();
    const goal = g.addNode({ type: 'goal', title: 'Continuity' });
    expect(() => g.addEdge({ type: 'refines', from: 'ghost', to: goal.id })).toThrow(/endpoint/i);
  });

  it('rejects an edge type that is illegal for the node-type pair', () => {
    const g = newGraph();
    const a = g.addNode({ type: 'goal', title: 'A' });
    const b = g.addNode({ type: 'goal', title: 'B' });
    // depends_on is only legal component -> component
    expect(() => g.addEdge({ type: 'depends_on', from: a.id, to: b.id })).toThrow(/illegal/i);
  });
});

describe('CairnGraph — query & traversal', () => {
  it('filters by type, status, and tag', () => {
    const g = newGraph();
    g.addNode({ type: 'requirement', title: 'R1', tags: ['core'] });
    g.addNode({ type: 'requirement', title: 'R2', status: 'done' });
    g.addNode({ type: 'component', title: 'C1', tags: ['core'] });

    expect(g.query({ type: 'requirement' }).map((n) => n.title)).toEqual(['R1', 'R2']);
    expect(g.query({ status: 'done' }).map((n) => n.title)).toEqual(['R2']);
    expect(g.query({ tag: 'core' }).map((n) => n.title)).toEqual(['R1', 'C1']);
  });

  it('traverses neighbors by edge direction', () => {
    const g = newGraph();
    const c1 = g.addNode({ type: 'component', title: 'C1' });
    const c2 = g.addNode({ type: 'component', title: 'C2' });
    g.addEdge({ type: 'depends_on', from: c1.id, to: c2.id });

    expect(g.neighbors(c1.id, { direction: 'out' }).map((n) => n.id)).toEqual([c2.id]);
    expect(g.neighbors(c2.id, { direction: 'in' }).map((n) => n.id)).toEqual([c1.id]);
    expect(g.neighbors(c2.id, { direction: 'out' })).toEqual([]);
  });

  it('lists only open questions', () => {
    const g = newGraph();
    g.addNode({ type: 'question', title: 'Q-open' });
    g.addNode({ type: 'question', title: 'Q-done', status: 'done' });
    g.addNode({ type: 'requirement', title: 'not a question' });
    expect(g.openQuestions().map((n) => n.title)).toEqual(['Q-open']);
  });
});

describe('CairnGraph — supersede (never delete)', () => {
  it('retires the old node, links it, and excludes it from default queries', () => {
    const g = newGraph();
    const oldD = g.addNode({ type: 'decision', title: 'Use REST' });
    const newD = g.addNode({ type: 'decision', title: 'Use tRPC' });
    g.supersede(oldD.id, newD.id);

    const retired = g.getNode(oldD.id);
    expect(retired?.status).toBe('superseded');
    expect(retired?.supersededBy).toBe(newD.id);
    // default query excludes superseded
    expect(g.query({ type: 'decision' }).map((n) => n.id)).toEqual([newD.id]);
    // but it is retained for the audit trail
    expect(g.query({ type: 'decision', includeSuperseded: true })).toHaveLength(2);
    // and a supersedes edge now exists
    expect(g.neighbors(newD.id, { edge: 'supersedes', direction: 'out' }).map((n) => n.id)).toEqual([
      oldD.id,
    ]);
  });

  it('throws when superseding across mismatched ids', () => {
    const g = newGraph();
    const d = g.addNode({ type: 'decision', title: 'D' });
    expect(() => g.supersede('ghost', d.id)).toThrow(/not found/i);
  });
});

describe('CairnGraph — serialization', () => {
  it('round-trips through JSON preserving nodes and edges', () => {
    const g = newGraph();
    const goal = g.addNode({ type: 'goal', title: 'Continuity' });
    const req = g.addNode({ type: 'requirement', title: 'Resume' });
    g.addEdge({ type: 'refines', from: req.id, to: goal.id });

    const doc = g.toJSON();
    const restored = CairnGraph.fromJSON(doc);
    expect(restored.toJSON()).toEqual(doc);
    expect(restored.getNode(goal.id)?.title).toBe('Continuity');
  });

  it('refuses to load a corrupt document (dangling edge endpoint)', () => {
    const doc = {
      version: 1 as const,
      nodes: [
        {
          id: 'goal--a',
          type: 'goal' as const,
          title: 'A',
          body: '',
          status: 'open' as const,
          tags: [],
          createdInSession: 's',
          createdAt: FIXED_NOW,
        },
      ],
      edges: [{ id: 'e1', type: 'refines' as const, from: 'requirement--ghost', to: 'goal--a' }],
    };
    expect(() => CairnGraph.fromJSON(doc)).toThrow(/endpoint|integrity/i);
  });

  it('continues id disambiguation correctly after loading existing nodes', () => {
    const g = newGraph();
    g.addNode({ type: 'requirement', title: 'Persist graph' });
    const restored = CairnGraph.fromJSON(g.toJSON(), { now: () => FIXED_NOW, session: 's2' });
    const next = restored.addNode({ type: 'requirement', title: 'Persist graph' });
    expect(next.id).toBe('requirement--persist-graph--2');
  });
});
