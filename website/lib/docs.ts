import { type Skill, SKILLS } from './skills';

/** A renderable block inside a skill doc section. */
export type DocBlock =
  | { kind: 'p'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'cmd'; command: string }
  | { kind: 'steps'; steps: { n: string; title: string; body: string; cmd?: string }[] }
  | { kind: 'guarantees'; items: [string, string][] };

export type DocSection = { heading: string; blocks: DocBlock[] };

export type SkillDoc = Skill & {
  /** Frontmatter description — the one-liner that triggers the skill. */
  description: string;
  /** The single core principle the skill is organized around. */
  principle: string;
  /** Install just this skill from the open skills standard. */
  install: string;
  whenToUse: string[];
  sections: DocSection[];
};

const BY_NAME = new Map(SKILLS.map((s) => [s.name, s]));

function base(name: string): Skill {
  const skill = BY_NAME.get(name);
  if (!skill) throw new Error(`docs.ts: unknown skill "${name}"`);
  return skill;
}

export const SKILL_DOCS: SkillDoc[] = [
  {
    ...base('cairn-brainstorm'),
    description:
      'Use BEFORE building any feature or starting a project. Runs an interactive, browser-based brainstorming session, then saves the design as a persistent knowledge graph in .cairn/ so future sessions never start from zero.',
    principle:
      'A conversation is lost the moment the chat ends. A graph is forever. Capture intent as a graph, not as scrollback.',
    install: 'npx skills add AnkushBL6/cairn@cairn-brainstorm',
    whenToUse: [
      'Starting a new project or a substantial feature.',
      "Any time you're about to make design decisions you'll need to remember later.",
      'Whenever you catch yourself asking the user to “remind me what we decided.”',
    ],
    sections: [
      {
        heading: 'Always check for an existing brain first',
        blocks: [
          {
            kind: 'p',
            text: 'If `.cairn/graph.json` already exists, stop and run cairn-resume — the context you need may already be captured. Only brainstorm when there is genuinely new design to capture.',
          },
        ],
      },
      {
        heading: 'The flow',
        blocks: [
          {
            kind: 'steps',
            steps: [
              {
                n: '01',
                title: 'Compose the interview',
                body: 'Write a JSON interview that asks about purpose, constraints, success criteria, and the key forks — one concept per question. Prefer single/multi/scale answers over free text where the space of answers is known.',
                cmd: '.cairn/.runtime/interview.json',
              },
              {
                n: '02',
                title: 'Run the studio',
                body: 'A world-class wizard opens in the browser; the user answers one question at a time. Headless? Add --static for a self-contained HTML file the user exports and you re-ingest.',
                cmd: 'cairn studio --interview .cairn/.runtime/interview.json',
              },
              {
                n: '03',
                title: 'Synthesize the graph',
                body: 'Map answers to typed nodes (goal, requirement, decision, constraint, component, question, risk) and connect them with typed edges. Apply atomically; use ref aliases to wire nodes created in the same batch.',
                cmd: 'cairn graph apply .cairn/.runtime/ops.json',
              },
              {
                n: '04',
                title: 'Verify & iterate',
                body: "Read it back. If it doesn't capture the discussion faithfully, fix the ops and re-apply. For unresolved questions, run another short, focused interview round.",
                cmd: 'cairn resume',
              },
            ],
          },
        ],
      },
      {
        heading: 'Hand-off',
        blocks: [
          {
            kind: 'p',
            text: 'Once the graph captures the design, components with open work hand off to cairn-tdd (logic), cairn-frontend (UI), and cairn-backend (services). Missing capabilities hand off to cairn-router.',
          },
        ],
      },
    ],
  },
  {
    ...base('cairn-resume'),
    description:
      "Use at the START of any session in a project that has a .cairn/ directory. Reloads the project's knowledge graph so you have full context — goals, decisions, open questions, and what's left to build — with zero prior conversation.",
    principle: 'Never ask the user something the graph already answers.',
    install: 'npx skills add AnkushBL6/cairn@cairn-resume',
    whenToUse: [
      'The first thing you do in any session inside a repo that contains `.cairn/graph.json`.',
      'After a context reset or a hand-off between sessions or agents.',
      'Any time you feel unsure “what was decided here.”',
    ],
    sections: [
      {
        heading: 'Reload the brain',
        blocks: [
          {
            kind: 'p',
            text: 'A fresh chat has no memory — but the project does. It lives in `.cairn/`. `cairn resume` reconstructs the brief a context-free session reads first: the goals, the accepted decisions, the built components and what they depend on, the open questions, the risks, and the suggested next actions.',
          },
          { kind: 'cmd', command: 'cairn resume' },
        ],
      },
      {
        heading: 'Inspect and update as you work',
        blocks: [
          {
            kind: 'p',
            text: 'Print the raw graph (ids, statuses, Mermaid) when you need the structure, and keep the brain truthful as state changes — mark a component done, answer a question, accept a decision.',
          },
          { kind: 'cmd', command: 'cairn graph show' },
          { kind: 'cmd', command: 'cairn graph set component--payment-form --status done' },
        ],
      },
    ],
  },
  {
    ...base('cairn-tdd'),
    description:
      'Use when implementing any feature or bugfix, before writing implementation code. A test-first workflow with hard, tool-enforced guarantees that the test ran red for the RIGHT reason (a real assertion, not a missing-symbol error) and that the unit is genuinely exercised before you build it.',
    principle:
      'NO PRODUCTION LOGIC WITHOUT A TEST THAT FIRST FAILED ON AN ASSERTION. Wrote the implementation before the assertion-level red? Delete it. Start from the test.',
    install: 'npx skills add AnkushBL6/cairn@cairn-tdd',
    whenToUse: [
      'Implementing any feature or bugfix, before writing implementation code.',
      'Any non-trivial unit: validation, business rules, data mapping, reducers, retries.',
      'Skip it only for throwaway spikes, generated code, or pure config — everything else is test-first.',
    ],
    sections: [
      {
        heading: 'The four guarantees',
        blocks: [
          {
            kind: 'guarantees',
            items: [
              [
                'G1',
                'Red for the right reason — the first failing run fails on a real assertion, not a missing symbol, module, or syntax error.',
              ],
              [
                'G2',
                'Proof of execution — the test imports and calls the unit at its real module path. Missing symbol? Scaffold the minimal signature first.',
              ],
              [
                'G3',
                'Watched transitions — you run the suite and observe red → green from captured output, never assume it.',
              ],
              ['G4', 'No orphan code — every production symbol is reachable from a test. Untested logic does not ship.'],
            ],
          },
        ],
      },
      {
        heading: 'The loop',
        blocks: [
          {
            kind: 'steps',
            steps: [
              {
                n: '01',
                title: 'Write ONE behavioral test',
                body: 'One behavior, a clear name, real inputs and outputs. Import the unit from the module path it will actually live at — even though it does not exist yet.',
              },
              {
                n: '02',
                title: 'Run it and classify the failure',
                body: 'missing-symbol → exit 2 (scaffold the signature first). collection → fix the test file. assertion → exit 0, a real red you can build against.',
                cmd: 'npm test 2>&1 | cairn classify --assert-red',
              },
              {
                n: '03',
                title: 'Write the minimal code',
                body: 'Just enough to pass the test. No extra options, no speculative features. Then run and watch it go green with your own eyes.',
                cmd: 'npm test 2>&1 | cairn classify',
              },
              {
                n: '04',
                title: 'Refactor, then record',
                body: 'Clean up while staying green, then record the proof in the graph — a test node and a `tests` edge — so it survives the session.',
                cmd: 'cairn graph apply ops.json',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    ...base('cairn-frontend'),
    description:
      'Use when building or changing user interfaces (web or mobile). Produces world-class, accessible UI driven by the project graph — design tokens, component isolation, Vercel-grade performance (no waterfalls, server-first, bundle-aware), and logic tested via cairn-tdd.',
    principle:
      'A UI is a system of tokens and states, not a pile of one-off styles. Design the system; the screens fall out of it.',
    install: 'npx skills add AnkushBL6/cairn@cairn-frontend',
    whenToUse: [
      'Building or changing any user interface, web or mobile.',
      'Read the graph first — stack, constraints, and components are already recorded.',
      'If the design is missing or vague, go back to cairn-brainstorm rather than guessing.',
    ],
    sections: [
      {
        heading: 'The standard (non-negotiable)',
        blocks: [
          {
            kind: 'list',
            items: [
              'Design tokens first — color, spacing, radius, type scale, shadow, motion as variables. Dark mode is a token swap, not a rewrite.',
              'Accessibility is a requirement, not a polish pass — semantic HTML, labelled controls, visible focus, keyboard paths, prefers-reduced-motion, AA contrast.',
              'Component isolation — one job, a typed prop contract, understandable without reading its parents. State stays as local as it can.',
              'States are designed, not discovered — default, loading, empty, error, disabled, and overflow.',
              'Performance is a feature — no layout shift, lazy below the fold, ship less JS, animate transform/opacity not layout.',
              'Responsive by construction — fluid layouts; test the smallest and largest target widths the constraints imply.',
            ],
          },
        ],
      },
      {
        heading: 'Performance discipline (Vercel React best practices)',
        blocks: [
          {
            kind: 'list',
            items: [
              'Kill waterfalls — independent async work runs in parallel; start promises early, await late; stream with Suspense.',
              'Guard the bundle — dynamic-import heavy/below-the-fold code, import exact paths not barrels, defer third-party until after hydration.',
              'Server-first — default to Server Components; dedupe reads with React.cache(); pass the minimum across the server→client boundary.',
              'Re-render hygiene — derive state during render, never define a component inside another, use primitive effect deps.',
            ],
          },
          {
            kind: 'p',
            text: 'Before a screen is “done”, verify with Lighthouse (Performance ≥ 95, CLS 0) and axe (0 violations). Logic — formatting, validation, reducers, data shaping — is built test-first with cairn-tdd.',
          },
          { kind: 'cmd', command: 'cairn resume' },
        ],
      },
    ],
  },
  {
    ...base('cairn-backend'),
    description:
      'Use when building services, APIs, data layers, or background jobs. Produces clean, well-bounded, typed, observable backends driven by the project graph — runtime-aware (serverless/edge constraints, Web Request/Response handlers) with all logic built test-first via cairn-tdd.',
    principle: 'Design the contracts and the failure modes first. The happy path is the easy 20%.',
    install: 'npx skills add AnkushBL6/cairn@cairn-backend',
    whenToUse: [
      'Building a service, API, data layer, or background job.',
      'Read the graph first — goals, data decisions, and constraints (latency, compliance) are already recorded.',
      'Missing or fuzzy contract? Back to cairn-brainstorm.',
    ],
    sections: [
      {
        heading: 'The standard (non-negotiable)',
        blocks: [
          {
            kind: 'list',
            items: [
              'Explicit contracts — typed input/output and a documented error set per endpoint. Validate at the boundary; never trust input.',
              'Clear boundaries — one module, one responsibility. Side effects (I/O, clock, randomness) injected so logic stays pure and testable.',
              'Failure modes are designed — decide what is retryable, idempotent, or a hard fail. Return typed errors, never swallow silently.',
              'Security by default — parameterized queries, authz at the boundary, secrets from the environment, least privilege, no PII in logs.',
              'Observability — structured logs with correlation, metrics on the paths that matter, errors that carry debugging context.',
              'Data changes are reversible — forward-only, reviewed migrations; never mutate persisted shape without one.',
            ],
          },
        ],
      },
      {
        heading: 'Serverless & runtime discipline (Vercel Functions)',
        blocks: [
          {
            kind: 'list',
            items: [
              'Web-standard handlers — named exports using the Web Request/Response API, not Express or NextApiRequest.',
              'Pick the runtime deliberately — Node for full APIs and DB drivers; Edge for sub-millisecond cold starts (no fs, no native modules).',
              'The filesystem is ephemeral and read-only — persist to object storage or a database, never local files.',
              'Process memory is not shared across invocations — use a real cache (Runtime Cache, Redis), not an in-process Map.',
              'Respect execution limits — return fast, push post-response work to waitUntil/after, use a durable workflow for long flows.',
              'Pool DB connections, and protect public cron endpoints with a shared secret.',
            ],
          },
          {
            kind: 'p',
            text: 'Every non-trivial unit is built test-first with cairn-tdd. Inject the clock/uuid/db so the unit is deterministic — backends are full of functions that “exist” but were never actually tested.',
          },
          { kind: 'cmd', command: 'cairn resume' },
        ],
      },
    ],
  },
  {
    ...base('cairn-review'),
    description:
      'Use when reviewing a change, diff, or PR before merge. Reviews the work against the project graph — does it satisfy the requirements, decisions, and constraints it claims, is every new symbol tested (no orphan code), and does the graph still tell the truth?',
    principle: 'Review against the spec, not just the style. The graph is the spec.',
    install: 'npx skills add AnkushBL6/cairn@cairn-review',
    whenToUse: [
      'Before merging any change, diff, or PR of consequence.',
      "When you pick up someone else's branch and need to judge whether it's done.",
      'After a build skill finishes a component, as the gate before it ships.',
    ],
    sections: [
      {
        heading: 'Review against the graph, not your taste',
        blocks: [
          {
            kind: 'p',
            text: 'The graph already holds the requirements, the accepted decisions, and the hard constraints — so map the diff to the nodes it claims to advance and measure it against the spec. A change with no home in the graph is the first finding: either scope creep, or a missing node.',
          },
          { kind: 'cmd', command: 'cairn resume' },
          { kind: 'cmd', command: 'cairn graph show' },
        ],
      },
      {
        heading: 'The standard (graph-grounded)',
        blocks: [
          {
            kind: 'list',
            items: [
              'Conformance — every changed area traces to a requirement or component node it actually satisfies, not a vaguer neighbour.',
              'Decisions honoured — no accepted decision is quietly violated; a deliberate change supersedes it on the record.',
              'Constraints are gates, not goals — every relevant constraint (a11y, latency, compliance) is met now, not deferred.',
              'Proof of test (G1–G4) — new logic arrived test-first, exercised at its real path, with no orphan untested symbols.',
              'Surgical — every changed line traces to the task; flag drive-by refactors and reformatting.',
              'The graph still tells the truth — new components/tests recorded, statuses updated, resolved questions closed.',
            ],
          },
          {
            kind: 'p',
            text: 'Verify the tests rather than trust them — the same classifier the cairn-tdd skill and the CI TDD Guard use:',
          },
          { kind: 'cmd', command: 'npm test 2>&1 | cairn classify' },
        ],
      },
      {
        heading: 'The verdict',
        blocks: [
          {
            kind: 'p',
            text: 'Be decisive and specific: each finding names the node it offends and what to do. Approve only when the change satisfies its node, honours the decisions, meets the constraints, and leaves the graph truthful — then record the status change so the next session inherits reality.',
          },
          { kind: 'cmd', command: 'cairn graph set component--paymentform --status done' },
        ],
      },
    ],
  },
  {
    ...base('cairn-router'),
    description:
      'Use when a request needs a capability Cairn\'s own skills don\'t cover (e.g. "work with PDFs", "set up Stripe", "write Terraform"). Discovers and installs the right skill on demand from the open agent-skills ecosystem via npx skills, after checking Cairn\'s built-in skills first.',
    principle:
      'Prefer a vetted, installed skill over winging it. If the work is common, someone has packaged the expertise.',
    install: 'npx skills add AnkushBL6/cairn@cairn-router',
    whenToUse: [
      'A request needs a capability none of Cairn’s built-in skills cover.',
      'Working with a new domain — PDFs, payments, infra-as-code, a specific framework.',
      'Before improvising expertise you could simply acquire.',
    ],
    sections: [
      {
        heading: 'Route to a built-in first',
        blocks: [
          {
            kind: 'list',
            items: [
              'Starting a project or a feature’s design → cairn-brainstorm.',
              '“What were we doing?” / a new session in an existing project → cairn-resume.',
              'Implementing logic or a bugfix → cairn-tdd.',
              'Building UI (web/mobile) → cairn-frontend.',
              'Building a service, API, or data layer → cairn-backend.',
              'A capability none of the above covers → find & install below.',
            ],
          },
        ],
      },
      {
        heading: 'Find & install a skill on demand',
        blocks: [
          {
            kind: 'p',
            text: 'Search the open registry, vet candidates for trustworthiness, present the options, and install with the user’s consent. If nothing good exists, offer to create one.',
          },
          { kind: 'cmd', command: 'npx skills find pdf' },
          { kind: 'cmd', command: 'npx skills add <owner>/<repo>@<skill>' },
          { kind: 'cmd', command: 'npx skills list' },
        ],
      },
    ],
  },
];

export const SKILL_SLUGS = SKILL_DOCS.map((d) => d.name);

export function getSkillDoc(slug: string): SkillDoc | undefined {
  return SKILL_DOCS.find((d) => d.name === slug);
}
