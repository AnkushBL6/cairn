// @vitest-environment jsdom
import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import type { Interview } from '../src/interview.js';
import { renderWizard } from '../src/wizard.js';

const interview: Interview = {
  sessionId: 'sess-1',
  title: 'Brainstorm: <Payments> & "scale"',
  intro: 'Lets go',
  questions: [
    { id: 'why', kind: 'longtext', prompt: 'Why build this?' },
    {
      id: 'stack',
      kind: 'single',
      prompt: 'Pick a stack',
      choices: [{ value: 'next', label: 'Next.js' }],
    },
  ],
};

describe('renderWizard', () => {
  it('produces a complete, parseable HTML document', () => {
    const html = renderWizard(interview);
    expect(html.toLowerCase().startsWith('<!doctype html>')).toBe(true);
    const dom = new JSDOM(html);
    expect(dom.window.document.querySelector('#stage')).not.toBeNull();
    expect(dom.window.document.querySelector('#next')).not.toBeNull();
  });

  it('embeds the interview as valid, recoverable JSON', () => {
    const html = renderWizard(interview);
    const dom = new JSDOM(html);
    const node = dom.window.document.getElementById('cairn-interview');
    expect(node).not.toBeNull();
    const parsed = JSON.parse(node?.textContent ?? '{}');
    expect(parsed.questions).toHaveLength(2);
    expect(parsed.title).toBe('Brainstorm: <Payments> & "scale"');
  });

  it('neutralizes a script-closing sequence inside embedded data', () => {
    const tricky: Interview = {
      sessionId: 's',
      title: 'x',
      questions: [{ id: 'q', kind: 'text', prompt: 'pwn </script><script>alert(1)</script>' }],
    };
    const html = renderWizard(tricky);
    // the raw closing tag must not appear inside the embedded JSON payload
    expect(html).not.toContain('</script><script>alert(1)');
    expect(html).toContain('\\u003c/script>');
  });

  it('wires live endpoints in live mode', () => {
    const html = renderWizard(interview, { mode: 'live' });
    const dom = new JSDOM(html);
    const cfg = JSON.parse(dom.window.document.getElementById('cairn-config')?.textContent ?? '{}');
    expect(cfg.mode).toBe('live');
    expect(cfg.answerEndpoint).toBe('/api/answer');
  });

  it('uses static mode when requested', () => {
    const html = renderWizard(interview, { mode: 'static' });
    const dom = new JSDOM(html);
    const cfg = JSON.parse(dom.window.document.getElementById('cairn-config')?.textContent ?? '{}');
    expect(cfg.mode).toBe('static');
  });
});
