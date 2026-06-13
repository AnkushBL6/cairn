import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Sora } from 'next/font/google';
import './globals.css';

// Self-hosted at build time by Next — no render-blocking external request, no layout shift.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const sora = Sora({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-sora',
  display: 'swap',
});
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

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
    <html lang="en" className={`${inter.variable} ${sora.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
