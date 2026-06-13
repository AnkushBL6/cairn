import { afterEach, describe, expect, it } from 'vitest';
import type { Interview } from '../src/interview.js';
import { StudioServer } from '../src/server.js';

const interview: Interview = {
  sessionId: 'sess-1',
  title: 'Test interview',
  questions: [
    { id: 'name', kind: 'text', prompt: 'Name?', required: true },
    { id: 'pick', kind: 'single', prompt: 'Pick', choices: [{ value: 'a', label: 'A' }] },
  ],
};

let server: StudioServer | undefined;

afterEach(async () => {
  if (server) {
    await server.stop();
    server = undefined;
  }
});

async function boot(iv: Interview = interview): Promise<string> {
  server = new StudioServer(iv, { host: '127.0.0.1', port: 0 });
  const { url } = await server.start();
  return url;
}

function postJson(url: string, body: unknown): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('StudioServer', () => {
  it('reports health', async () => {
    const url = await boot();
    const res = await fetch(`${url}/api/health`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it('serves the interview as JSON', async () => {
    const url = await boot();
    const body = (await (await fetch(`${url}/api/interview`)).json()) as Interview;
    expect(body.questions.map((q) => q.id)).toEqual(['name', 'pick']);
  });

  it('serves the wizard HTML at the root', async () => {
    const url = await boot();
    const res = await fetch(`${url}/`);
    expect(res.headers.get('content-type')).toMatch(/text\/html/);
    expect((await res.text()).toLowerCase()).toContain('<!doctype html>');
  });

  it('accepts a valid answer and tracks progress', async () => {
    const url = await boot();
    const res = await postJson(`${url}/api/answer`, { questionId: 'name', value: 'Ada' });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, answered: 1, total: 2 });
    expect(server?.getAnswers()).toEqual([{ questionId: 'name', value: 'Ada' }]);
  });

  it('rejects an invalid (empty required) answer', async () => {
    const url = await boot();
    const res = await postJson(`${url}/api/answer`, { questionId: 'name', value: '' });
    expect(res.status).toBe(400);
  });

  it('rejects an answer to an unknown question', async () => {
    const url = await boot();
    const res = await postJson(`${url}/api/answer`, { questionId: 'ghost', value: 'x' });
    expect(res.status).toBe(400);
  });

  it('pushes follow-up questions into the live interview', async () => {
    const url = await boot();
    server?.pushQuestions([{ id: 'extra', kind: 'text', prompt: 'One more?' }]);
    const body = (await (await fetch(`${url}/api/interview`)).json()) as Interview;
    expect(body.questions.map((q) => q.id)).toContain('extra');
  });

  it('resolves waitForFinish with the posted transcript', async () => {
    const url = await boot();
    await postJson(`${url}/api/answer`, { questionId: 'name', value: 'Ada' });
    const finished = server!.waitForFinish();
    await postJson(`${url}/api/finish`, {
      sessionId: 'sess-1',
      title: 'Test interview',
      answers: [
        { questionId: 'name', value: 'Ada' },
        { questionId: 'pick', value: 'a' },
      ],
    });
    const transcript = await finished;
    expect(transcript.sessionId).toBe('sess-1');
    expect(transcript.answers.find((a) => a.questionId === 'pick')?.value).toBe('a');
  });

  it('returns 404 for unknown routes', async () => {
    const url = await boot();
    expect((await fetch(`${url}/nope`)).status).toBe(404);
  });
});
