export type Skill = {
  name: string;
  title: string;
  tagline: string;
  glyph: string;
  accent: string;
};

export const SKILLS: Skill[] = [
  {
    name: 'cairn-brainstorm',
    title: 'Brainstorm → Graph',
    tagline:
      'An intuitive browser interview that captures intent as a persistent knowledge graph.',
    glyph: '✶',
    accent: '#15803d',
  },
  {
    name: 'cairn-resume',
    title: 'Resume',
    tagline: 'A fresh, context-free session reloads the whole project in seconds.',
    glyph: '↻',
    accent: '#0f766e',
  },
  {
    name: 'cairn-tdd',
    title: 'Guaranteed TDD',
    tagline: 'Tests that provably run red for the right reason before any code is written.',
    glyph: '✓',
    accent: '#047857',
  },
  {
    name: 'cairn-frontend',
    title: 'Frontend',
    tagline: 'World-class, accessible UI driven by the graph — tokens, states, performance.',
    glyph: '◑',
    accent: '#16a34a',
  },
  {
    name: 'cairn-backend',
    title: 'Backend',
    tagline: 'Typed contracts, designed failure modes, observability — logic built test-first.',
    glyph: '⬡',
    accent: '#b4530a',
  },
  {
    name: 'cairn-router',
    title: 'Skill Router',
    tagline: 'Need a capability we don’t ship? Discover and install it on demand.',
    glyph: '⤳',
    accent: '#0d9488',
  },
];
