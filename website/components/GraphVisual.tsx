type Node = { id: string; x: number; y: number; label: string; color: string };

const NODES: Node[] = [
  { id: 'goal', x: 230, y: 60, label: 'goal', color: '#22c55e' },
  { id: 'req', x: 112, y: 156, label: 'requirement', color: '#4ade80' },
  { id: 'dec', x: 356, y: 146, label: 'decision', color: '#2dd4bf' },
  { id: 'con', x: 398, y: 260, label: 'constraint', color: '#f5b971' },
  { id: 'cmp', x: 124, y: 300, label: 'component', color: '#34d399' },
  { id: 'tst', x: 250, y: 332, label: 'test', color: '#86efac' },
  { id: 'art', x: 360, y: 352, label: 'artifact', color: '#5eead4' },
];

const POS = new Map(NODES.map((node) => [node.id, node]));

const EDGES: Array<[string, string]> = [
  ['req', 'goal'],
  ['dec', 'goal'],
  ['dec', 'req'],
  ['cmp', 'req'],
  ['tst', 'cmp'],
  ['tst', 'req'],
  ['art', 'cmp'],
  ['con', 'cmp'],
];

const PULSING = new Set(['req-goal', 'cmp-req', 'tst-cmp']);

/** The animated knowledge graph — Cairn's signature visual. Pure SVG + CSS. */
export function GraphVisual() {
  return (
    <svg
      viewBox="0 0 470 410"
      className="cairn-graph h-full w-full"
      role="img"
      aria-label="A knowledge graph linking goals, requirements, decisions, components, tests and artifacts"
    >
      <defs>
        <linearGradient id="edgeGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#22c55e" />
          <stop offset="1" stopColor="#2dd4bf" />
        </linearGradient>
      </defs>

      {EDGES.map(([from, to]) => {
        const a = POS.get(from);
        const b = POS.get(to);
        if (!a || !b) return null;
        const key = `${from}-${to}`;
        return (
          <g key={key}>
            <line className="edge" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
            {PULSING.has(key) && (
              <line className="pulse" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
            )}
          </g>
        );
      })}

      {NODES.map((node) => (
        <g className="node" key={node.id} transform={`translate(${node.x} ${node.y})`}>
          <circle r={14} fill="none" stroke={node.color} strokeOpacity={0.22} />
          <circle className="node-core" r={7} fill={node.color} />
          <text
            y={30}
            textAnchor="middle"
            fontSize={11}
            fill="#94a3b8"
            fontFamily="var(--font-mono), ui-monospace, monospace"
          >
            {node.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
