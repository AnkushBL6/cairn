#!/usr/bin/env node
/**
 * cairn-classify — zero-dependency, standalone test-failure classifier.
 *
 * This is a vendored mirror of `@cairn/core`'s `classifyTestFailure`, shipped
 * so the GitHub Action runs in ANY consumer repo with no install step. The
 * `packages/core/test/action-classify-parity.test.ts` contract test asserts
 * this file stays byte-for-byte equivalent to the engine, so the two can never
 * drift apart.
 *
 * As a library: `import { classifyTestFailure } from './classify.mjs'`.
 * As a CLI: `node classify.mjs [file] [--assert-red]` (reads stdin if no file).
 */

import { appendFileSync, readFileSync } from 'node:fs';

/**
 * A test suite that "fails to compile/collect" — the test file itself is broken,
 * so nothing meaningful was exercised.
 */
const COLLECTION =
  /syntaxerror|failed to collect|test suite failed to run|unexpected token|cannot use import statement|indentationerror/i;

/**
 * The unit under test isn't reachable: the symbol/module doesn't exist, isn't a
 * function, or returned nothing usable. This is NOT a real red — it means the
 * test isn't yet exercising real behavior (Cairn guarantees G1 + G2).
 */
const MISSING_SYMBOL =
  /is not defined|is not a function|cannot find module|cannot find name|has no exported member|referenceerror|modulenotfounderror|no module named|cannot import name|nameError|attributeerror|cannot read properties of undefined|cannot read property .* of undefined|undefined is not an object/i;

/** A genuine behavioral failure — the code ran and produced the wrong answer. */
const ASSERTION = /assertionerror|expect\(|\bexpected\b|to equal|to be\b|tobe\b|toequal\b|assert /i;

/** A clean pass with no failures. */
const PASS = /\b\d+ passed\b|all tests passed|tests:\s*\d+ passed|0 failed|✓/i;
const HAS_FAILURE = /\bfail|failed|✗|×|\berror\b|\d+ failed/i;

/**
 * Classify raw test-runner output. Precedence is deliberate:
 * collection → missing-symbol → assertion → pass → unknown.
 *
 * Only an `assertion` failure counts as a legitimate red to start building from.
 */
export function classifyTestFailure(output) {
  const text = output ?? '';

  if (COLLECTION.test(text)) {
    return {
      kind: 'collection',
      isRealRed: false,
      reason:
        'The test file failed to compile or collect. Fix the syntax/import error in the test before treating any failure as meaningful.',
    };
  }

  if (MISSING_SYMBOL.test(text)) {
    return {
      kind: 'missing-symbol',
      isRealRed: false,
      reason:
        'The unit under test is not reachable (missing symbol/module, or it returned nothing usable). This is NOT a real red. Scaffold the minimal signature at its real module path first, then re-run so the failure becomes a behavioral assertion.',
    };
  }

  if (ASSERTION.test(text)) {
    return {
      kind: 'assertion',
      isRealRed: true,
      reason:
        'A real assertion failed: the code ran and produced the wrong answer. This is a legitimate red — now write the minimal code to make it green.',
    };
  }

  if (PASS.test(text) && !HAS_FAILURE.test(text)) {
    return {
      kind: 'pass',
      isRealRed: false,
      reason:
        'The suite passed. If you have not yet written implementation, your test is asserting nothing — strengthen it.',
    };
  }

  return {
    kind: 'unknown',
    isRealRed: false,
    reason:
      'Could not classify the output. Inspect it manually: confirm the test imports and calls the real unit and fails on an assertion, not a missing symbol.',
  };
}

/* ───────────────────────── CLI / Action entrypoint ───────────────────────── */

/** Append a key=value (multiline-safe) pair to a GitHub outputs/env file. */
function writeGithubFile(path, key, value) {
  if (!path) return;
  const delim = `cairn_${key}_eof`;
  appendFileSync(path, `${key}<<${delim}\n${value}\n${delim}\n`);
}

function readStdin() {
  try {
    return readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function isMainModule() {
  const entry = process.argv[1] ?? '';
  return import.meta.url === `file://${entry}` || import.meta.url.endsWith(entry);
}

if (isMainModule()) {
  const args = process.argv.slice(2);
  const assertRed = args.includes('--assert-red');
  const file = args.find((a) => !a.startsWith('--'));
  const output = file ? readFileSync(file, 'utf8') : readStdin();

  const result = classifyTestFailure(output);
  const summaryLine = `cairn-classify → kind=${result.kind} isRealRed=${result.isRealRed}`;
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.stderr.write(`${summaryLine}\n`);

  const ghOutput = process.env.GITHUB_OUTPUT;
  writeGithubFile(ghOutput, 'kind', result.kind);
  writeGithubFile(ghOutput, 'is-real-red', String(result.isRealRed));
  writeGithubFile(ghOutput, 'reason', result.reason);

  const summary = process.env.GITHUB_STEP_SUMMARY;
  if (summary) {
    const verdict = result.isRealRed ? '✅ real red' : `⚠️ not a real red (${result.kind})`;
    appendFileSync(
      summary,
      `### 🪨 Cairn TDD Guard\n\n**${verdict}** — \`${result.kind}\`\n\n${result.reason}\n`,
    );
  }

  if (assertRed && !result.isRealRed) {
    process.stderr.write(
      `cairn-classify: --assert-red failed — expected a real assertion red but got "${result.kind}".\n`,
    );
    process.exit(2);
  }
}
