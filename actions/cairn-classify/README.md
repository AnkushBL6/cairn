# 🪨 Cairn TDD Guard — `cairn-classify` Action

A reusable GitHub Action that tells a **real red** from a **fake one**.

Ordinary "TDD" often starts from a *missing-symbol* error (`retryOperation is not a
function`), mistakes it for a real failing test, and builds on it — so you ship code with
no proof the behavior was ever exercised. This Action wraps Cairn's failure classifier so
your CI can **enforce that a test fails for the right reason**: a genuine assertion, not a
symbol that doesn't exist yet.

- **Zero install.** Pure Node, no dependencies — runs in any repo, any language's test output.
- **One job, two modes.** Report the verdict, or hard-fail the job unless the red is real.
- **Never drifts.** The classifier is vendored from [`@cairn/core`](../../packages/core) and a
  contract test (`action-classify-parity`) keeps the two byte-for-byte equivalent.

## Usage

```yaml
- uses: AnkushBL6/cairn/actions/cairn-classify@main
  with:
    command: npm test          # its combined stdout+stderr is classified
    assert-red: 'true'         # fail the job unless it's a real assertion red
```

Or classify output you've already captured:

```yaml
- run: npm test > test-output.txt 2>&1 || true
- uses: AnkushBL6/cairn/actions/cairn-classify@main
  with:
    file: test-output.txt
```

### Inputs

| Input | Default | Description |
|---|---|---|
| `command` | — | Test command to run. A non-zero exit is **expected** and does not fail the step — the classification decides. |
| `file` | — | Path to captured test output to classify (use instead of `command`). |
| `assert-red` | `false` | When `true`, fail the job unless the output is a real assertion red. |

Provide either `command` or `file`.

### Outputs

| Output | Description |
|---|---|
| `kind` | `assertion` · `missing-symbol` · `collection` · `pass` · `unknown` |
| `is-real-red` | `'true'` only for a clean assertion failure — the one legitimate starting red. |
| `reason` | What the verdict means and what to do next. |

```yaml
- id: guard
  uses: AnkushBL6/cairn/actions/cairn-classify@main
  with: { command: npm test }
- run: echo "verdict=${{ steps.guard.outputs.kind }} real=${{ steps.guard.outputs.is-real-red }}"
```

The Action also writes a verdict to the job summary.

## When to reach for `assert-red`

In a **TDD-guard workflow** — e.g. a job triggered when a PR adds a new test but no
implementation. `assert-red: true` proves the new test fails on a real assertion (Cairn's
**G1**: red for the right reason), blocking the "function not found, ship it anyway" pattern.

See [`examples/tdd-guard.yml`](./examples/tdd-guard.yml) for a complete PR workflow.

## The four guarantees

This Action enforces **G1** (red for the right reason). The full set, delivered by the
[`cairn-tdd`](../../skills/cairn-tdd) skill: **G1** red for the right reason · **G2** proof of
execution · **G3** watched transitions · **G4** no orphan code.
