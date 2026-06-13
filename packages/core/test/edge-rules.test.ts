import { describe, expect, it } from 'vitest';
import { isLegalEdge } from '../src/edge-rules.js';

describe('isLegalEdge — the graph integrity table', () => {
  it('allows the canonical legal pair for every edge type', () => {
    expect(isLegalEdge('refines', 'requirement', 'goal')).toBe(true);
    expect(isLegalEdge('refines', 'requirement', 'requirement')).toBe(true);
    expect(isLegalEdge('depends_on', 'component', 'component')).toBe(true);
    expect(isLegalEdge('decided_by', 'requirement', 'decision')).toBe(true);
    expect(isLegalEdge('decided_by', 'goal', 'decision')).toBe(true);
    expect(isLegalEdge('decided_by', 'constraint', 'decision')).toBe(true);
    expect(isLegalEdge('implements', 'artifact', 'component')).toBe(true);
    expect(isLegalEdge('implements', 'artifact', 'requirement')).toBe(true);
    expect(isLegalEdge('implements', 'component', 'requirement')).toBe(true);
    expect(isLegalEdge('tests', 'test', 'component')).toBe(true);
    expect(isLegalEdge('tests', 'test', 'requirement')).toBe(true);
    expect(isLegalEdge('tests', 'test', 'artifact')).toBe(true);
    expect(isLegalEdge('blocks', 'risk', 'component')).toBe(true);
    expect(isLegalEdge('blocks', 'question', 'requirement')).toBe(true);
    expect(isLegalEdge('blocks', 'constraint', 'goal')).toBe(true);
    expect(isLegalEdge('supersedes', 'decision', 'decision')).toBe(true);
    expect(isLegalEdge('supersedes', 'requirement', 'requirement')).toBe(true);
    expect(isLegalEdge('derived_from', 'artifact', 'goal')).toBe(true);
    expect(isLegalEdge('derived_from', 'component', 'risk')).toBe(true);
  });

  it('rejects nonsensical pairs for every edge type', () => {
    expect(isLegalEdge('refines', 'goal', 'requirement')).toBe(false); // wrong direction
    expect(isLegalEdge('depends_on', 'goal', 'goal')).toBe(false);
    expect(isLegalEdge('depends_on', 'component', 'goal')).toBe(false);
    expect(isLegalEdge('decided_by', 'requirement', 'goal')).toBe(false);
    expect(isLegalEdge('decided_by', 'test', 'decision')).toBe(false);
    expect(isLegalEdge('implements', 'goal', 'component')).toBe(false);
    expect(isLegalEdge('tests', 'component', 'component')).toBe(false);
    expect(isLegalEdge('tests', 'test', 'goal')).toBe(false);
    expect(isLegalEdge('blocks', 'goal', 'component')).toBe(false); // a goal can't block
    expect(isLegalEdge('blocks', 'risk', 'decision')).toBe(false);
    expect(isLegalEdge('supersedes', 'goal', 'decision')).toBe(false); // type mismatch
    expect(isLegalEdge('supersedes', 'test', 'test')).toBe(false); // test isn't supersedable
  });
});
