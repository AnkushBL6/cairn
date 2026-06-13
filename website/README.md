# Cairn — Marketing Site

The production marketing site for Cairn, built with **Next.js 15 (App Router) + React 19 + Tailwind CSS**. Motion is hand-rolled CSS (IntersectionObserver reveals, animated SVG graph) — zero animation dependencies, so it builds fast and reliably.

## Local development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

## Deploying to Vercel

This site lives in a subdirectory of the Cairn monorepo and is intentionally **not** part of the pnpm workspace, so it deploys cleanly on its own.

1. Import the repository in Vercel.
2. Set **Root Directory** to `website`.
3. Framework preset: **Next.js** (auto-detected). No extra configuration needed.

Vercel will run `npm install && npm run build` in `website/` and serve it.

## Structure

```
website/
├── app/
│   ├── layout.tsx      # metadata, fonts, shell
│   ├── page.tsx        # the full landing page
│   ├── globals.css     # design tokens + components + the animated graph
│   └── icon.svg        # favicon (the Cairn mark)
├── components/
│   ├── Nav.tsx  Footer.tsx  Reveal.tsx  CommandLine.tsx  GraphVisual.tsx
└── lib/skills.ts        # the six skills, as data
```
