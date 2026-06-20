import { describe, expect, it } from 'vitest';
// The vendored, zero-dependency classifier the GitHub Action ships.
import { classifyTestFailure as vendored } from '../../../actions/cairn-classify/classify.mjs';
// The single source of truth in the engine.
import { classifyTestFailure as engine } from '../src/classify-failure.js';

/**
 * Contract: the Action's vendored `classify.mjs` MUST stay equivalent to the
 * engine. If anyone edits one classifier and not the other, this fails — so the
 * Action can never silently drift from `@cairn/core`.
 */
const CORPUS: string[] = [
  // assertion (real red)
  'AssertionError: expected 2 to be 3\n  ❯ test/add.test.ts:4:19',
  'E       assert 2 == 3\nE       AssertionError',
  'expect(received).toEqual(expected)',
  // missing-symbol (fake red)
  'TypeError: retryOperation is not a function',
  'ReferenceError: add is not defined',
  "Error: Cannot find module '../src/graph.js'",
  "ModuleNotFoundError: No module named 'app.core'",
  "NameError: name 'add' is not defined",
  "TS2305: Module '\"./x\"' has no exported member 'foo'",
  "TypeError: Cannot read properties of undefined (reading 'map')",
  // collection
  'SyntaxError: Unexpected token (3:10)\nfailed to collect',
  'Test suite failed to run\nIndentationError: unexpected indent',
  // pass
  'Test Files  1 passed (1)\n  Tests  17 passed (17)',
  '✓ all tests passed',
  // unknown
  'some unrecognizable output',
  '',
  // precedence collisions — where drift is most likely to hide
  'SyntaxError near "is not a function"', // collection must beat missing-symbol
  'foo is not a function — expected 1 to be 2', // missing-symbol must beat assertion
  'AssertionError: boom ... 5 passed', // assertion must beat pass
  '10 passed, 0 failed', // a pass marker plus a failure marker → unknown, not pass
];

describe('action classify.mjs ↔ @cairn/core parity', () => {
  for (const sample of CORPUS) {
    const label = sample.slice(0, 40).replace(/\n/g, '⏎') || '(empty)';
    it(`matches the engine for: ${label}`, () => {
      expect(vendored(sample)).toEqual(engine(sample));
    });
  }

  it('agrees on isRealRed across the whole corpus', () => {
    const v = CORPUS.map((s) => vendored(s).isRealRed);
    const e = CORPUS.map((s) => engine(s).isRealRed);
    expect(v).toEqual(e);
  });

  it('only ever calls an assertion a real red', () => {
    for (const sample of CORPUS) {
      const r = vendored(sample);
      expect(r.isRealRed).toBe(r.kind === 'assertion');
    }
  });
});
