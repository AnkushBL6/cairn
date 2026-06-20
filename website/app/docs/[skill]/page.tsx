import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CommandLine } from '@/components/CommandLine';
import { Reveal } from '@/components/Reveal';
import { type DocBlock, SKILL_DOCS, SKILL_SLUGS, getSkillDoc } from '@/lib/docs';

type Params = { skill: string };

export function generateStaticParams(): Params[] {
  return SKILL_SLUGS.map((skill) => ({ skill }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { skill } = await params;
  const doc = getSkillDoc(skill);
  if (!doc) return { title: 'Not found' };
  return {
    title: doc.title,
    description: doc.description,
    openGraph: { title: `${doc.title} · Cairn`, description: doc.description },
  };
}

function Block({ block }: { block: DocBlock }) {
  switch (block.kind) {
    case 'p':
      return <p className="mt-4 leading-relaxed text-stone-600">{block.text}</p>;
    case 'list':
      return (
        <ul className="mt-4 space-y-2.5">
          {block.items.map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-relaxed text-stone-700">
              <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-acid/70" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case 'cmd':
      return (
        <div className="mt-4 max-w-xl">
          <CommandLine command={block.command} />
        </div>
      );
    case 'guarantees':
      return (
        <ul className="mt-4 space-y-3">
          {block.items.map(([tag, text]) => (
            <li key={tag} className="flex gap-3">
              <span className="mt-0.5 inline-flex h-6 w-7 shrink-0 items-center justify-center rounded-md bg-acid/10 font-mono text-xs font-bold text-acid">
                {tag}
              </span>
              <span className="text-sm leading-relaxed text-stone-700">{text}</span>
            </li>
          ))}
        </ul>
      );
    case 'steps':
      return (
        <ol className="mt-5 space-y-4">
          {block.steps.map((step) => (
            <li key={step.n} className="card grid gap-4 md:grid-cols-[auto_1fr]">
              <span className="inline-grid h-9 w-9 shrink-0 place-items-center self-start rounded-lg bg-acid/10 font-mono text-sm font-semibold text-acid">
                {step.n}
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-base font-semibold text-ink">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{step.body}</p>
                {step.cmd ? (
                  <div className="mt-3">
                    <CommandLine command={step.cmd} />
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      );
  }
}

export default async function SkillDocPage({ params }: { params: Promise<Params> }) {
  const { skill } = await params;
  const doc = getSkillDoc(skill);
  if (!doc) notFound();

  const index = SKILL_DOCS.findIndex((d) => d.name === doc.name);
  const prev = index > 0 ? SKILL_DOCS[index - 1] : undefined;
  const next = index < SKILL_DOCS.length - 1 ? SKILL_DOCS[index + 1] : undefined;

  return (
    <article className="max-w-3xl">
      <Reveal>
        <Link
          href="/docs"
          className="font-mono text-xs text-ink-soft transition-colors hover:text-ink"
        >
          ← Docs
        </Link>
        <div className="mt-5 flex items-center gap-4">
          <span
            aria-hidden
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl"
            style={{ backgroundColor: `${doc.accent}1f`, color: doc.accent }}
          >
            {doc.glyph}
          </span>
          <div>
            <h1 className="font-display text-3xl font-semibold leading-tight tracking-[-0.01em] text-ink sm:text-4xl">
              {doc.title}
            </h1>
            <code className="font-mono text-xs text-stone-500">{doc.name}</code>
          </div>
        </div>
        <p className="mt-6 text-lg leading-relaxed text-stone-600">{doc.description}</p>

        <div className="mt-7 max-w-xl">
          <CommandLine command={doc.install} />
        </div>

        <div className="mt-8 rounded-2xl border-l-2 border-acid bg-acid/[0.06] px-5 py-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-acid">Core principle</p>
          <p className="mt-2 font-display text-lg leading-snug text-ink">{doc.principle}</p>
        </div>
      </Reveal>

      <Reveal delay={70}>
        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold text-ink">When to use it</h2>
          <ul className="mt-4 space-y-2.5">
            {doc.whenToUse.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-relaxed text-stone-700">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-acid/70" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </Reveal>

      {doc.sections.map((section) => (
        <Reveal key={section.heading} delay={70}>
          <section className="mt-12">
            <h2 className="font-display text-xl font-semibold text-ink">{section.heading}</h2>
            {section.blocks.map((block, i) => (
              <Block key={`${section.heading}-${i}`} block={block} />
            ))}
          </section>
        </Reveal>
      ))}

      {/* Prev / next */}
      <nav className="mt-16 grid gap-4 border-t border-ink/10 pt-8 sm:grid-cols-2">
        {prev ? (
          <Link href={`/docs/${prev.name}`} className="card card-hover group">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
              ← Previous
            </span>
            <p className="mt-1.5 font-display text-base font-semibold text-ink">{prev.title}</p>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/docs/${next.name}`} className="card card-hover group text-right">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
              Next →
            </span>
            <p className="mt-1.5 font-display text-base font-semibold text-ink">{next.title}</p>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
