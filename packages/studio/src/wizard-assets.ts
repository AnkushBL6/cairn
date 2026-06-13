/**
 * The wizard's CSS and client script, kept as plain string constants so the
 * whole studio ships as a single self-contained HTML file with zero build step
 * on the user's machine. The client script deliberately uses only quotes and
 * `createElement` (no template literals) so it can live safely inside a
 * template literal in `wizard.ts`.
 */

export const WIZARD_CSS = `
:root {
  --bg: #070a0f;
  --bg-2: #0c121b;
  --surface: #111a26;
  --surface-2: #16212f;
  --border: #223044;
  --text: #e8eef6;
  --muted: #93a2b6;
  --accent: #22c55e;
  --accent-2: #34d399;
  --good: #5eead4;
  --danger: #fb7185;
  --radius: 16px;
  --shadow: 0 30px 80px -30px rgba(0, 0, 0, 0.8);
  --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, Helvetica, Arial, sans-serif;
}
* { box-sizing: border-box; }
html, body { margin: 0; height: 100%; }
body {
  font-family: var(--font);
  color: var(--text);
  background:
    radial-gradient(1200px 600px at 80% -10%, rgba(45, 212, 191, 0.18), transparent 60%),
    radial-gradient(1000px 500px at -10% 10%, rgba(34, 197, 94, 0.16), transparent 55%),
    linear-gradient(180deg, var(--bg), var(--bg-2));
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  -webkit-font-smoothing: antialiased;
}
.shell { width: 100%; max-width: 680px; }
.brand {
  display: flex; align-items: center; gap: 12px; margin-bottom: 22px;
  color: var(--muted); font-size: 14px; letter-spacing: 0.02em;
}
.brand .mark {
  width: 26px; height: 26px; border-radius: 8px;
  background: linear-gradient(140deg, var(--accent), var(--accent-2));
  display: grid; place-items: center; color: #06121f; font-weight: 800; font-size: 14px;
}
.card {
  position: relative;
  background: linear-gradient(180deg, var(--surface), var(--surface-2));
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}
.progress { height: 4px; background: rgba(255, 255, 255, 0.06); }
.progress > i {
  display: block; height: 100%; width: 0%;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  transition: width 420ms cubic-bezier(0.22, 1, 0.36, 1);
}
.body { padding: 34px 34px 26px; }
.title { font-size: 13px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.14em; margin: 0 0 18px; }
.count { color: var(--accent); font-weight: 600; }
.stage { min-height: 220px; }
.q-enter { animation: slideIn 360ms cubic-bezier(0.22, 1, 0.36, 1); }
@keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.prompt { font-size: 25px; line-height: 1.3; font-weight: 650; margin: 0 0 8px; letter-spacing: -0.01em; }
.help { color: var(--muted); font-size: 15px; line-height: 1.55; margin: 0 0 22px; }
.field input[type="text"], .field textarea {
  width: 100%; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border);
  border-radius: 12px; color: var(--text); font: inherit; font-size: 16px; padding: 14px 16px;
  transition: border-color 160ms, box-shadow 160ms;
}
.field textarea { min-height: 130px; resize: vertical; line-height: 1.5; }
.field input:focus, .field textarea:focus {
  outline: none; border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.15);
}
.choices { display: grid; gap: 10px; }
.choice {
  text-align: left; width: 100%; cursor: pointer;
  background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border);
  border-radius: 12px; padding: 15px 16px; color: var(--text); font: inherit;
  display: flex; gap: 13px; align-items: flex-start;
  transition: border-color 160ms, background 160ms, transform 120ms;
}
.choice:hover { border-color: #34465e; transform: translateY(-1px); }
.choice .box {
  flex: none; width: 20px; height: 20px; border-radius: 6px; margin-top: 1px;
  border: 2px solid #3a4d66; display: grid; place-items: center; transition: all 160ms;
}
.choice[data-kind="single"] .box { border-radius: 50%; }
.choice.sel { border-color: var(--accent); background: rgba(34, 197, 94, 0.08); }
.choice.sel .box { border-color: var(--accent); background: var(--accent); }
.choice.sel .box::after { content: ""; width: 8px; height: 8px; border-radius: 3px; background: #06121f; }
.choice .c-col { display: flex; flex-direction: column; gap: 3px; }
.choice .c-label { display: block; font-weight: 600; font-size: 16px; }
.choice .c-desc { display: block; color: var(--muted); font-size: 13.5px; line-height: 1.45; }
.scale { display: flex; align-items: center; gap: 18px; }
.scale input[type="range"] { flex: 1; accent-color: var(--accent); height: 6px; }
.scale .val {
  font-size: 26px; font-weight: 700; min-width: 52px; text-align: center;
  background: linear-gradient(140deg, var(--accent), var(--accent-2));
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.toggle { display: flex; gap: 10px; }
.toggle button {
  flex: 1; cursor: pointer; padding: 14px; border-radius: 12px; font: inherit; font-size: 16px; font-weight: 600;
  background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); color: var(--text); transition: all 160ms;
}
.toggle button.sel { border-color: var(--accent); background: rgba(34, 197, 94, 0.1); }
.err { color: var(--danger); font-size: 13.5px; margin-top: 12px; min-height: 18px; }
.foot {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 34px 30px; gap: 12px;
}
.btn {
  cursor: pointer; font: inherit; font-size: 15px; font-weight: 650; border-radius: 11px;
  padding: 12px 22px; border: 1px solid transparent; transition: transform 120ms, filter 160ms, opacity 160ms;
}
.btn:active { transform: translateY(1px); }
.btn.ghost { background: transparent; border-color: var(--border); color: var(--muted); }
.btn.ghost:hover { color: var(--text); border-color: #34465e; }
.btn.ghost:disabled { opacity: 0; pointer-events: none; }
.btn.primary { background: linear-gradient(135deg, var(--accent), var(--accent-2)); color: #06121f; }
.btn.primary:hover { filter: brightness(1.07); }
.dots { display: flex; gap: 6px; }
.dots i { width: 7px; height: 7px; border-radius: 50%; background: #2a3a4e; transition: background 200ms; }
.dots i.on { background: var(--accent); }
.dots i.done { background: var(--accent-2); }
.review h2, .done h2 { font-size: 23px; margin: 0 0 6px; }
.review .row { display: flex; justify-content: space-between; gap: 16px; padding: 13px 0; border-bottom: 1px solid var(--border); }
.review .row .k { color: var(--muted); font-size: 14px; max-width: 55%; }
.review .row .v { font-weight: 600; text-align: right; }
.done { text-align: center; padding: 24px 0; }
.done .ring {
  width: 72px; height: 72px; border-radius: 50%; margin: 4px auto 18px;
  background: linear-gradient(135deg, var(--good), var(--accent)); display: grid; place-items: center;
  color: #06121f; font-size: 34px; font-weight: 800;
}
.export {
  width: 100%; margin-top: 16px; min-height: 150px; font-family: ui-monospace, Menlo, monospace; font-size: 12.5px;
  background: #060a10; border: 1px solid var(--border); border-radius: 12px; color: var(--good); padding: 14px; resize: vertical;
}
.hint { color: var(--muted); font-size: 13px; margin-top: 14px; }
@media (max-width: 560px) { .body { padding: 26px 22px 20px; } .foot { padding: 16px 22px 24px; } .prompt { font-size: 22px; } }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
`;

