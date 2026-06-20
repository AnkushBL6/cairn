import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-ink/10 py-12">
      <div className="container-page flex flex-col items-center justify-between gap-6 sm:flex-row">
        <Link href="/" className="flex items-center gap-2.5 font-display text-lg font-semibold text-ink">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-acid-bright to-teal text-xs text-paper-50">
            ▲
          </span>
          Cairn
        </Link>
        <p className="font-mono text-xs text-ink-soft/80">
          Built test-first with Cairn. Your AI never starts from zero.
        </p>
        <div className="flex items-center gap-6 text-sm text-ink-soft">
          <a href="https://github.com/AnkushBL6/cairn" className="transition-colors hover:text-ink">
            GitHub
          </a>
          <Link href="/docs" className="transition-colors hover:text-ink">
            Docs
          </Link>
          <Link href="/playground" className="transition-colors hover:text-ink">
            Playground
          </Link>
          <Link href="/#install" className="transition-colors hover:text-ink">
            Install
          </Link>
        </div>
      </div>
    </footer>
  );
}
