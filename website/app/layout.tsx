import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import type { Metadata, Viewport } from 'next';
import { Fraunces } from 'next/font/google';
import './globals.css';

// Warm editorial pairing: a characterful serif for display + Geist for UI/code.
const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  style: ['normal', 'italic'],
});

const description =
  'Cairn is the skillpack that gives your AI agent continuity: brainstorm into a persistent knowledge graph, build test-first with real guarantees, and pull in any skill on demand.';

export const metadata: Metadata = {
  metadataBase: new URL('https://cairn-inky-five.vercel.app'),
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
    url: 'https://cairn-inky-five.vercel.app',
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
  themeColor: '#f4f1e9',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${display.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
