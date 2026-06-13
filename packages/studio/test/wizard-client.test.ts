import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it } from 'vitest';
import type { Interview } from '../src/interview.js';
import { renderWizard } from '../src/wizard.js';

/**
 * Actually EXECUTE the wizard's embedded client script in a DOM and drive the
 * whole flow — the one thing the HTML-structure tests cannot verify.
 */

const interview: Interview = {
  sessionId: 's1',
  title: 'Drive test',
  questions: [
    { id: 'why', kind: 'text', prompt: 'Why build this?', required: true },
    {
      id: 'stack',
      kind: 'single',
      prompt: 'Stack?',
      choices: [
        { value: 'next', label: 'Next.js' },
        { value: 'remix', label: 'Remix' },
      ],
    },
    { id: 'ok', kind: 'boolean', prompt: 'Ship it?' },
  ],
};

type TestWindow = {
  document: Document;
  Event: typeof Event;
  fetch: (url: string, init?: { body?: string }) => Promise<unknown>;
  close: () => void;
};

let dom: JSDOM | undefined;

afterEach(() => {
  dom?.window.close();
  dom = undefined;
});

function boot(html: string) {
  dom = new JSDOM(html, { runScripts: 'dangerously' });
  const win = dom.window as unknown as TestWindow;
  const calls: Array<{ url: string; body: unknown }> = [];
  win.fetch = (url, init) => {
    calls.push({ url, body: init?.body ? JSON.parse(init.body) : undefined });
    return Promise.resolve({ ok: true });
  };
  return { win, doc: win.document, calls };
}

function click(doc: Document, selector: string): void {
  (doc.querySelector(selector) as HTMLElement).click();
}

function typeText(win: TestWindow, doc: Document, value: string): void {
  const input = doc.querySelector('#stage input[type=text]') as HTMLInputElement;
  input.value = value;
  input.dispatchEvent(new win.Event('input', { bubbles: true }));
}

describe('wizard client (executed in jsdom)', () => {
  it('renders the first question on load, with an accessible label', () => {
    const { doc } = boot(renderWizard(interview));
    expect(doc.querySelector('.prompt')?.textContent).toBe('Why build this?');
    expect(doc.querySelector('#count')?.textContent).toBe('1 / 3');
    // the input is programmatically labelled by the prompt (a11y)
    const input = doc.querySelector('#stage input[type=text]') as HTMLInputElement;
    expect(input.getAttribute('aria-label')).toBe('Why build this?');
  });

  it('refuses to advance past a required, unanswered question', () => {
    const { doc } = boot(renderWizard(interview));
    click(doc, '#next');
    expect(doc.querySelector('#err')?.textContent).toMatch(/required/i);
    expect(doc.querySelector('.prompt')?.textContent).toBe('Why build this?');
  });

  it('walks the full interview and posts a finish transcript (live mode)', () => {
    const { win, doc, calls } = boot(renderWizard(interview));

    typeText(win, doc, 'because continuity');
    click(doc, '#next');

    expect(doc.querySelector('.prompt')?.textContent).toBe('Stack?');
    click(doc, '.choice'); // first choice: next
    click(doc, '#next');

    expect(doc.querySelector('.prompt')?.textContent).toBe('Ship it?');
    click(doc, '.toggle button'); // first toggle: Yes
    click(doc, '#next');

    expect(doc.querySelector('#count')?.textContent).toBe('Review');
    click(doc, '#next'); // finish

    const finish = calls.find((c) => c.url.includes('/api/finish'));
    expect(finish).toBeDefined();
    const body = finish?.body as { answers: Array<{ questionId: string; value: unknown }> };
    expect(body.answers).toEqual([
      { questionId: 'why', value: 'because continuity' },
      { questionId: 'stack', value: 'next' },
      { questionId: 'ok', value: true },
    ]);
    expect((doc.querySelector('#foot') as HTMLElement).style.display).toBe('none');
  });

  it('lets you go back and change an answer', () => {
    const { win, doc, calls } = boot(renderWizard(interview));
    typeText(win, doc, 'first answer');
    click(doc, '#next'); // -> Q2
    click(doc, '#back'); // -> Q1
    expect((doc.querySelector('#stage input[type=text]') as HTMLInputElement).value).toBe(
      'first answer',
    );
    typeText(win, doc, 'second answer');
    click(doc, '#next');
    const lastAnswerPost = calls.filter((c) => c.url.includes('/api/answer')).pop();
    expect((lastAnswerPost?.body as { value: string }).value).toBe('second answer');
  });

  it('static mode produces an export and makes no network calls', () => {
    const { win, doc, calls } = boot(renderWizard(interview, { mode: 'static' }));
    typeText(win, doc, 'x');
    click(doc, '#next');
    click(doc, '.choice');
    click(doc, '#next');
    click(doc, '.toggle button');
    click(doc, '#next'); // review
    click(doc, '#next'); // export

    const exportEl = doc.querySelector('textarea.export') as HTMLTextAreaElement;
    expect(exportEl).toBeTruthy();
    const parsed = JSON.parse(exportEl.value) as { answers: unknown[] };
    expect(parsed.answers).toHaveLength(3);
    expect(calls).toHaveLength(0);
  });
});
