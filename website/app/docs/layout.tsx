import { DocsNav } from '@/components/DocsNav';
import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div id="top">
      <Nav />
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[232px_minmax(0,1fr)] lg:gap-14 lg:py-16">
        {/* Desktop rail */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <DocsNav />
          </div>
        </aside>

        {/* Mobile disclosure — no JS, fully accessible */}
        <details className="card group lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between font-display text-base font-semibold text-ink">
            Browse the docs
            <span className="font-mono text-xs text-ink-soft transition-transform group-open:rotate-90">
              ›
            </span>
          </summary>
          <div className="mt-4 border-t border-ink/10 pt-4">
            <DocsNav />
          </div>
        </details>

        <main className="min-w-0">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
