import type { Interview } from './interview.js';
import { WIZARD_CSS, WIZARD_JS } from './wizard-assets.js';

export interface WizardOptions {
  mode?: 'live' | 'static';
  answerEndpoint?: string;
  eventsEndpoint?: string;
  finishEndpoint?: string;
}

/** JSON safe to embed inside a <script> block (escape the closing-tag opener). */
function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Render the entire studio wizard as one self-contained HTML document.
 *
 * In `live` mode the client posts answers to the studio server; in `static`
 * mode (the headless fallback) it collects answers locally and offers an export
 * the user pastes back to the agent. The markup is identical — only the embedded
 * config differs — so the UX is the same everywhere.
 */
export function renderWizard(interview: Interview, options: WizardOptions = {}): string {
  const config = {
    mode: options.mode ?? 'live',
    answerEndpoint: options.answerEndpoint ?? '/api/answer',
    eventsEndpoint: options.eventsEndpoint ?? '/api/events',
    finishEndpoint: options.finishEndpoint ?? '/api/finish',
  };

  return [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    `<title>${escapeHtml(interview.title)} · Cairn Studio</title>`,
    `<style>${WIZARD_CSS}</style>`,
    '</head>',
    '<body>',
    '<div class="shell">',
    '<div class="brand"><span class="mark">▲</span><span>Cairn Studio</span></div>',
    '<div class="card">',
    '<div class="progress"><i id="bar"></i></div>',
    '<div class="body">',
    `<p class="title">${escapeHtml(interview.title)} · <span class="count" id="count"></span></p>`,
    '<div class="stage" id="stage"></div>',
    '</div>',
    '<div class="foot" id="foot">',
    '<button class="btn ghost" id="back" type="button">Back</button>',
    '<div class="dots" id="dots"></div>',
    '<button class="btn primary" id="next" type="button">Next</button>',
    '</div>',
    '</div>',
    '</div>',
    `<script id="cairn-interview" type="application/json">${safeJson(interview)}</script>`,
    `<script id="cairn-config" type="application/json">${safeJson(config)}</script>`,
    '<noscript><p style="color:#fff;text-align:center">Cairn Studio needs JavaScript enabled.</p></noscript>',
    `<script>${WIZARD_JS}</script>`,
    '</body>',
    '</html>',
  ].join('\n');
}
