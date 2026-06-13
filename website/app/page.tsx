import { CommandLine } from '@/components/CommandLine';
import { Footer } from '@/components/Footer';
import { GraphVisual } from '@/components/GraphVisual';
import { Nav } from '@/components/Nav';
import { Reveal } from '@/components/Reveal';
import { SKILLS } from '@/lib/skills';

const PROBLEMS = [
  {
    t: 'Context evaporates',
    b: 'Yesterday’s decisions live in a scrollback nobody can reload. Tomorrow’s session re-asks them.',
  },
  {
    t: 'Tests that don’t test',
    b: 'A function gets written and “tested” together — then fails at runtime with “function not found.” No proof it ever worked.',
  },
  {
    t: 'Capability gaps',
    b: 'Hit a domain your agent doesn’t know, and it improvises instead of reaching for expertise that already exists.',
  },
];

const FLOW = [
  { k: 'capture', t: 'A brainstorm becomes structure', b: 'Goals, requirements, decisions, risks and open questions — each a typed node, each connected.' },
  { k: 'persist', t: 'Committed to your repo', b: 'graph.json + a human design doc + a Mermaid diagram, versioned right next to your code.' },
  { k: 'resume', t: 'Any session, full context', b: 'A fresh agent reads the graph and knows the goals, the decisions, and what’s left to build.' },
];

const HOW_STEPS = [
  { n: '01', title: 'Brainstorm in the browser', body: 'Cairn opens a world-class wizard and asks the right questions — one at a time.', cmd: 'cairn studio --interview interview.json' },
  { n: '02', title: 'Capture it as a graph', body: 'Answers become typed nodes and edges, committed to .cairn/.', cmd: 'cairn graph apply ops.json' },
  { n: '03', title: 'Build test-first', body: 'Every unit starts from a red that is provably real, not a missing-symbol error.', cmd: 'npm test | cairn classify --assert-red' },
  { n: '04', title: 'Resume — from anywhere', body: 'A brand-new chat reloads the entire project. Zero context, full understanding.', cmd: 'cairn resume' },
];

