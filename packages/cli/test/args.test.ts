import { describe, expect, it } from 'vitest';
import { numFlag, parseArgs, strFlag } from '../src/args.js';

describe('parseArgs', () => {
  it('separates positionals from valued flags', () => {
    const { _, flags } = parseArgs(['graph', 'apply', 'ops.json', '--root', '/tmp']);
    expect(_).toEqual(['graph', 'apply', 'ops.json']);
    expect(flags.root).toBe('/tmp');
  });

  it('treats a flag followed by another flag (or end) as boolean true', () => {
    const { flags } = parseArgs(['--no-open', '--port', '4571', '--static']);
    expect(flags['no-open']).toBe(true);
    expect(flags.port).toBe('4571');
    expect(flags.static).toBe(true);
  });

  it('ignores nothing and handles an empty argv', () => {
    expect(parseArgs([])).toEqual({ _: [], flags: {} });
  });
});

describe('strFlag / numFlag', () => {
  it('strFlag returns strings only', () => {
    const { flags } = parseArgs(['--a', 'x', '--b']);
    expect(strFlag(flags, 'a')).toBe('x');
    expect(strFlag(flags, 'b')).toBeUndefined(); // boolean true is not a string
    expect(strFlag(flags, 'missing')).toBeUndefined();
  });

  it('numFlag parses finite numbers and rejects the rest', () => {
    const { flags } = parseArgs(['--port', '3000', '--bad', 'abc']);
    expect(numFlag(flags, 'port')).toBe(3000);
    expect(numFlag(flags, 'bad')).toBeUndefined();
    expect(numFlag(flags, 'missing')).toBeUndefined();
  });
});
