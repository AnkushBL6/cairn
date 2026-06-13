import { describe, expect, it } from 'vitest';
import { classifyTestFailure } from '../src/classify-failure.js';

describe('classifyTestFailure — the guard behind guaranteed TDD', () => {
  it('treats an assertion failure as a real red (the behavior is wrong)', () => {
    const out = 'AssertionError: expected 2 to be 3\n  ❯ test/add.test.ts:4:19';
    const result = classifyTestFailure(out);
    expect(result.kind).toBe('assertion');
    expect(result.isRealRed).toBe(true);
  });

  it('flags a missing function as NOT a real red (symbol not wired up yet)', () => {
    const out = 'TypeError: retryOperation is not a function';
    const result = classifyTestFailure(out);
    expect(result.kind).toBe('missing-symbol');
    expect(result.isRealRed).toBe(false);
  });

  it('flags a ReferenceError as missing-symbol', () => {
    const result = classifyTestFailure('ReferenceError: add is not defined');
    expect(result.kind).toBe('missing-symbol');
    expect(result.isRealRed).toBe(false);
  });

  it('flags a missing module import as missing-symbol', () => {
    const result = classifyTestFailure("Error: Cannot find module '../src/graph.js'");
    expect(result.kind).toBe('missing-symbol');
  });

  it('classifies a Python ModuleNotFoundError as missing-symbol', () => {
    const result = classifyTestFailure("ModuleNotFoundError: No module named 'app.core'");
    expect(result.kind).toBe('missing-symbol');
  });

  it('classifies a Python NameError as missing-symbol', () => {
    const result = classifyTestFailure("NameError: name 'add' is not defined");
    expect(result.kind).toBe('missing-symbol');
  });

  it('classifies a Python assert as a real red', () => {
    const out = 'E       assert 2 == 3\nE       AssertionError';
    const result = classifyTestFailure(out);
    expect(result.kind).toBe('assertion');
    expect(result.isRealRed).toBe(true);
  });

  it('classifies a syntax / collection failure separately', () => {
    const result = classifyTestFailure('SyntaxError: Unexpected token (3:10)\nfailed to collect');
    expect(result.kind).toBe('collection');
    expect(result.isRealRed).toBe(false);
  });

  it('detects a passing run', () => {
    const result = classifyTestFailure('Test Files  1 passed (1)\n  Tests  17 passed (17)');
    expect(result.kind).toBe('pass');
    expect(result.isRealRed).toBe(false);
  });

  it('returns unknown when it cannot tell, and always provides a reason', () => {
    const result = classifyTestFailure('some unrecognizable output');
    expect(result.kind).toBe('unknown');
    expect(result.reason.length).toBeGreaterThan(0);
  });
});