export default function Home() {
  return (
    <main id="top">
      <Nav />

      {/* ───────────── Hero ───────────── */}
      <section className="relative overflow-hidden">
        <div className="grid-bg pointer-events-none absolute inset-0" />
        <div className="container-page relative grid items-center gap-14 py-20 lg:grid-cols-[1.08fr_0.92fr] lg:py-28">
          <div>
            <Reveal>
              <span className="eyebrow">
                <span className="h-1.5 w-1.5 rounded-full bg-acid" />
                the skillpack for agentic development
              </span>
            </Reveal>
            <Reveal delay={70}>
              <h1 className="mt-6 font-display text-5xl font-bold leading-[0.95] tracking-tight text-white text-balance sm:text-6xl lg:text-[5.2rem]">
                Your AI never
                <br />
                starts from <span className="gradient-text">zero.</span>
              </h1>
            </Reveal>
            <Reveal delay={150}>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-slate-400">
                Cairn turns a brainstorm into a knowledge graph your project carries forever — so
                every new session resumes with full context, builds test-first with real
                guarantees, and pulls in any skill on demand.
              </p>
            </Reveal>
            <Reveal delay={230}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a href="#install" className="group btn btn-primary text-[15px]">
                  Get started
                  <span className="icon-circle transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-px">
                    →
                  </span>
                </a>
                <a href="#problem" className="btn btn-ghost text-[15px]">
                  See how it works
                </a>
              </div>
            </Reveal>
            <Reveal delay={310}>
              <div className="mt-8 max-w-md">
                <CommandLine command="npx skills add AnkushBL6/cairn" />
              </div>
            </Reveal>
          </div>

          <Reveal delay={200}>
            <div className="bezel float-slow relative">
              <div className="bezel-core p-4 sm:p-6">
                <div className="mb-3 flex items-center gap-2 px-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-acid/70" />
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

      {/* ───────── The amnesia tax — editorial split ───────── */}
      <section id="problem" className="border-t border-white/5 py-28">
        <div className="container-page grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <p className="eyebrow">// the amnesia tax</p>
              <h2 className="mt-6 font-display text-4xl font-bold leading-[1.04] tracking-tight text-white text-balance sm:text-5xl">
                Every new chat forgets everything. You pay for it in re-explaining.
              </h2>
              <p className="mt-6 max-w-md leading-relaxed text-slate-400">
                Three places the cost shows up — and exactly where Cairn erases it.
              </p>
            </div>
          </Reveal>
          <div className="space-y-4">
            {PROBLEMS.map((item, i) => (
              <Reveal key={item.t} delay={i * 90}>
                <div className="card card-hover flex gap-5">
                  <span className="mt-0.5 font-mono text-sm text-acid/70">0{i + 1}</span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-white">{item.t}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.b}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Continuity — staggered ───────── */}
      <section className="py-28">
        <div className="container-page">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow">// continuity, by design</p>
              <h2 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight text-white text-balance sm:text-5xl">
                Idea → graph → resume. The thread that never breaks.
              </h2>
            </div>
          </Reveal>
          <div className="mt-16 grid gap-5 md:grid-cols-3">
            {FLOW.map((step, i) => (
              <Reveal
                key={step.k}
                delay={i * 110}
                className={i === 1 ? 'md:mt-10' : i === 2 ? 'md:mt-20' : ''}
              >
                <div className="card card-hover h-full">
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-acid/80">
                    {step.k}
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-white">{step.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── TDD fix ───────── */}
      <section id="tdd" className="border-y border-white/5 py-28">
        <div className="container-page grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <div>
              <p className="eyebrow">// tests that actually test</p>
              <h2 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white text-balance sm:text-5xl">
                A red that’s provably real — before a line of code.
              </h2>
              <p className="mt-6 leading-relaxed text-slate-400">
                Most “TDD” starts from a missing-symbol error and calls it red. Cairn’s classifier
                tells the difference between “the symbol doesn’t exist yet” and “the behavior is
                wrong” — and refuses to let you build on a fake red.
              </p>
              <ul className="mt-7 space-y-3">
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
            <div className="bezel">
              <div className="bezel-core overflow-hidden">
                <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-acid/70" />
                  <span className="ml-2 font-mono text-xs text-slate-500">cairn classify</span>
                </div>
                <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed">
                  <code>
                    <span className="text-slate-500">$ npm test | cairn classify --assert-red</span>
                    {'\n\n'}
                    <span className="text-rose">TypeError: retryOperation is not a function</span>
                    {'\n'}
                    {'{ "kind": '}
                    <span className="text-amber">"missing-symbol"</span>
                    {', "isRealRed": '}
                    <span className="text-rose">false</span>
                    {' }'}
                    {'\n'}
                    <span className="text-slate-500"># exit 2 — scaffold the signature first</span>
                    {'\n\n'}
                    <span className="text-slate-500">$ npm test | cairn classify --assert-red</span>
                    {'\n\n'}
                    <span className="text-amber">AssertionError: expected 2 to be 3</span>
                    {'\n'}
                    {'{ "kind": '}
                    <span className="text-acid">"assertion"</span>
                    {', "isRealRed": '}
                    <span className="text-acid">true</span>
                    {' }'}
                    {'\n'}
                    <span className="text-acid/80"># real red ✓ — now build it</span>
                  </code>
                </pre>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────── Skills — asymmetric bento ───────── */}
      <section id="skills" className="py-28">
        <div className="container-page">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow">// one pack, end to end</p>
              <h2 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight text-white text-balance sm:text-5xl">
                Six skills that share one brain.
              </h2>
              <p className="mt-5 leading-relaxed text-slate-400">
                Each skill reads the graph instead of re-interrogating you. Open-ended by design —
                the router installs anything else.
              </p>
            </div>
          </Reveal>
          <div className="mt-16 grid gap-4 lg:grid-cols-12">
            {SKILLS.map((skill, i) => (
              <Reveal
                key={skill.name}
                delay={(i % 2) * 80}
                className={i % 2 === 0 ? 'lg:col-span-7' : 'lg:col-span-5'}
              >
                <div className="card card-hover flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl"
                      style={{ backgroundColor: `${skill.accent}1f`, color: skill.accent }}
                    >
                      {skill.glyph}
                    </div>
                    <code className="mt-1 font-mono text-[11px] text-slate-500">{skill.name}</code>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold text-white">
                    {skill.title}
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">
                    {skill.tagline}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── How it works ───────── */}
      <section id="how" className="border-t border-white/5 py-28">
        <div className="container-page">
          <Reveal>
            <h2 className="font-display text-4xl font-bold leading-tight tracking-tight text-white text-balance sm:text-5xl">
              From idea to shipped — four moves.
            </h2>
          </Reveal>
          <div className="mt-14 space-y-4">
            {HOW_STEPS.map((step, i) => (
              <Reveal key={step.n} delay={i * 70}>
                <div className="card card-hover grid items-center gap-6 md:grid-cols-[auto_1fr_1.1fr]">
                  <span className="font-display text-4xl font-bold text-white/10">{step.n}</span>
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

      {/* ───────── Install CTA ───────── */}
      <section id="install" className="py-28">
        <div className="container-page">
          <Reveal>
            <div className="bezel">
              <div className="bezel-core relative overflow-hidden px-8 py-16 text-center">
                <div className="grid-bg pointer-events-none absolute inset-0 opacity-60" />
                <div className="relative">
                  <h2 className="mx-auto max-w-2xl font-display text-4xl font-bold leading-tight tracking-tight text-white text-balance sm:text-5xl">
                    Give your agent a memory it can build on.
                  </h2>
                  <p className="mx-auto mt-5 max-w-xl leading-relaxed text-slate-400">
                    Install the pack across Claude Code, Cursor, Copilot and 18+ agents via the open
                    skills standard.
                  </p>
                  <div className="mx-auto mt-8 max-w-md">
                    <CommandLine command="npx skills add AnkushBL6/cairn" />
                  </div>
                  <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                    <a
                      href="https://github.com/AnkushBL6/cairn"
                      className="group btn btn-primary text-[15px]"
                    >
                      Star on GitHub
                      <span className="icon-circle transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-px">
                        ↗
                      </span>
                    </a>
                    <a href="#top" className="btn btn-ghost text-[15px]">
                      Back to top
                    </a>
                  </div>
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
