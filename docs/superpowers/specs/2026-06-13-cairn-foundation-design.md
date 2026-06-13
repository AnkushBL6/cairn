# Cairn — Foundation, Intake & Resume (Design Spec)

> **Status:** Approved (user delegated all production-grade calls via `/goal`).
> **Date:** 2026-06-13
> **Scope:** Sub-project #1 of the Cairn skillpack — plus the shared architecture every later sub-project plugs into.

---

## 1. What Cairn is

Cairn is an opinionated **skillpack** that owns the whole arc of building software with an AI agent:

> **idea → an interactively-captured, graph-persisted design → test-first implementation with real guarantees → frontend + backend build — with a router that pulls in *any* other skill on demand, and a production-grade site to sell it.**

**The differentiator is continuity.** A brainstorm becomes a typed knowledge graph committed to the repo. A brand-new chat with *zero context* reloads the full understanding of the project. *Your AI never starts from zero.* Every other skill reads the graph instead of re-interrogating the user.

The name: a **cairn** is a stack of trail-markers hikers leave to guide whoever comes next — exactly what the graph does for your next session.

### Components & build order (the whole pack)

| # | Component | Cycle |
|---|-----------|-------|
| 1 | **Foundation** — architecture, graph format, packaging | **this spec** |
| 2 | **Brainstorm→Graph intake** — live studio wizard + systematic save | **this spec** |
| 3 | **Resume** — reload graph into a fresh session | **this spec** |
| 4 | Guaranteed TDD workflow (the rewrite) | next |
| 5 | Frontend + Backend skills | next |
| 6 | Router + Vercel `find-skills` integration | next |
| 7 | Marketing website | next |

> Sub-project #1 is Foundation + Intake + Resume. The remaining skills are authored alongside in this build because the user set an end-to-end "ready to host on Vercel" goal, but each is independently specified by its own SKILL.md contract against the frozen core interfaces below.

---

## 2. Architecture

```
repo/
├── .cairn/                      # the project "brain" — committed to git
│   ├── graph.json               # typed knowledge graph (source of truth)
│   ├── design.md                # human-readable narrative (generated)
│   ├── graph.mmd                # Mermaid render (generated)
│   └── sessions/                # raw interview transcripts per session
├── packages/
│   ├── core/                    # @cairn/core — graph engine (pure, TDD)
│   ├── studio/                  # @cairn/studio — local wizard server + UI
│   └── cli/                     # @cairn/cli — the `cairn` command
├── skills/                      # Vercel skills standard (SKILL.md each)
└── website/                     # Next.js marketing site (Vercel)
```

**Layering (strict, one-directional dependencies):**

```
skills (markdown)  →  @cairn/cli  →  @cairn/studio  →  @cairn/core
                                          │                 │
                                      (Node http)      (pure TS, no I/O
                                                        except GraphStore)
```

`@cairn/core` is **pure and deterministic** — no network, no clock except an injected one, no randomness except an injected id source. This is what makes it exhaustively unit-testable and is why we dogfood our own TDD workflow to build it.

---

## 3. The graph model (`@cairn/core`)

### Node

```ts
type NodeType =
  | 'goal'        // why we're building
  | 'requirement' // what it must do
  | 'decision'    // a choice made, with rationale
  | 'component'   // a unit to build
  | 'constraint'  // a limit (tech, time, policy)
  | 'question'    // an open question (unresolved)
  | 'risk'        // a known risk
  | 'test'        // a TestContract (feeds the TDD skill)
  | 'artifact';   // a file/output produced

interface CairnNode {
  id: string;            // stable, content-addressed-ish slug + ordinal
  type: NodeType;
  title: string;         // one line
  body: string;          // markdown detail
  status: 'open' | 'accepted' | 'done' | 'superseded';
  tags: string[];
  createdInSession: string;
  createdAt: string;     // ISO, from injected clock
  supersededBy?: string; // node id
}
```

### Edge

```ts
type EdgeType =
  | 'refines'     // requirement refines goal
  | 'depends_on'  // component depends_on component
  | 'decided_by'  // requirement decided_by decision
  | 'implements'  // artifact implements component
  | 'tests'       // test tests component/requirement
  | 'blocks'      // risk/question blocks component
  | 'supersedes'  // decision supersedes decision
  | 'derived_from';

interface CairnEdge {
  id: string;
  type: EdgeType;
  from: string;          // node id
  to: string;            // node id
  note?: string;
}
```

### GraphStore — the public API (frozen interface)

```ts
class CairnGraph {
  addNode(input: NewNode): CairnNode;       // validates, assigns id+timestamp
  addEdge(input: NewEdge): CairnEdge;        // validates endpoints exist + type legality
  getNode(id): CairnNode | undefined;
  supersede(oldId, newId): void;            // marks old superseded, adds edge
  query(filter): CairnNode[];                // by type/status/tag
  neighbors(id, opts?): CairnNode[];         // edge-typed traversal
  openQuestions(): CairnNode[];              // status==='open' && type==='question'
  toJSON(): GraphDoc;                        // serialize
  static fromJSON(doc): CairnGraph;          // load (validates schema + integrity)
}
```

