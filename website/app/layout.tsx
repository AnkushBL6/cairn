import type { Metadata, Viewport } from 'next';
import './globals.css';

const description =
  'Cairn is the skillpack that gives your AI agent continuity: brainstorm into a persistent knowledge graph, build test-first with real guarantees, and pull in any skill on demand.';

export const metadata: Metadata = {
  metadataBase: new URL('https://cairn.dev'),
  title: {
    default: 'Cairn — your AI never starts from zero',
    template: '%s · Cairn',
  },
  description,
  keywords: [
    'AI agent',
    'Claude Code',
    'agent skills',
    'knowledge graph',
    'TDD',
    'continuity',
    'brainstorming',
    'Vercel skills',
  ],
  authors: [{ name: 'Cairn' }],
  openGraph: {
    title: 'Cairn — your AI never starts from zero',
    description,
    url: 'https://cairn.dev',
    siteName: 'Cairn',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cairn — your AI never starts from zero',
    description,
  },
};

export const viewport: Viewport = {
  themeColor: '#070a0f',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Loaded at runtime in the browser — never blocks `next build`. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
