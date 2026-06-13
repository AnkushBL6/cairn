import { describe, expect, it } from 'vitest';
import { CairnGraph } from '../src/graph.js';
import { renderDesignDoc, renderMermaid } from '../src/render.js';

const FIXED_NOW = '2026-06-13T00:00:00.000Z';

function sampleGraph(): CairnGraph {
  const g = new CairnGraph({ now: () => FIXED_NOW, session: 's' });
  const goal = g.addNode({ type: 'goal', title: 'Continuity' });
  const req = g.addNode({ type: 'requirement', title: 'Reload on resume' });
  g.addEdge({ type: 'refines', from: req.id, to: goal.id });
  const oldD = g.addNode({ type: 'decision', title: 'Old idea' });
  const newD = g.addNode({ type: 'decision', title: 'New idea' });
  g.supersede(oldD.id, newD.id);
  return g;
}

describe('renderMermaid', () => {
  it('produces a flowchart with live nodes and labelled edges', () => {
    const mmd = renderMermaid(sampleGraph());
    expect(mmd).toMatch(/^flowchart TD/);
    expect(mmd).toContain('goal: Continuity');
    expect(mmd).toContain('-->|refines|');
  });

  it('excludes superseded nodes from the diagram', () => {
    const mmd = renderMermaid(sampleGraph());
    expect(mmd).toContain('decision: New idea');
    expect(mmd).not.toContain('decision: Old idea');
  });

  it('escapes double quotes in titles so the diagram stays valid', () => {
    const g = new CairnGraph({ now: () => FIXED_NOW, session: 's' });
    g.addNode({ type: 'goal', title: 'Say "hello"' });
    const mmd = renderMermaid(g);
    expect(mmd).not.toContain('"hello"');
    expect(mmd).toContain("Say 'hello'");
  });
});

describe('renderDesignDoc', () => {
  it('renders a narrative markdown document with sections and an embedded diagram', () => {
    const doc = renderDesignDoc(sampleGraph());
    expect(doc).toMatch(/^# /m);
    expect(doc).toContain('## Goals');
    expect(doc).toContain('Continuity');
    expect(doc).toContain('## Decisions');
    expect(doc).toContain('```mermaid');
  });

  it('omits empty sections', () => {
    const g = new CairnGraph({ now: () => FIXED_NOW, session: 's' });
    g.addNode({ type: 'goal', title: 'Only a goal' });
    const doc = renderDesignDoc(g);
    expect(doc).toContain('## Goals');
    expect(doc).not.toContain('## Risks');
  });
});
