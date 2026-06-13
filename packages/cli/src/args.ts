export interface ParsedArgs {
  _: string[];
  flags: Record<string, string | boolean>;
}

/**
 * A tiny, dependency-free argv parser. `--flag value` captures a value;
 * `--flag` (followed by another flag or nothing) is boolean `true`.
 */
export function parseArgs(argv: string[]): ParsedArgs {
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === undefined) continue;
    if (token.startsWith('--')) {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('--')) {
        flags[key] = next;
        i += 1;
      } else {
        flags[key] = true;
      }
    } else {
      positional.push(token);
    }
  }
  return { _: positional, flags };
}

/** Read a flag as a string, or undefined if it's absent or a boolean flag. */
export function strFlag(flags: Record<string, string | boolean>, key: string): string | undefined {
  const value = flags[key];
  return typeof value === 'string' ? value : undefined;
}

/** Read a flag as a finite number, or undefined. */
export function numFlag(flags: Record<string, string | boolean>, key: string): number | undefined {
  const value = strFlag(flags, key);
  if (value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}