Pure helpers (no class state):
- `renderMermaid(graph): string` — graphviz-style Mermaid of nodes+edges.
- `renderDesignDoc(graph): string` — the narrative `design.md`.
- `summarizeForResume(graph): ResumeBrief` — the structured brief a fresh session reads: goals, accepted decisions (+rationale), open questions, components & status, next actions.

**Integrity rules enforced at every mutation** (these are the production guarantees, each a test):
1. Edge endpoints must exist.
2. Edge type must be legal for the (from.type, to.type) pair (a small allow-list table).
3. No duplicate node ids; ids are deterministic given (type, title, ordinal).
4. `supersede` is the *only* way to retire a node — nodes are never deleted (audit trail / continuity).
5. `fromJSON` rejects a doc that violates any invariant (fail loud, never load a corrupt brain).

---

## 4. Intake — the live studio wizard (`@cairn/studio`)

**Flow:**
1. The agent (driven by the `cairn-brainstorm` skill) composes an **interview**: an ordered list of typed questions (`text`, `single-select`, `multi-select`, `scale`, `mockup-choice`), each able to carry a visual aid (image/diagram/HTML snippet).
2. `cairn studio` starts a tiny Node HTTP server on `127.0.0.1:<port>` and opens the browser.
3. The browser renders a **world-class self-contained wizard** (one HTML file, no build step at the user's machine). It receives the interview as JSON.
4. User answers; each answer POSTs to `/answer`. The agent reads answers from the session file and can **push follow-up questions** (adaptive interview) via an SSE channel — the agent stays in the loop, the server is a pretty, dumb conduit.
5. On "finish," the full transcript is saved to `.cairn/sessions/<id>.json`.
6. The agent synthesizes the transcript into graph nodes/edges, persists `graph.json`, regenerates `design.md` + `graph.mmd`, and commits.

**Graceful degradation (the "fallback"):** in a headless/sandboxed environment with no browser, the same HTML file runs in **static mode** — it embeds the interview, the user fills it in any browser, clicks **Export**, and pastes the JSON back to the agent. Identical question UI, no server required.

**What's tested:** the server's session/answer/SSE logic and the static-export payload shape are integration-tested (supertest-style against the real `http.Server`). The wizard's pure rendering helpers are unit-tested under jsdom.

---

## 5. Resume — continuity (`cairn-resume` skill + `summarizeForResume`)

New chat, zero context:
1. Skill/CLI detects `.cairn/graph.json`.
2. Loads + validates the graph.
3. Emits a `ResumeBrief`: **Goals · Accepted decisions (with rationale) · Open questions · Components and their status · Suggested next actions.**
4. The agent greets the user already knowing the project. Open questions become the next brainstorming round; `done` components are skipped; `test` nodes hand off to the TDD skill.

`ResumeBrief` is a stable, documented shape so every other skill consumes it the same way.

---

## 6. The TDD rewrite (contract, built next cycle)

The failure mode being fixed: *the agent writes a function, wraps logic around it, and at execution time gets "function not found" — there was never a guarantee the test ran red for the right reason or that the logic was exercised before building.*

Cairn's guarantees (each enforced, not advisory):
- **G1 — Red-for-the-right-reason:** the first run must fail with an *assertion* failure (the behavior is wrong), never a *collection/import/reference* error (the symbol is missing). A missing-symbol failure means the test isn't yet a real test; scaffold the minimal signature first, then assert.
- **G2 — Proof of execution:** the test must actually import and *call* the unit under test from its real module path — verified before any implementation is written.
- **G3 — Watched transitions:** red→green is observed by running the suite, with output captured into the graph as a `test` node's evidence. No claim of "passing" without captured pristine output.
- **G4 — No orphan code:** every production symbol traces to a `test` node via a `tests` edge in the graph, or it doesn't ship.

(Full SKILL.md authored this build; logic that backs G1/G2 — e.g. classifying a test failure as assertion-vs-collection — lives in `@cairn/core` and is unit-tested.)

---

## 7. Tech decisions (all taken)

| Area | Choice | Why |
|------|--------|-----|
| Packages | pnpm workspaces | fast, modern, Vercel-friendly |
| Language | TypeScript strict, ESM | clean, no legacy |
| Tests | Vitest | fast, great DX, jsdom built in |
| Lint/format | Biome | one fast tool |
| Studio server | Node `http` (zero deps) | portable, installs anywhere |
| Studio UI | one self-contained HTML file | world-class, no build at user machine, doubles as static fallback |
| Website | Next.js (App Router) + Tailwind + Framer Motion | world-class UI, Vercel-native |
| Distribution | Vercel skills standard (`skills/*/SKILL.md`) | cross-agent, `find-skills` native |

---

## 8. Success criteria (definition of done)

- `@cairn/core`: graph model + GraphStore + renderers + resume + the test-failure classifier, **100% via TDD**, all invariants covered by tests.
- `@cairn/studio`: server + wizard, integration-tested live + static round-trips.
- `@cairn/cli`: `cairn studio`, `cairn resume`, `cairn graph` wired and smoke-tested.
- All six `skills/*/SKILL.md` authored to high quality (brainstorm, resume, tdd, frontend, backend, router).
- `website/`: world-class, responsive, accessible, `next build` clean, deployable to Vercel.
- Whole repo: `pnpm test` green, `pnpm build` green, `pnpm lint` clean, README + docs complete.
- No backward-compat shims, no dead code, no TODOs left in shipped code.
