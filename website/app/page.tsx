import { CommandLine } from '@/components/CommandLine';
import { Footer } from '@/components/Footer';
import { GraphVisual } from '@/components/GraphVisual';
import { Nav } from '@/components/Nav';
import { Reveal } from '@/components/Reveal';
import { SKILLS } from '@/lib/skills';

const HOW_STEPS = [
  {
    n: '01',
    title: 'Brainstorm in the browser',
    body: 'Cairn opens a world-class wizard and asks the right questions — intuitively, one at a time.',
    cmd: 'cairn studio --interview interview.json',
  },
  {
    n: '02',
    title: 'Capture it as a graph',
    body: 'Answers become typed nodes and edges — goals, decisions, components — committed to .cairn/.',
    cmd: 'cairn graph apply ops.json',
  },
  {
    n: '03',
    title: 'Build test-first',
    body: 'Every unit starts from a red that is provably real, not a missing-symbol error.',
    cmd: 'npm test | cairn classify --assert-red',
  },
  {
    n: '04',
    title: 'Resume — from anywhere',
    body: 'A brand-new chat reloads the entire project. Zero context, full understanding.',
    cmd: 'cairn resume',
  },
];

export default function Home() {
  return (
    <main id="top">
      <Nav />

      {/* ───────────────────────── Hero ───────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="grid-bg pointer-events-none absolute inset-0" />
        <div className="container-page relative grid items-center gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
          <div>
            <Reveal>
              <span className="eyebrow">
                <span className="h-1.5 w-1.5 rounded-full bg-mint" />
                The skillpack for agentic development
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
                Your AI never
                <br />
                starts from <span className="gradient-text">zero.</span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
                Cairn turns a brainstorm into a knowledge graph your project carries forever — so
                every new session resumes with full context, builds test-first with real
                guarantees, and pulls in any skill on demand.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <a href="#install" className="btn btn-primary">
                  Get started →
                </a>
                <a href="#problem" className="btn btn-ghost">
                  See how it works
                </a>
              </div>
            </Reveal>
            <Reveal delay={320}>
              <div className="mt-8 max-w-md">
                <CommandLine command="npx skills add cairn-labs/cairn" />
              </div>
            </Reveal>
          </div>

          <Reveal delay={200}>
            <div className="relative">
              <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-sky/10 to-violet/10 blur-2xl" />
              <div className="card relative animate-float p-4 sm:p-6">
                <div className="mb-3 flex items-center gap-2 px-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                  <span className="ml-2 font-mono text-xs text-slate-500">.cairn / graph</span>
                </div>
                <div className="aspect-[470/410] w-full">
                  <GraphVisual />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─────────────────────── The problem ─────────────────────── */}
      <section id="problem" className="border-t border-white/5 py-24">
        <div className="container-page">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky/80">
              The amnesia tax
            </p>
            <h2 className="mt-4 max-w-3xl font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
              Every new chat forgets everything. You pay for it in re-explaining.
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                t: 'Context evaporates',
                b: 'The decisions you made yesterday live in a scrollback nobody can reload. Tomorrow’s session re-asks them.',
              },
              {
                t: 'Tests that don’t test',
                b: 'A function gets written and "tested" together — then fails at runtime with “function not found.” There was never proof it worked.',
              },
              {
                t: 'Capability gaps',
                b: 'Hit a domain your agent doesn’t know, and it improvises instead of reaching for expertise that already exists.',
              },
            ].map((item, i) => (
              <Reveal key={item.t} delay={i * 90}>
                <div className="card card-hover h-full">
                  <div className="mb-3 text-2xl">⚠︎</div>
                  <h3 className="font-display text-lg font-semibold text-white">{item.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────── Continuity ─────────────────────── */}
      <section className="py-24">
        <div className="container-page">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet/80">
                Continuity, by design
              </p>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
                Idea → graph → resume. The thread that never breaks.
              </h2>
              <p className="mt-4 text-slate-400">
                Cairn captures intent as a typed graph and commits it next to your code. The graph
                is the project’s brain — and it travels with the repo.
              </p>
            </div>
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                k: 'Capture',
                t: 'A brainstorm becomes structure',
                b: 'Goals, requirements, decisions, risks and open questions — each a typed node, each connected.',
              },
              {
                k: 'Persist',
                t: 'Committed to your repo',
                b: 'graph.json + a human design doc + a Mermaid diagram, all in .cairn/ and versioned with your code.',
              },
              {
                k: 'Resume',
                t: 'Any session, full context',
                b: 'A fresh agent reads the graph and knows the goals, the decisions, and what’s left to build.',
              },
            ].map((step, i) => (
              <Reveal key={step.k} delay={i * 90}>
                <div className="card card-hover h-full">
                  <span className="font-mono text-xs uppercase tracking-widest text-sky/80">
                    {step.k}
                  </span>
                  <h3 className="mt-3 font-display text-lg font-semibold text-white">{step.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────── TDD fix ─────────────────────── */}
      <section id="tdd" className="border-y border-white/5 bg-ink-900/40 py-24">
        <div className="container-page grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-mint/90">
                Tests that actually test
              </p>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
                A red that’s provably real — before a line of code.
              </h2>
              <p className="mt-4 text-slate-400">
                Most “TDD” starts from a missing-symbol error and calls it red. Cairn’s classifier
                tells the difference between “the symbol doesn’t exist yet” and “the behavior is
                wrong” — and refuses to let you build on a fake red.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  ['G1', 'Red for the right reason — a real assertion, not a missing symbol.'],
                  ['G2', 'Proof of execution — the test calls the real unit at its real path.'],
                  ['G3', 'Watched transitions — red → green observed, never assumed.'],
                  ['G4', 'No orphan code — untested logic doesn’t ship.'],
                ].map(([tag, text]) => (
                  <li key={tag} className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-7 shrink-0 items-center justify-center rounded-md bg-mint/15 font-mono text-xs font-bold text-mint">
                      {tag}
                    </span>
                    <span className="text-sm leading-relaxed text-slate-300">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="card overflow-hidden p-0">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                <span className="ml-2 font-mono text-xs text-slate-500">cairn classify</span>
              </div>
              <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed">
                <code>
                  <span className="text-slate-500">$ npm test | cairn classify --assert-red</span>
                  {'\n\n'}
                  <span className="text-rose-300">TypeError: retryOperation is not a function</span>
                  {'\n'}
                  {'{'}
                  {'\n'}
                  {'  "kind": '}
                  <span className="text-amber-300">"missing-symbol"</span>,{'\n'}
                  {'  "isRealRed": '}
                  <span className="text-rose-300">false</span>
                  {'\n'}
                  {'}'}
                  {'\n'}
                  <span className="text-slate-500"># exit 2 — scaffold the signature first</span>
                  {'\n\n'}
                  <span className="text-slate-500">$ npm test | cairn classify --assert-red</span>
                  {'\n\n'}
                  <span className="text-sky">AssertionError: expected 2 to be 3</span>
                  {'\n'}
                  {'{'}
                  {'\n'}
                  {'  "kind": '}
                  <span className="text-emerald-300">"assertion"</span>,{'\n'}
                  {'  "isRealRed": '}
                  <span className="text-emerald-300">true</span>
                  {'\n'}
                  {'}'}
                  {'\n'}
                  <span className="text-emerald-300/80"># real red ✓ — now build it</span>
                </code>
              </pre>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─────────────────────── Skills ─────────────────────── */}
      <section id="skills" className="py-24">
        <div className="container-page">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky/80">
                One pack, end to end
              </p>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
                Six skills that share one brain.
              </h2>
              <p className="mt-4 text-slate-400">
                Each skill reads the graph instead of re-interrogating you. Open-ended by design —
                the router installs anything else you need.
              </p>
            </div>
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SKILLS.map((skill, i) => (
              <Reveal key={skill.name} delay={(i % 3) * 90}>
                <div className="card card-hover h-full">
                  <div
                    className="grid h-11 w-11 place-items-center rounded-xl text-xl"
                    style={{
                      backgroundColor: `${skill.accent}1f`,
                      color: skill.accent,
                    }}
                  >
                    {skill.glyph}
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-white">
                    {skill.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{skill.tagline}</p>
                  <code className="mt-4 block font-mono text-xs text-slate-500">{skill.name}</code>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────── How it works ─────────────────────── */}
      <section id="how" className="border-t border-white/5 py-24">
        <div className="container-page">
          <Reveal>
            <h2 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
              From idea to shipped — four moves.
            </h2>
          </Reveal>
          <div className="mt-14 space-y-5">
            {HOW_STEPS.map((step, i) => (
              <Reveal key={step.n} delay={i * 70}>
                <div className="card card-hover grid items-center gap-6 md:grid-cols-[auto_1fr_1.1fr]">
                  <span className="font-display text-3xl font-bold text-white/15">{step.n}</span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-white">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-400">{step.body}</p>
                  </div>
                  <CommandLine command={step.cmd} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────── Install CTA ─────────────────────── */}
      <section id="install" className="py-24">
        <div className="container-page">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-ink-800 to-ink-900 px-8 py-16 text-center">
              <div className="grid-bg pointer-events-none absolute inset-0 opacity-60" />
              <div className="relative">
                <h2 className="mx-auto max-w-2xl font-display text-4xl font-extrabold leading-tight text-white">
                  Give your agent a memory it can build on.
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-slate-400">
                  Install the pack across Claude Code, Cursor, Copilot and 18+ agents via the open
                  skills standard.
                </p>
                <div className="mx-auto mt-8 max-w-md">
                  <CommandLine command="npx skills add cairn-labs/cairn" />
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                  <a href="https://github.com/cairn-labs/cairn" className="btn btn-primary">
                    Star on GitHub
                  </a>
                  <a href="#top" className="btn btn-ghost">
                    Back to top
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
