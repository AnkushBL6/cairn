---
name: cairn-frontend
description: Use when building or changing user interfaces (web or mobile). Produces world-class, accessible UI driven by the project graph — design tokens, component isolation, Vercel-grade performance (no waterfalls, server-first, bundle-aware), and logic tested via cairn-tdd.
license: MIT
---

# Cairn — Frontend

## Overview

Build interfaces that are beautiful, accessible, fast, and **consistent with the project's decisions**. The graph already records the stack, constraints, and components — read it, don't re-ask.

**Core principle:** A UI is a system of tokens and states, not a pile of one-off styles. Design the system; the screens fall out of it.

## Before you touch a component

```bash
cairn resume        # stack? constraints (a11y, i18n, perf budgets)? which component?
```

Pull the relevant `component`, `requirement`, `constraint`, and `decision` nodes. If the design is missing or vague, go back to `cairn-brainstorm` rather than guessing.

## The standard (non-negotiable)

1. **Design tokens first.** Color, spacing, radius, type scale, shadow, motion — as variables. No magic numbers in components. Dark mode is a token swap, not a rewrite.
2. **Accessibility is a requirement, not a polish pass.** Semantic HTML, labelled controls, visible focus, keyboard paths, `prefers-reduced-motion`, AA contrast. If a `constraint` node says WCAG AA, it's a gate.
3. **Component isolation.** Each component has one job, a typed prop contract, and is understandable without reading its parents. State stays as local as it can.
4. **States are designed, not discovered.** Every component handles: default, loading, empty, error, and (where relevant) disabled and overflow/long-content.
5. **Performance is a feature.** Mind Core Web Vitals: no layout shift, lazy-load below the fold, ship less JS, prefer the platform. Animate `transform`/`opacity`, not layout.
6. **Responsive by construction.** Fluid layouts; test the smallest and largest target widths the `constraint` nodes imply.

## Performance discipline (from Vercel's React best practices)

For a UI, performance *is* correctness. Apply these highest-impact-first:

1. **Kill waterfalls.** Independent async work runs in parallel (`Promise.all`), never in sequence. Start promises early, await late. Stream with `<Suspense>` so the shell paints immediately.
2. **Guard the bundle.** `dynamic()`-import heavy or below-the-fold components. Import from exact paths, not barrel files. Defer analytics/third-party until after hydration. Preload on hover/focus.
3. **Server-first.** Default to Server Components. Dedupe per-request reads with `React.cache()`; hoist static I/O (fonts, config) to module scope; pass the *minimum* data across the server→client boundary.
4. **Re-render hygiene.** Derive state during render, not in effects. Never define a component inside another. Use primitive effect deps, functional `setState`, and `startTransition`/`useDeferredValue` for non-urgent updates.
5. **Stack:** prefer Tailwind + shadcn/ui over CSS-in-JS (MUI/Chakra/emotion) for SSR performance.

Before a screen is "done", verify with Lighthouse (Performance ≥ 95, CLS 0) and axe (0 violations).

## Logic vs. presentation

- **Presentational** markup/styles: build directly against the design tokens and states above.
- **Logic** (formatting, validation, reducers, data shaping): build it **test-first with `cairn-tdd`**. UI logic is exactly where silent bugs hide.

## Flow

```dot
digraph cairn_frontend {
  "cairn resume" [shape=box];
  "Tokens + states defined?" [shape=diamond];
  "Define design tokens" [shape=box];
  "Build component (isolated)" [shape=box];
  "Logic? -> cairn-tdd" [shape=box];
  "A11y + responsive + states pass" [shape=diamond];
  "Update component status in graph" [shape=box];

  "cairn resume" -> "Tokens + states defined?";
  "Tokens + states defined?" -> "Define design tokens" [label="no"];
  "Tokens + states defined?" -> "Build component (isolated)" [label="yes"];
  "Define design tokens" -> "Build component (isolated)";
  "Build component (isolated)" -> "Logic? -> cairn-tdd";
  "Logic? -> cairn-tdd" -> "A11y + responsive + states pass";
  "A11y + responsive + states pass" -> "Update component status in graph" [label="yes"];
  "A11y + responsive + states pass" -> "Build component (isolated)" [label="no"];
}
```

## When you finish

Mark the component done so the next session and the rest of the team see it
(`graph set` updates in place — `graph add` would create a duplicate):

```bash
cairn graph set --type component --title "PaymentForm" --status done
```

## Red Flags

| Thought | Reality |
|---|---|
| "I'll hardcode this color/spacing." | Token it. One-offs are how design systems rot. |
| "Accessibility later." | It's a gate, not a chore. Build it in. |
| "Only the happy path matters." | Loading/empty/error are the product. |
| "What stack are we using again?" | `cairn resume`. The decision is recorded. |
| "Animate width/height for the slick effect." | That's jank. Animate transform/opacity. |
| "These fetches are fine sequentially." | That's a waterfall. Parallelize independent async; stream the rest. |
| "I'll add props for flexibility later." | YAGNI — build the minimum component the design needs. Senior-engineer test: is this overcomplicated? |
