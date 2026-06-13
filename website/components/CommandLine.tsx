'use client';

import { useState } from 'react';

/** A dark terminal-style command card with a copy button (sits on the cream page). */
export function CommandLine({
  command,
  prompt = '$',
  className = '',
}: {
  command: string;
  prompt?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — the command is still selectable */
    }
  }

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border border-black/30 bg-coal-900 px-4 py-3 font-mono text-sm text-[#e7e8d8] shadow-[0_22px_48px_-32px_rgba(40,34,14,0.55)] ${className}`}
    >
      <span className="select-none text-acid-bright">{prompt}</span>
      <code className="flex-1 overflow-x-auto whitespace-nowrap">{command}</code>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy command to clipboard"
        className="shrink-0 rounded-md border border-white/15 px-2.5 py-1 text-xs font-medium text-[#b9baa6] transition hover:bg-white/10 hover:text-white"
      >
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  );
}
