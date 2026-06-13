'use client';

import { useState } from 'react';

/** A terminal-style command with a copy button. */
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
      className={`flex items-center gap-3 rounded-xl border border-white/10 bg-ink-900/80 px-4 py-3 font-mono text-sm ${className}`}
    >
      <span className="select-none text-acid/70">{prompt}</span>
      <code className="flex-1 overflow-x-auto whitespace-nowrap text-slate-100">{command}</code>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy command to clipboard"
        className="shrink-0 rounded-md border border-white/10 px-2.5 py-1 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
      >
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  );
}
