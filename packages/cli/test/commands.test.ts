import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Interview, Transcript } from '@cairn/studio';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { applyGraphOps, formatResume, initProject, startStudioSession } from '../src/commands.js';
import { CairnStore } from '../src/store.js';

let dir: string;
let store: CairnStore;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'cairn-'));
  store = new CairnStore(dir);
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe('initProject', () => {
  it('creates the project brain and human-readable artifacts on disk', async () => {
    await initProject(store);
    expect(store.exists()).toBe(true);
    expect(await readFile(store.designPath, 'utf8')).toContain('# ');
    expect(await readFile(store.mermaidPath, 'utf8')).toContain('flowchart TD');
  });
});

describe('applyGraphOps', () => {
  it('creates nodes and edges atomically, resolving refs', async () => {
    const result = await applyGraphOps(store, {
      nodes: [
        { ref: 'g', type: 'goal', title: 'Continuity' },
        { ref: 'r', type: 'requirement', title: 'Resume reloads graph' },
        { ref: 'c', type: 'component', title: 'Studio' },
      ],
      edges: [{ type: 'refines', from: 'r', to: 'g' }],
    });

    expect(result.createdNodes).toBe(3);
    expect(result.createdEdges).toBe(1);
    expect(result.refs.g).toBe('goal--continuity');

    const brief = await store.resumeBrief();
    expect(brief.goals.map((n) => n.title)).toContain('Continuity');
    expect(brief.nextActions.join('\n')).toMatch(/Studio/);
  });

  it('persists across independent store instances', async () => {
    await applyGraphOps(store, { nodes: [{ type: 'goal', title: 'Persisted goal' }] });
    const fresh = new CairnStore(dir);
    const brief = await fresh.resumeBrief();
    expect(brief.goals.map((n) => n.title)).toEqual(['Persisted goal']);
  });

  it('rejects an illegal edge, leaving earlier valid work loadable', async () => {
    await applyGraphOps(store, { nodes: [{ ref: 'a', type: 'goal', title: 'A' }] });
    await expect(
      applyGraphOps(store, {
        nodes: [{ ref: 'b', type: 'goal', title: 'B' }],
        edges: [{ type: 'depends_on', from: 'b', to: 'b' }],
      }),
    ).rejects.toThrow(/illegal/i);
  });
});

describe('formatResume', () => {
  it('renders sections a fresh session can read', async () => {
    await applyGraphOps(store, {
      nodes: [
        { type: 'goal', title: 'Big goal' },
        { type: 'question', title: 'An open question' },
      ],
    });
    const text = formatResume(await store.resumeBrief());
    expect(text).toContain('Goals');
    expect(text).toContain('Big goal');
    expect(text).toContain('An open question');
  });

  it('handles an empty brain gracefully', () => {
    const text = formatResume({
      goals: [],
      acceptedDecisions: [],
      openQuestions: [],
      components: [],
      risks: [],
      nextActions: [],
    });
    expect(text).toMatch(/No project brain/i);
  });
});

describe('startStudioSession', () => {
  const interview: Interview = {
    sessionId: 'sess-cli',
    title: 'CLI session',
    questions: [{ id: 'why', kind: 'text', prompt: 'Why?' }],
  };

  it('persists the transcript when the user finishes', async () => {
    const handle = await startStudioSession({ interview, store, port: 0 });
    await fetch(`${handle.url}/api/finish`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'sess-cli',
        title: 'CLI session',
        answers: [{ questionId: 'why', value: 'because' }],
      }),
    });

    const { transcriptPath, sessionId } = await handle.finished;
    expect(sessionId).toBe('sess-cli');
    const saved = JSON.parse(await readFile(transcriptPath, 'utf8')) as Transcript;
    expect(saved.answers[0]?.value).toBe('because');
  });
});