export const WIZARD_JS = String.raw`
(function () {
  'use strict';
  function $(sel) { return document.querySelector(sel); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function readJSON(id) {
    var node = document.getElementById(id);
    return node ? JSON.parse(node.textContent) : null;
  }

  var interview = readJSON('cairn-interview');
  var config = readJSON('cairn-config') || { mode: 'live' };
  var questions = (interview && interview.questions) ? interview.questions.slice() : [];
  var answers = {};
  var index = 0;

  var stage = $('#stage');
  var bar = $('#bar');
  var dots = $('#dots');
  var titleCount = $('#count');
  var backBtn = $('#back');
  var nextBtn = $('#next');

  function post(path, payload) {
    return fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(function () { /* offline: ignore, transcript still completes */ });
  }

  function setProgress() {
    var pct = questions.length ? Math.round((index / questions.length) * 100) : 0;
    bar.style.width = pct + '%';
    dots.innerHTML = '';
    for (var i = 0; i < questions.length; i++) {
      var d = el('i');
      if (i < index) d.className = 'done';
      else if (i === index) d.className = 'on';
      dots.appendChild(d);
    }
  }

  function currentValue(q) {
    if (q.id in answers) return answers[q.id];
    if (q.kind === 'multi') return [];
    if (q.kind === 'scale') return typeof q.min === 'number' ? q.min : 0;
    if (q.kind === 'boolean') return null;
    return '';
  }

  function setError(msg) { var e = $('#err'); if (e) e.textContent = msg || ''; }

  function renderQuestion(q) {
    var wrap = el('div', 'q-enter');
    titleCount.textContent = (index + 1) + ' / ' + questions.length;
    wrap.appendChild(el('h2', 'prompt', q.prompt));
    if (q.help) wrap.appendChild(el('p', 'help', q.help));
    var field = el('div', 'field');
    var value = currentValue(q);

    if (q.kind === 'text') {
      var input = el('input');
      input.type = 'text';
      input.value = value || '';
      input.setAttribute('aria-label', q.prompt);
      if (q.placeholder) input.placeholder = q.placeholder;
      input.addEventListener('input', function () { answers[q.id] = input.value; setError(''); });
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); go(1); } });
      field.appendChild(input);
      setTimeout(function () { input.focus(); }, 30);
    } else if (q.kind === 'longtext') {
      var ta = el('textarea');
      ta.value = value || '';
      ta.setAttribute('aria-label', q.prompt);
      if (q.placeholder) ta.placeholder = q.placeholder;
      ta.addEventListener('input', function () { answers[q.id] = ta.value; setError(''); });
      field.appendChild(ta);
      setTimeout(function () { ta.focus(); }, 30);
    } else if (q.kind === 'single' || q.kind === 'multi') {
      var box = el('div', 'choices');
      (q.choices || []).forEach(function (choice) {
        var btn = el('button', 'choice');
        btn.type = 'button';
        btn.setAttribute('data-kind', q.kind);
        btn.appendChild(el('span', 'box'));
        var col = el('span', 'c-col');
        col.appendChild(el('span', 'c-label', choice.label));
        if (choice.description) col.appendChild(el('span', 'c-desc', choice.description));
        btn.appendChild(col);
        function selected() {
          if (q.kind === 'single') return answers[q.id] === choice.value;
          return Array.isArray(answers[q.id]) && answers[q.id].indexOf(choice.value) >= 0;
        }
        function paint() { if (selected()) btn.classList.add('sel'); else btn.classList.remove('sel'); }
        btn.addEventListener('click', function () {
          setError('');
          if (q.kind === 'single') {
            answers[q.id] = choice.value;
            Array.prototype.forEach.call(box.children, function (c) { c.classList.remove('sel'); });
            btn.classList.add('sel');
          } else {
            var arr = Array.isArray(answers[q.id]) ? answers[q.id].slice() : [];
            var at = arr.indexOf(choice.value);
            if (at >= 0) arr.splice(at, 1); else arr.push(choice.value);
            answers[q.id] = arr;
            paint();
          }
        });
        paint();
        box.appendChild(btn);
      });
      field.appendChild(box);
    } else if (q.kind === 'scale') {
      var row = el('div', 'scale');
      var range = el('input');
      range.type = 'range';
      range.setAttribute('aria-label', q.prompt);
      range.min = String(q.min != null ? q.min : 1);
      range.max = String(q.max != null ? q.max : 10);
      range.value = String(value);
      var out = el('span', 'val', String(value));
      range.addEventListener('input', function () {
        answers[q.id] = Number(range.value);
        out.textContent = range.value;
      });
      answers[q.id] = Number(range.value);
      row.appendChild(range);
      row.appendChild(out);
      field.appendChild(row);
    } else if (q.kind === 'boolean') {
      var tg = el('div', 'toggle');
      ['Yes', 'No'].forEach(function (label, i) {
        var b = el('button', null, label);
        b.type = 'button';
        var bv = i === 0;
        if (answers[q.id] === bv) b.classList.add('sel');
        b.addEventListener('click', function () {
          answers[q.id] = bv;
          Array.prototype.forEach.call(tg.children, function (c) { c.classList.remove('sel'); });
          b.classList.add('sel');
          setError('');
        });
        tg.appendChild(b);
      });
      field.appendChild(tg);
    }

    var errDiv = el('div', 'err');
    errDiv.id = 'err';
    wrap.appendChild(field);
    wrap.appendChild(errDiv);
    stage.innerHTML = '';
    stage.appendChild(wrap);
    backBtn.disabled = index === 0;
    nextBtn.textContent = index === questions.length - 1 ? 'Review' : 'Next';
    setProgress();
  }

  function validate(q) {
    var v = answers[q.id];
    if (!q.required) return true;
    if (q.kind === 'text' || q.kind === 'longtext') return typeof v === 'string' && v.trim().length > 0;
    if (q.kind === 'single') return typeof v === 'string' && v.length > 0;
    if (q.kind === 'multi') return Array.isArray(v) && v.length > 0;
    if (q.kind === 'boolean') return typeof v === 'boolean';
    return true;
  }

  function go(dir) {
    if (dir > 0) {
      var q = questions[index];
      if (!validate(q)) { setError('This one is required.'); return; }
      if (config.mode === 'live' && q.id in answers) {
        post(config.answerEndpoint || '/api/answer', { questionId: q.id, value: answers[q.id] });
      }
    }
    index += dir;
    if (index >= questions.length) { renderReview(); return; }
    if (index < 0) index = 0;
    renderQuestion(questions[index]);
  }

  function labelFor(q) {
    var v = answers[q.id];
    if (Array.isArray(v)) {
      return v.map(function (val) {
        var c = (q.choices || []).filter(function (x) { return x.value === val; })[0];
        return c ? c.label : val;
      }).join(', ');
    }
    if (q.kind === 'single') {
      var c2 = (q.choices || []).filter(function (x) { return x.value === v; })[0];
      return c2 ? c2.label : (v || '—');
    }
    if (q.kind === 'boolean') return v === true ? 'Yes' : (v === false ? 'No' : '—');
    return (v === '' || v == null) ? '—' : String(v);
  }

  function renderReview() {
    bar.style.width = '100%';
    setProgress();
    titleCount.textContent = 'Review';
    var wrap = el('div', 'q-enter review');
    wrap.appendChild(el('h2', null, 'Does this look right?'));
    wrap.appendChild(el('p', 'help', 'Review your answers, then send them back to the agent.'));
    questions.forEach(function (q) {
      var row = el('div', 'row');
      row.appendChild(el('span', 'k', q.prompt));
      row.appendChild(el('span', 'v', labelFor(q)));
      wrap.appendChild(row);
    });
    stage.innerHTML = '';
    stage.appendChild(wrap);
    backBtn.disabled = false;
    nextBtn.textContent = config.mode === 'live' ? 'Send to agent' : 'Export answers';
  }

  function buildTranscript() {
    return {
      sessionId: interview.sessionId,
      title: interview.title,
      finishedAt: new Date().toISOString(),
      answers: questions.map(function (q) { return { questionId: q.id, value: (q.id in answers) ? answers[q.id] : null }; })
    };
  }

  function finish() {
    var transcript = buildTranscript();
    if (config.mode === 'live') {
      post(config.finishEndpoint || '/api/finish', transcript);
      renderDone(false);
    } else {
      renderDone(true, transcript);
    }
  }

  function renderDone(isStatic, transcript) {
    var wrap = el('div', 'q-enter done');
    var ring = el('div', 'ring', '✓');
    wrap.appendChild(ring);
    wrap.appendChild(el('h2', null, isStatic ? 'Copy this back to the agent' : 'Sent. You can close this tab.'));
    if (isStatic) {
      var ta = el('textarea', 'export');
      ta.readOnly = true;
      ta.value = JSON.stringify(transcript, null, 2);
      wrap.appendChild(ta);
      var copy = el('button', 'btn primary', 'Copy to clipboard');
      copy.style.marginTop = '14px';
      copy.addEventListener('click', function () {
        ta.select();
        try { navigator.clipboard.writeText(ta.value); copy.textContent = 'Copied!'; }
        catch (e) { document.execCommand('copy'); copy.textContent = 'Copied!'; }
      });
      wrap.appendChild(copy);
      setTimeout(function () { ta.focus(); ta.select(); }, 30);
    } else {
      wrap.appendChild(el('p', 'hint', 'Cairn is weaving your answers into the project graph.'));
    }
    stage.innerHTML = '';
    stage.appendChild(wrap);
    $('#foot').style.display = 'none';
  }

  function subscribe() {
    if (config.mode !== 'live' || typeof EventSource === 'undefined') return;
    try {
      var es = new EventSource(config.eventsEndpoint || '/api/events');
      es.addEventListener('question', function (ev) {
        try {
          var incoming = JSON.parse(ev.data);
          var added = false;
          (incoming || []).forEach(function (q) {
            if (!questions.some(function (x) { return x.id === q.id; })) { questions.push(q); added = true; }
          });
          if (added) setProgress();
        } catch (e) { /* ignore malformed */ }
      });
      es.addEventListener('finish', function () { es.close(); });
    } catch (e) { /* SSE unsupported: live mode still works via answer posts */ }
  }

  nextBtn.addEventListener('click', function () {
    if (titleCount.textContent === 'Review') { finish(); return; }
    go(1);
  });
  backBtn.addEventListener('click', function () { go(-1); });

  if (!questions.length) {
    stage.appendChild(el('p', 'help', 'No questions yet.'));
  } else {
    renderQuestion(questions[0]);
    subscribe();
  }
})();
`;
