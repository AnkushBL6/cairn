import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // warm cream paper
        paper: {
          DEFAULT: '#f4f1e9',
          50: '#faf8f2',
          100: '#f0ece1',
          200: '#e7e1d2',
        },
        card: '#fffdf8',
        // warm near-black ink
        ink: { DEFAULT: '#1c1b17', soft: '#39352c' },
        // the deep "run green" — Cairn's accent, darkened for AA text contrast on cream
        acid: { DEFAULT: '#166534', bright: '#16a34a' },
        teal: '#0f766e',
        clay: '#b4530a',
        amber: '#b45309',
        rose: '#be123c',
        mint: '#15803d',
        // warm-dark surface for code/terminal cards
        coal: { DEFAULT: '#16170f', 900: '#121309', 800: '#1d1e14' },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'ui-serif', 'serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      maxWidth: {
        content: '1120px',
      },
    },
  },
  plugins: [],
} satisfies Config;
