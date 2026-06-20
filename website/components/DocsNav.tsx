'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SKILL_DOCS } from '@/lib/docs';

const TOP = [
  { href: '/docs', label: 'Overview', glyph: '◆' },
  { href: '/playground', label: 'Graph playground', glyph: '◈' },
];

/** The docs left rail: overview, the interactive playground, and every skill. */
export function DocsNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Documentation" className="flex flex-col gap-1">
      {TOP.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
              active
                ? 'bg-acid/10 font-semibold text-acid'
                : 'text-ink-soft hover:bg-ink/[0.04] hover:text-ink'
            }`}
          >
            <span aria-hidden className="text-[13px] opacity-70">
              {item.glyph}
            </span>
            {item.label}
          </Link>
        );
      })}

      <p className="mt-5 px-3 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-soft/70">
        The seven skills
      </p>

      {SKILL_DOCS.map((doc) => {
        const href = `/docs/${doc.name}`;
        const active = pathname === href;
        return (
          <Link
            key={doc.name}
            href={href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
              active
                ? 'bg-acid/10 font-semibold text-acid'
                : 'text-ink-soft hover:bg-ink/[0.04] hover:text-ink'
            }`}
          >
            <span
              aria-hidden
              className="grid h-6 w-6 shrink-0 place-items-center rounded-lg text-sm"
              style={{ backgroundColor: `${doc.accent}1f`, color: doc.accent }}
            >
              {doc.glyph}
            </span>
            <span className="flex flex-col leading-tight">
              <span className={active ? 'text-acid' : 'text-ink'}>{doc.title}</span>
              <span className="font-mono text-[10.5px] text-ink-soft/70">{doc.name}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
