const LINKS = [
  { href: '#problem', label: 'Why' },
  { href: '#how', label: 'How it works' },
  { href: '#skills', label: 'Skills' },
  { href: '#tdd', label: 'The TDD fix' },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-ink-950/70 backdrop-blur-xl">
      <nav className="container-page flex h-16 items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5 font-display text-lg font-bold text-white">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-sky to-violet text-sm text-ink-950">
            ▲
          </span>
          Cairn
        </a>

        <div className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="transition hover:text-white">
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/AnkushBL6/cairn"
            className="hidden text-sm text-slate-300 transition hover:text-white sm:block"
          >
            GitHub
          </a>
          <a href="#install" className="btn btn-primary !px-4 !py-2">
            Get started
          </a>
        </div>
      </nav>
    </header>
  );
}
