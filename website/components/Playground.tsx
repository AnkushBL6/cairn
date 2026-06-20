'use client';

import { type FormEvent, useMemo, useState } from 'react';
import {
  type EdgeType,
  type GraphEdge,
  type GraphNode,
  type NodeType,
  NODE_TYPES,
  SAMPLE_EDGES,
  SAMPLE_NODES,
  TYPE_META,
  VIEWBOX,
  renderMermaid,
} from '@/lib/sample-graph';

function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
  return slug.length > 0 ? slug : 'node';
}

function truncate(text: string, n: number): string {
  return text.length > n ? `${text.slice(0, n - 1)}…` : text;
}

export function Playground() {
  const [extraNodes, setExtraNodes] = useState<GraphNode[]>([]);
  const [extraEdges, setExtraEdges] = useState<GraphEdge[]>([]);
  const [selected, setSelected] = useState<string | null>('component--paymentform');
  const [hidden, setHidden] = useState<Set<NodeType>>(new Set());
  const [draftType, setDraftType] = useState<NodeType>('requirement');
  const [draftTitle, setDraftTitle] = useState('');
  const [copied, setCopied] = useState(false);

  const allNodes = useMemo(() => [...SAMPLE_NODES, ...extraNodes], [extraNodes]);
  const allEdges = useMemo(() => [...SAMPLE_EDGES, ...extraEdges], [extraEdges]);

  const nodeById = useMemo(() => new Map(allNodes.map((n) => [n.id, n])), [allNodes]);

  const visibleNodes = useMemo(
    () => allNodes.filter((n) => !hidden.has(n.type)),
    [allNodes, hidden],
  );
  const visibleIds = useMemo(() => new Set(visibleNodes.map((n) => n.id)), [visibleNodes]);
  const visibleEdges = useMemo(
    () => allEdges.filter((e) => visibleIds.has(e.from) && visibleIds.has(e.to)),
    [allEdges, visibleIds],
  );

  const mermaid = useMemo(
    () => renderMermaid(visibleNodes, visibleEdges),
    [visibleNodes, visibleEdges],
  );

  const selectedNode = selected ? (nodeById.get(selected) ?? null) : null;
  const outgoing = useMemo(
    () => (selected ? allEdges.filter((e) => e.from === selected) : []),
    [allEdges, selected],
  );
  const incoming = useMemo(
    () => (selected ? allEdges.filter((e) => e.to === selected) : []),
    [allEdges, selected],
  );

  const typesPresent = useMemo(
    () => NODE_TYPES.filter((t) => allNodes.some((n) => n.type === t)),
    [allNodes],
  );

  function toggleType(type: NodeType) {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  function addNode(e: FormEvent) {
    e.preventDefault();
    const title = draftTitle.trim();
    if (!title) return;
    const base = `${draftType}--${slugify(title)}`;
    let id = base;
    let ordinal = 2;
    while (nodeById.has(id)) {
      id = `${base}--${ordinal}`;
      ordinal += 1;
    }
    const count = extraNodes.length;
    const node: GraphNode = {
      id,
      type: draftType,
      title,
      body: 'Added in the playground.',
      status: 'open',
      x: 150 + ((count * 150) % 460),
      y: 524,
    };
    setExtraNodes((prev) => [...prev, node]);
    // Connect to the current selection — derived_from is always a legal edge.
    if (selected && nodeById.has(selected)) {
      setExtraEdges((prev) => [...prev, { type: 'derived_from', from: id, to: selected }]);
    }
    setDraftTitle('');
    setSelected(id);
  }

  function reset() {
    setExtraNodes([]);
    setExtraEdges([]);
    setHidden(new Set());
    setSelected('component--paymentform');
  }

  async function copyMermaid() {
    try {
      await navigator.clipboard.writeText(mermaid);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — the source is still selectable */
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      {/* ───────── Graph canvas ───────── */}
      <div className="card p-3 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2 px-1">
          {typesPresent.map((type) => {
            const off = hidden.has(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                aria-pressed={!off}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] transition ${
                  off
                    ? 'border-ink/10 text-ink-soft/50 line-through'
                    : 'border-ink/15 text-ink-soft hover:border-ink/30'
                }`}
              >
                <span
                  aria-hidden
                  className="h-2 w-2 rounded-full"
                  style={{ background: off ? 'transparent' : TYPE_META[type].color, boxShadow: off ? `inset 0 0 0 1.5px ${TYPE_META[type].color}` : undefined }}
                />
                {type}
              </button>
            );
          })}
        </div>

        <svg
          viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`}
          className="h-auto w-full select-none"
          role="group"
          aria-label="Interactive knowledge graph. Use Tab to move between nodes and Enter to inspect one."
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#1c1b17" fillOpacity="0.35" />
            </marker>
          </defs>

          {/* edges */}
          {visibleEdges.map((edge) => {
            const a = nodeById.get(edge.from);
            const b = nodeById.get(edge.to);
            if (!a || !b) return null;
            const related = selected === edge.from || selected === edge.to;
            const dimmed = selected !== null && !related;
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            return (
              <g key={`${edge.from}-${edge.type}-${edge.to}`} opacity={dimmed ? 0.18 : 1}>
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={related ? TYPE_META[a.type].color : '#1c1b17'}
                  strokeOpacity={related ? 0.55 : 0.22}
                  strokeWidth={related ? 1.75 : 1.25}
                  markerEnd="url(#arrow)"
                />
                {related && (
                  <text
                    x={mx}
                    y={my - 4}
                    textAnchor="middle"
                    fontSize={9.5}
                    fill="#6b6a5d"
                    fontFamily="var(--font-geist-mono), ui-monospace, monospace"
                  >
                    {edge.type}
                  </text>
                )}
              </g>
            );
          })}

          {/* nodes */}
          {visibleNodes.map((node) => {
            const isSel = selected === node.id;
            const neighbor =
              selected !== null &&
              allEdges.some(
                (e) =>
                  (e.from === selected && e.to === node.id) ||
                  (e.to === selected && e.from === node.id),
              );
            const dimmed = selected !== null && !isSel && !neighbor;
            const color = TYPE_META[node.type].color;
            return (
              <g
                key={node.id}
                transform={`translate(${node.x} ${node.y})`}
                tabIndex={0}
                role="button"
                aria-pressed={isSel}
                aria-label={`${node.type}: ${node.title}. Status ${node.status}. Activate to inspect.`}
                className="cursor-pointer outline-none [&:focus-visible_circle.hit]:stroke-ink"
                opacity={dimmed ? 0.32 : 1}
                onClick={() => setSelected(node.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelected(node.id);
                  }
                }}
              >
                {/* generous transparent hit area — the whole node is clickable */}
                <circle r={24} fill="transparent" />
                {/* focus/select halo */}
                <circle
                  className="hit motion-safe:transition-all"
                  r={isSel ? 18 : 14}
                  fill="none"
                  stroke={color}
                  strokeOpacity={isSel ? 0.55 : 0.22}
                  strokeWidth={isSel ? 2 : 1}
                />
                <circle r={isSel ? 9 : 7} fill={color} className="motion-safe:transition-all" />
                <text
                  y={isSel ? 34 : 30}
                  textAnchor="middle"
                  fontSize={isSel ? 12 : 11}
                  fontWeight={isSel ? 600 : 400}
                  fill={isSel ? '#1c1b17' : '#6b6a5d'}
                  fontFamily="var(--font-geist-mono), ui-monospace, monospace"
                >
                  {truncate(node.title, 20)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* ───────── Inspector ───────── */}
      <div className="flex flex-col gap-5">
        {/* details */}
        <div className="card">
          {selectedNode ? (
            <>
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: TYPE_META[selectedNode.type].color }}
                />
                <span
                  className="font-mono text-[11px] uppercase tracking-[0.16em]"
                  style={{ color: TYPE_META[selectedNode.type].color }}
                >
                  {selectedNode.type}
                </span>
                <span className="ml-auto rounded-full border border-ink/10 px-2 py-0.5 font-mono text-[10px] text-ink-soft">
                  {selectedNode.status}
                </span>
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold text-ink">
                {selectedNode.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{selectedNode.body}</p>

              {(outgoing.length > 0 || incoming.length > 0) && (
                <div className="mt-4 space-y-1.5 border-t border-ink/10 pt-4">
                  {outgoing.map((e) => (
                    <p key={`o-${e.type}-${e.to}`} className="font-mono text-[11px] text-ink-soft">
                      <span className="text-acid">{e.type}</span> →{' '}
                      {truncate(nodeById.get(e.to)?.title ?? e.to, 24)}
                    </p>
                  ))}
                  {incoming.map((e) => (
                    <p key={`i-${e.type}-${e.from}`} className="font-mono text-[11px] text-ink-soft">
                      {truncate(nodeById.get(e.from)?.title ?? e.from, 24)}{' '}
                      <span className="text-teal">{e.type}</span> →
                    </p>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm leading-relaxed text-stone-600">
              Select a node — click it, or Tab to it and press Enter — to inspect its type, status,
              and connections.
            </p>
          )}
        </div>

        {/* add a node */}
        <form onSubmit={addNode} className="card">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-acid">Add a node</p>
          <p className="mt-1.5 text-xs leading-relaxed text-stone-500">
            It links to the selected node via <code className="font-mono">derived_from</code> and
            appears in the graph and the Mermaid source.
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <label className="sr-only" htmlFor="pg-type">
              Node type
            </label>
            <select
              id="pg-type"
              value={draftType}
              onChange={(e) => setDraftType(e.target.value as NodeType)}
              className="rounded-lg border border-ink/15 bg-paper-50 px-3 py-2 font-mono text-xs text-ink focus:border-acid focus:outline-none"
            >
              {NODE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="pg-title">
              Node title
            </label>
            <input
              id="pg-title"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder="Title…"
              maxLength={60}
              className="rounded-lg border border-ink/15 bg-paper-50 px-3 py-2 text-sm text-ink placeholder:text-ink-soft/50 focus:border-acid focus:outline-none"
            />
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary flex-1 !px-4 !py-2 text-[13px]">
                Add node
              </button>
              <button
                type="button"
                onClick={reset}
                className="btn btn-ghost !px-4 !py-2 text-[13px]"
              >
                Reset
              </button>
            </div>
          </div>
        </form>

        {/* mermaid source */}
        <div className="terminal overflow-hidden">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
            <span className="h-2 w-2 rounded-full bg-rose-400/80" />
            <span className="h-2 w-2 rounded-full bg-amber-400/80" />
            <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
            <span className="ml-1 font-mono text-[11px] text-[#8a8b78]">graph.mmd</span>
            <button
              type="button"
              onClick={copyMermaid}
              aria-label="Copy Mermaid source"
              className="ml-auto rounded-md border border-white/15 px-2 py-0.5 font-mono text-[10px] text-[#b9baa6] transition hover:bg-white/10 hover:text-white"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <pre className="max-h-72 overflow-auto p-4 font-mono text-[11.5px] leading-relaxed text-[#d8d9c7]">
            <code>{mermaid}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
