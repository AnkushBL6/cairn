export function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="container-page flex flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-2.5 font-display font-bold text-white">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-sky to-violet text-xs text-ink-950">
            ▲
          </span>
          Cairn
        </div>
        <p className="text-sm text-slate-500">
          Built test-first with Cairn. Your AI never starts from zero.
        </p>
        <div className="flex items-center gap-6 text-sm text-slate-400">
          <a href="https://github.com/cairn-labs/cairn" className="transition hover:text-white">
            GitHub
          </a>
          <a href="#install" className="transition hover:text-white">
            Install
          </a>
          <a href="#skills" className="transition hover:text-white">
            Skills
          </a>
        </div>
      </div>
    </footer>
  );
}
