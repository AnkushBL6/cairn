import type { NodeType } from './types.js';

/** Lowercase, hyphenate, and trim a title into a URL/file-safe slug. */
export function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
  return slug.length > 0 ? slug : 'node';
}

/**
 * Deterministic node id: `${type}--${slug}`, disambiguated by an ordinal suffix
 * when an id already exists. No randomness — the same insertion order always
 * yields the same ids, which keeps the committed graph stable across machines.
 */
export function makeNodeId(type: NodeType, title: string, existing: ReadonlySet<string>): string {
  const base = `${type}--${slugify(title)}`;
  if (!existing.has(base)) {
    return base;
  }
  let ordinal = 2;
  while (existing.has(`${base}--${ordinal}`)) {
    ordinal += 1;
  }
  return `${base}--${ordinal}`;
}

/** Deterministic edge id derived from its endpoints and type. */
export function makeEdgeId(type: string, from: string, to: string): string {
  return `${from}__${type}__${to}`;
}
