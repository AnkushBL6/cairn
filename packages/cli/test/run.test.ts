import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { type CliIO, runCli } from '../src/run.js';

let dir: string;
let out: string[];
let err: string[];

function io(extra: Partial<CliIO> = {}): CliIO {
  return {
    cwd: dir,
    out: (line) => out.push(line),
    err: (line) => err.push(line),
    openBrowser: () => {},
    readStdin: async () => '',
    ...extra,
  };
}

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'cairn-run-'));
  out = [];
  err = [];
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe('runCli — the full command dispatch', () => {
  it('prints help by default and on `help`', async () => {
    expect(await runCli(['help'], io())).toBe(0);
    expect(out.join('\n')).toMatch(/cairn — give your agent continuity/);
  });

  it('prints the version', async () => {
    expect(await runCli(['version'], io())).toBe(0);
    expect(out.join('\n')).toContain('0.1.0');
  });

  it('init then resume reads back an (empty) brain', async () => {
    expect(await runCli(['init'], io())).toBe(0);
    out = [];
    expect(await runCli(['resume'], io())).toBe(0);
    expect(out.join('\n')).toMatch(/Cairn/);
  });

  it('graph apply then resume reflects the captured nodes', async () => {
    const ops = join(dir, 'ops.json');
    await writeFile(
      ops,
      JSON.stringify({
        nodes: [
          { type: 'goal', title: 'Big goal' },
          { type: 'question', title: 'Open question' },
        ],
      }),
    );
    expect(await runCli(['graph', 'apply', ops], io())).toBe(0);
    out = [];
    expect(await runCli(['resume'], io())).toBe(0);
    const text = out.join('\n');
    expect(text).toContain('Big goal');
    expect(text).toContain('Open question');
  });

  it('graph add then graph show renders Mermaid and lists node ids', async () => {
    expect(await runCli(['graph', 'add', '--type', 'goal', '--title', 'From CLI'], io())).toBe(0);
    out = [];
    expect(await runCli(['graph', 'show'], io())).toBe(0);
    const text = out.join('\n');
    expect(text).toContain('flowchart TD');
    expect(text).toContain('goal--from-cli  [open]  From CLI');
  });

  it('graph set updates a node in place — no duplicate (the resume-continuity fix)', async () => {
    await runCli(['graph', 'add', '--type', 'component', '--title', 'PaymentForm'], io());
    out = [];
    const code = await runCli(
      ['graph', 'set', '--type', 'component', '--title', 'PaymentForm', '--status', 'done'],
      io(),
    );
    expect(code).toBe(0);
    expect(out.join('\n')).toContain('Updated component--paymentform');

    out = [];
    await runCli(['graph', 'show'], io());
    const lines = out.join('\n').split('\n');
    const componentLines = lines.filter((l) => l.includes('component--paymentform  ['));
    expect(componentLines).toHaveLength(1); // exactly one — not duplicated
    expect(componentLines[0]).toContain('[done]');
  });

  it('graph set by explicit id works; unknown id fails cleanly', async () => {
    await runCli(['graph', 'add', '--type', 'goal', '--title', 'G'], io());
    expect(await runCli(['graph', 'set', 'goal--g', '--status', 'accepted'], io())).toBe(0);
    expect(await runCli(['graph', 'set', 'goal--missing', '--status', 'done'], io())).toBe(1);
  });

  it('graph edge connects two existing nodes', async () => {
    await runCli(['graph', 'add', '--type', 'component', '--title', 'A'], io());
    await runCli(['graph', 'add', '--type', 'component', '--title', 'B'], io());
    const code = await runCli(
      ['graph', 'edge', '--type', 'depends_on', '--from', 'component--a', '--to', 'component--b'],
      io(),
    );
    expect(code).toBe(0);
  });

  it('rejects an invalid node type with exit 1 and a helpful message', async () => {
    const code = await runCli(['graph', 'add', '--type', 'bogus', '--title', 'x'], io());
    expect(code).toBe(1);
    expect(err.join('\n')).toMatch(/--type must be one of/);
  });

  it('studio --static writes a self-contained wizard file', async () => {
    const interviewPath = join(dir, 'iv.json');
    await writeFile(
      interviewPath,
      JSON.stringify({
        sessionId: 's',
        title: 'T',
        questions: [{ id: 'a', kind: 'text', prompt: 'Q?' }],
      }),
    );
    const outPath = join(dir, 'wizard.html');
    const code = await runCli(
      ['studio', '--interview', interviewPath, '--static', '--out', outPath],
      io(),
    );
    expect(code).toBe(0);
    expect((await readFile(outPath, 'utf8')).toLowerCase()).toContain('<!doctype html>');
  });

  it('classify exits 2 for a fake (missing-symbol) red with --assert-red', async () => {
    const code = await runCli(
      ['classify', '--assert-red'],
      io({ readStdin: async () => 'TypeError: retryOperation is not a function' }),
    );
    expect(code).toBe(2);
    expect(out.join('\n')).toContain('missing-symbol');
  });

  it('classify exits 0 for a real assertion red', async () => {
    const code = await runCli(
      ['classify', '--assert-red'],
      io({ readStdin: async () => 'AssertionError: expected 1 to be 2' }),
    );
    expect(code).toBe(0);
    expect(out.join('\n')).toContain('assertion');
  });

  it('classify reads from a file argument', async () => {
    const file = join(dir, 'testlog.txt');
    await writeFile(file, 'AssertionError: nope');
    expect(await runCli(['classify', file], io())).toBe(0);
    expect(out.join('\n')).toContain('assertion');
  });

  it('ingest saves a transcript to disk', async () => {
    const transcript = join(dir, 't.json');
    await writeFile(transcript, JSON.stringify({ sessionId: 'x', title: 'X', answers: [] }));
    expect(await runCli(['ingest', transcript], io())).toBe(0);
    expect(out.join('\n')).toMatch(/Saved transcript/);
  });

  it('graph edge without --from fails cleanly', async () => {
    expect(await runCli(['graph', 'edge', '--type', 'depends_on', '--to', 'x'], io())).toBe(1);
  });

  it('an unknown graph subcommand fails', async () => {
    expect(await runCli(['graph', 'frobnicate'], io())).toBe(1);
    expect(err.join('\n')).toMatch(/unknown graph subcommand/);
  });

  it('studio (live) prints the URL and resolves when the browser finishes', async () => {
    const interviewPath = join(dir, 'live.json');
    await writeFile(
      interviewPath,
      JSON.stringify({
        sessionId: 'live',
        title: 'Live',
        questions: [{ id: 'a', kind: 'text', prompt: 'Q?' }],
      }),
    );

    const pending = runCli(['studio', '--interview', interviewPath, '--no-open'], io());

    // Wait for the server URL to be printed, then simulate the browser finishing.
    let url = '';
    for (let i = 0; i < 200 && !url; i += 1) {
      const line = out.find((l) => l.includes('http://127.0.0.1'));
      if (line) url = line.match(/http:\/\/\S+/)?.[0] ?? '';
      else await new Promise((r) => setTimeout(r, 10));
    }
    expect(url).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/);

    await fetch(`${url}/api/finish`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'live',
        title: 'Live',
        answers: [{ questionId: 'a', value: 'hi' }],
      }),
    });

    expect(await pending).toBe(0);
    expect(out.join('\n')).toContain('transcriptPath');
  });
});
