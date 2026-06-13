import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Interview, Transcript } from '@cairn/studio';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { applyGraphOps, startStudioSession } from '../src/commands.js';
import { CairnStore } from '../src/store.js';

/**
 * The whole point of Cairn, exercised end-to-end across every package:
 * brainstorm in the studio -> persist a transcript -> synthesize the graph ->
 * a brand-new, context-free session reloads the entire project.
 */

let dir: string;
let store: CairnStore;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'cairn-e2e-'));
  store = new CairnStore(dir);
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

const interview: Interview = {
  sessionId: 'e2e',
  title: 'New project',
  questions: [
    { id: 'goal', kind: 'text', prompt: 'What is the goal?', required: true },
    {
      id: 'stack',
      kind: 'single',
      prompt: 'Stack?',
      choices: [{ value: 'next', label: 'Next.js' }],
    },
    { id: 'open', kind: 'text', prompt: 'Biggest open question?' },
  ],
};

describe('end-to-end: brainstorm → graph → resume', () => {
  it('a fresh, context-free session reloads everything captured in the studio', async () => {
    // 1. The user brainstorms in the studio (browser finishing is simulated here).
    const handle = await startStudioSession({ interview, store, port: 0 });
    await fetch(`${handle.url}/api/finish`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'e2e',
        title: 'New project',
        answers: [
          { questionId: 'goal', value: 'Ship a checkout that converts' },
          { questionId: 'stack', value: 'next' },
          { questionId: 'open', value: 'Stripe or Adyen?' },
        ],
      }),
    });
    const { transcriptPath } = await handle.finished;
    const transcript = JSON.parse(await readFile(transcriptPath, 'utf8')) as Transcript;

    const answerFor = (id: string): string => {
      const value = transcript.answers.find((a) => a.questionId === id)?.value;
      return typeof value === 'string' ? value : '';
    };

    // 2. The agent synthesizes the transcript into the project graph.
    await applyGraphOps(store, {
      nodes: [
        { ref: 'g', type: 'goal', title: answerFor('goal') },
        { ref: 'd', type: 'decision', title: 'Use Next.js', status: 'accepted' },
        { ref: 'q', type: 'question', title: answerFor('open') },
        { ref: 'c', type: 'component', title: 'PaymentForm' },
      ],
      edges: [
        { type: 'decided_by', from: 'g', to: 'd' },
        { type: 'blocks', from: 'q', to: 'c' },
      ],
    });

    // 3. A brand-new store instance — i.e. a fresh chat with zero context — resumes.
    const freshSession = new CairnStore(dir);
    const brief = await freshSession.resumeBrief();

    expect(brief.goals.map((n) => n.title)).toContain('Ship a checkout that converts');
    expect(brief.acceptedDecisions.map((n) => n.title)).toContain('Use Next.js');
    expect(brief.openQuestions.map((n) => n.title)).toContain('Stripe or Adyen?');
    expect(brief.components.map((c) => c.node.title)).toContain('PaymentForm');
    expect(brief.nextActions.join('\n')).toMatch(/Stripe or Adyen\?/);

    // And the human-readable artifacts exist on disk for the team.
    expect(await readFile(store.designPath, 'utf8')).toContain('Ship a checkout that converts');
    expect(await readFile(store.mermaidPath, 'utf8')).toContain('flowchart TD');
  });
});
