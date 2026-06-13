export type FailureKind = 'assertion' | 'missing-symbol' | 'collection' | 'pass' | 'unknown';

export interface FailureClassification {
  kind: FailureKind;
  /** True ONLY for a clean assertion failure — the one legitimate starting "red". */
  isRealRed: boolean;
  /** Human-readable explanation plus what the TDD workflow should do next. */
  reason: string;
}

/**
 * A test suite that "fails to compile/collect" — the test file itself is broken,
 * so nothing meaningful was exercised.
 */
const COLLECTION = /syntaxerror|failed to collect|test suite failed to run|unexpected token|cannot use import statement|indentationerror/i;

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
 * This is the engine behind the guaranteed-TDD workflow: only an `assertion`
 * failure counts as a legitimate red to start implementing against.
 */
export function classifyTestFailure(output: string): FailureClassification {
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
