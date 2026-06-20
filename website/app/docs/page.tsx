import type { Metadata } from 'next';
import Link from 'next/link';
import { CommandLine } from '@/components/CommandLine';
import { Reveal } from '@/components/Reveal';
import { SKILL_DOCS } from '@/lib/docs';

export const metadata: Metadata = {
  title: 'Docs',
  description:
    'How Cairn works: the typed knowledge graph, the four TDD guarantees, and the six skills that share one brain.',
};

const NODE_TYPES = [
  ['goal', '#15803d'],
  ['requirement', '#16a34a'],
  ['decision', '#0f766e'],
  ['component', '#047857'],
  ['constraint', '#b4530a'],
  ['question', '#b45309'],
  ['risk', '#be123c'],
  ['test', '#4d7c0f'],
  ['artifact', '#0d9488'],
] as const;

const EDGE_TYPES = [
  'refines',
  'depends_on',
  'decided_by',
  'implements',
  'tests',
  'blocks',
  'supersedes',
  'derived_from',
];

const GUARANTEES: [string, string][] = [
  ['G1', 'Red for the right reason — a real assertion, not a missing symbol.'],
  ['G2', 'Proof of execution — the test calls the real unit at its real path.'],
  ['G3', 'Watched transitions — red → green observed, never assumed.'],
  ['G4', 'No orphan code — untested logic doesn’t ship.'],
];

export default function DocsIndex() {
  return (
    <div className="max-w-3xl">
      <Reveal>
        <p className="eyebrow">// documentation</p>
        <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.01em] text-ink text-balance sm:text-5xl">
          Cairn, end to end.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-stone-600">
          Cairn captures a brainstorm as a typed knowledge graph in <code className="rounded bg-ink/5 px-1.5 py-0.5 font-mono text-[0.9em] text-ink">.cairn/</code>, builds
          test-first with real guarantees, and resumes any session with full context. Here’s the
          model and the moves — then dive into each skill.
        </p>
        <div className="mt-7 max-w-md">
          <CommandLine command="npx skills add AnkushBL6/cairn" />
        </div>
      </Reveal>

      {/* The model */}
      <Reveal delay={80}>
        <section className="mt-16">
          <h2 className="font-display text-2xl font-semibold text-ink">The graph model</h2>
          <p className="mt-3 leading-relaxed text-stone-600">
            The project brain is typed nodes connected by typed edges — pure, serializable, and
            committed to git. Integrity invariants reject any nonsensical relationship, so the brain
            can never encode something like “a goal depends on a goal.”
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="card">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-acid">9 node types</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {NODE_TYPES.map(([label, color]) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 px-2.5 py-1 font-mono text-xs text-ink-soft"
                  >
                    <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: color }} />
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="card">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-teal">8 edge types</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {EDGE_TYPES.map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-ink/10 px-2.5 py-1 font-mono text-xs text-ink-soft"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-stone-600">
            See it live — add nodes and watch the Mermaid source update — in the{' '}
            <Link href="/playground" className="font-medium text-acid underline-offset-4 hover:underline">
              interactive graph playground
            </Link>
            .
          </p>
        </section>
      </Reveal>

      {/* The four guarantees */}
      <Reveal delay={80}>
        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold text-ink">Guaranteed TDD</h2>
          <p className="mt-3 leading-relaxed text-stone-600">
            Cairn’s classifier tells a real red (a behavioral assertion) from a fake one (a symbol
            that doesn’t exist yet) — and refuses to let you build on the fake one.
          </p>
          <ul className="mt-6 space-y-3">
            {GUARANTEES.map(([tag, text]) => (
              <li key={tag} className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-7 shrink-0 items-center justify-center rounded-md bg-acid/10 font-mono text-xs font-bold text-acid">
                  {tag}
                </span>
                <span className="text-sm leading-relaxed text-stone-700">{text}</span>
              </li>
            ))}
          </ul>
        </section>
      </Reveal>

      {/* The skills */}
      <Reveal delay={80}>
        <section className="mt-16">
          <h2 className="font-display text-2xl font-semibold text-ink">The six skills</h2>
          <p className="mt-3 leading-relaxed text-stone-600">
            Each reads the graph instead of re-interrogating you. Open the one you need.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {SKILL_DOCS.map((doc) => (
              <Link
                key={doc.name}
                href={`/docs/${doc.name}`}
                className="card card-hover group flex h-full flex-col"
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg"
                    style={{ backgroundColor: `${doc.accent}1f`, color: doc.accent }}
                  >
                    {doc.glyph}
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold text-ink">{doc.title}</h3>
                    <code className="font-mono text-[11px] text-stone-500">{doc.name}</code>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">{doc.tagline}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-acid">
                  Read
                  <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </Reveal>
    </div>
  );
}
