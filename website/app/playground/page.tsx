import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';
import { Playground } from '@/components/Playground';
import { Reveal } from '@/components/Reveal';

export const metadata: Metadata = {
  title: 'Graph playground',
  description:
    'Explore Cairn’s typed knowledge graph interactively — inspect nodes, filter by type, add your own, and watch the Mermaid source update live.',
};

export default function PlaygroundPage() {
  return (
    <div id="top">
      <Nav />
      <main className="container-page py-12 lg:py-16">
        <Reveal>
          <p className="eyebrow">// interactive</p>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.04] tracking-[-0.01em] text-ink text-balance sm:text-5xl">
            The knowledge graph, in your hands.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-600">
            This is a real project brain — a checkout redesign captured as typed nodes and edges.
            Click a node to inspect it, toggle a type to filter, add your own, and watch the same
            Mermaid source Cairn commits to <code className="rounded bg-ink/5 px-1.5 py-0.5 font-mono text-[0.9em] text-ink">.cairn/graph.mmd</code> update live.
          </p>
        </Reveal>

        <Reveal delay={90}>
          <div className="mt-10">
            <Playground />
          </div>
        </Reveal>

        <Reveal delay={60}>
          <p className="mt-10 text-sm leading-relaxed text-stone-600">
            Every relationship here is one the engine’s edge-legality table allows — a constraint can
            block a component, a requirement refines a goal, a test tests a component. Learn the full
            model in the{' '}
            <Link href="/docs" className="font-medium text-acid underline-offset-4 hover:underline">
              docs
            </Link>
            .
          </p>
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}
