import { describe, expect, it } from 'vitest';
import { CairnGraph } from '../src/graph.js';
import { summarizeForResume } from '../src/resume.js';

const FIXED_NOW = '2026-06-13T00:00:00.000Z';

function projectGraph(): CairnGraph {
  const g = new CairnGraph({ now: () => FIXED_NOW, session: 's' });
  g.addNode({ type: 'goal', title: 'Give the agent continuity' });
  g.addNode({ type: 'decision', title: 'Portable file graph', status: 'accepted' });
  g.addNode({ type: 'decision', title: 'Rejected: hosted DB' }); // open, not accepted
  g.addNode({ type: 'question', title: 'How adaptive is the interview?' });
  const studio = g.addNode({ type: 'component', title: 'Studio', status: 'open' });
  const core = g.addNode({ type: 'component', title: 'Core engine', status: 'done' });
  g.addEdge({ type: 'depends_on', from: studio.id, to: core.id });
  g.addNode({ type: 'risk', title: 'Headless environments have no browser' });
  return g;
}

describe('summarizeForResume — what a fresh, context-free session reads', () => {
  it('extracts goals, accepted decisions, open questions, components, and risks', () => {
    const brief = summarizeForResume(projectGraph());

    expect(brief.goals.map((n) => n.title)).toEqual(['Give the agent continuity']);
    expect(brief.acceptedDecisions.map((n) => n.title)).toEqual(['Portable file graph']);
    expect(brief.openQuestions.map((n) => n.title)).toEqual(['How adaptive is the interview?']);
    expect(brief.risks.map((n) => n.title)).toEqual(['Headless environments have no browser']);
  });

  it('resolves each component with its status and dependencies', () => {
    const brief = summarizeForResume(projectGraph());
    const studio = brief.components.find((c) => c.node.title === 'Studio');
    const core = brief.components.find((c) => c.node.title === 'Core engine');

    expect(studio?.status).toBe('open');
    expect(studio?.dependsOn).toEqual(['component--core-engine']);
    expect(core?.status).toBe('done');
    expect(core?.dependsOn).toEqual([]);
  });

  it('proposes next actions: open questions and unfinished components, never done ones', () => {
    const brief = summarizeForResume(projectGraph());
    const joined = brief.nextActions.join('\n');

    expect(joined).toMatch(/How adaptive is the interview\?/);
    expect(joined).toMatch(/Studio/);
    expect(joined).not.toMatch(/Core engine/); // it's done — not a next action
  });

  it('handles an empty graph without throwing', () => {
    const brief = summarizeForResume(new CairnGraph());
    expect(brief.goals).toEqual([]);
    expect(brief.nextActions).toEqual([]);
  });
});
