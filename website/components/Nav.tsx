const LINKS = [
  { href: '#problem', label: 'Why' },
  { href: '#how', label: 'How it works' },
  { href: '#skills', label: 'Skills' },
  { href: '#tdd', label: 'The TDD fix' },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-50 px-4 pt-5">
      <nav className="mx-auto flex h-14 max-w-3xl items-center justify-between rounded-full border border-ink/10 bg-paper-50/80 py-2 pl-5 pr-2.5 shadow-[0_12px_34px_-20px_rgba(60,45,20,0.45)] backdrop-blur-xl">
        <a href="#top" className="flex items-center gap-2.5 font-display text-lg font-semibold text-ink">
          <span className="grid h-7 w-7 place-items-center rounded-[0.6rem] bg-gradient-to-br from-acid-bright to-teal text-sm text-paper-50">
            ▲
          </span>
          Cairn
        </a>

        <div className="hidden items-center gap-7 text-[13px] text-ink-soft md:flex">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-ink">
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/AnkushBL6/cairn"
            className="hidden px-2 text-[13px] text-ink-soft transition-colors hover:text-ink sm:block"
          >
            GitHub
          </a>
          <a href="#install" className="group btn btn-primary !py-1.5 !pl-4 !pr-1.5 text-[13px]">
            Get started
            <span className="icon-circle h-6 w-6 transition-transform duration-500 group-hover:translate-x-0.5">
              →
            </span>
          </a>
        </div>
      </nav>
    </header>
  );
}
