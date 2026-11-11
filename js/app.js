(() => {
  'use strict';

  const STORE_KEY = 'de-cua-bo-me:v1';
  const $ = (s) => document.querySelector(s);
  const uid = () => Math.random().toString(36).slice(2, 10);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const TYPE_LABEL = { fill: 'Điền đáp án', mc: 'Trắc nghiệm', essay: 'Tự luận' };

  // ---------- State ----------
  const newSheet = () => ({ id: uid(), title: '', child: '', questions: [] });
  let state = load();

  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(STORE_KEY));
      if (s && Array.isArray(s.sheets) && s.sheets.length) {
        if (!Array.isArray(s.history)) s.history = [];
        if (s.kidMode && !s.pin) s.kidMode = false;
        return s;
      }
    } catch (e) { /* storage unavailable or corrupt */ }
    const sheet = newSheet();
    return { sheets: [sheet], currentId: sheet.id, history: [] };
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }
  const current = () => state.sheets.find((s) => s.id === state.currentId) || state.sheets[0];

  // ---------- Navigation ----------
  function show(view) {
    if (state.kidMode) view = 'quiz';
    document.querySelectorAll('.view').forEach((v) => v.classList.toggle('active', v.id === 'view-' + view));
    document.querySelectorAll('#nav button').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
    if (view === 'quiz') renderQuiz();
    if (view === 'print') renderPrint();
    if (view === 'library') renderLibrary();
    if (view === 'history') renderHistory();
    if (view === 'edit') renderEdit();
  }
  $('#nav').addEventListener('click', (e) => { if (e.target.dataset.view) show(e.target.dataset.view); });

  // ---------- Edit view ----------
  function renderEdit() {
    const sh = current();
    $('#sheet-title').value = sh.title;
    $('#sheet-child').value = sh.child;
    $('#q-count').textContent = sh.questions.length;
    $('#q-empty').hidden = sh.questions.length > 0;
    $('#q-list').innerHTML = sh.questions.map((q, i) => `
      <li data-id="${q.id}">
        <div>${esc(q.text)}</div>
        ${q.type === 'mc' ? '<div class="meta">' + q.options.map((o, k) => `${String.fromCharCode(65 + k)}. ${esc(o)}`).join(' · ') + '</div>' : ''}
        <div class="meta">${TYPE_LABEL[q.type]}${q.type === 'essay' ? '' : ' · Đáp án: ' + esc(answerText(q))}</div>
        <div class="acts">
          <button data-act="up" ${i === 0 ? 'disabled' : ''}>↑</button>
          <button data-act="down" ${i === sh.questions.length - 1 ? 'disabled' : ''}>↓</button>
          <button data-act="del" class="danger">Xoá</button>
        </div>
      </li>`).join('');
  }
  const answerText = (q) => (q.type === 'mc' ? `${String.fromCharCode(65 + q.answer)}. ${q.options[q.answer]}` : q.answer);

  $('#sheet-title').addEventListener('input', (e) => { current().title = e.target.value; save(); });
  $('#sheet-child').addEventListener('input', (e) => { current().child = e.target.value; save(); });

  $('#q-type').addEventListener('change', syncTypeFields);
  function syncTypeFields() {
    const t = $('#q-type').value;
    $('#q-mc').hidden = t !== 'mc';
    $('#q-answer-wrap').hidden = t !== 'fill';
  }

  $('#btn-add').addEventListener('click', () => {
    const type = $('#q-type').value;
    const text = $('#q-text').value.trim();
    if (!text) return alert('Hãy nhập nội dung câu hỏi.');
    const q = { id: uid(), type, text };
    if (type === 'fill') {
      q.answer = $('#q-answer').value.trim();
      if (!q.answer) return alert('Hãy nhập đáp án đúng.');
    } else if (type === 'mc') {
      q.options = $('#q-options').value.split('\n').map((s) => s.trim()).filter(Boolean);
      if (q.options.length < 2) return alert('Trắc nghiệm cần ít nhất 2 lựa chọn.');
      const n = parseInt($('#q-mc-answer').value, 10);
      if (!(n >= 1 && n <= q.options.length)) return alert('Số thứ tự đáp án đúng không hợp lệ.');
      q.answer = n - 1;
    }
    current().questions.push(q);
    save();
    $('#q-text').value = ''; $('#q-answer').value = ''; $('#q-options').value = '';
    renderEdit();
  });

  $('#q-list').addEventListener('click', (e) => {
    const act = e.target.dataset.act;
    if (!act) return;
    const qs = current().questions;
    const i = qs.findIndex((q) => q.id === e.target.closest('li').dataset.id);
    if (act === 'del') qs.splice(i, 1);
    if (act === 'up' && i > 0) [qs[i - 1], qs[i]] = [qs[i], qs[i - 1]];
    if (act === 'down' && i < qs.length - 1) [qs[i + 1], qs[i]] = [qs[i], qs[i + 1]];
    save(); renderEdit();
  });

  $('#btn-clear').addEventListener('click', () => {
    if (current().questions.length && confirm('Xoá toàn bộ câu hỏi trong đề này?')) {
      current().questions = []; save(); renderEdit();
    }
  });

  // ---------- Auto generator ----------
  function genQuestion(ops, lo, hi, nonneg) {
    const op = ops[rand(0, ops.length - 1)];
    let a, b, ans;
    if (op === '+') { a = rand(lo, hi); b = rand(lo, hi); ans = a + b; }
    else if (op === '-') { a = rand(lo, hi); b = rand(lo, hi); if (nonneg && b > a) [a, b] = [b, a]; ans = a - b; }
    else if (op === '×') { a = rand(lo, hi); b = rand(lo, hi); ans = a * b; }
    else { // chia hết
      b = rand(Math.max(lo, 1), Math.max(hi, 1));
      ans = rand(lo, hi);
      a = b * ans;
    }
    return { id: uid(), type: 'fill', text: `${a} ${op} ${b} = ?`, answer: String(ans) };
  }

  $('#btn-generate').addEventListener('click', () => {
    const ops = [...document.querySelectorAll('input[name=op]:checked')].map((c) => c.value);
    if (!ops.length) return alert('Chọn ít nhất một phép tính.');
    const lo = parseInt($('#gen-min').value, 10), hi = parseInt($('#gen-max').value, 10);
    const count = Math.min(100, Math.max(1, parseInt($('#gen-count').value, 10) || 10));
    if (isNaN(lo) || isNaN(hi) || lo > hi) return alert('Khoảng số không hợp lệ.');
    const nonneg = $('#gen-nonneg').checked;
    for (let i = 0; i < count; i++) current().questions.push(genQuestion(ops, lo, hi, nonneg));
    save(); renderEdit();
  });

  // ---------- Vocabulary generator ----------
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = rand(0, i); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };
  const parseVocab = (raw) => raw.split('\n').map((line) => {
    const m = line.split(/\s+[-–—:=]\s+|\t/);
    if (m.length < 2) return null;
    const en = m[0].trim(), vi = m.slice(1).join(' - ').trim();
    return en && vi ? { en, vi, viMain: vi.split('/')[0].trim() } : null;
  }).filter(Boolean);

  function hideLetters(word) {
    const idx = [];
    for (let i = 1; i < word.length; i++) if (/\p{L}/u.test(word[i])) idx.push(i);
    const hide = new Set(shuffle(idx).slice(0, Math.max(1, Math.round(idx.length * 0.4))));
    return [...word].map((c, i) => (hide.has(i) ? '_' : c)).join(' ');
  }

  function vocabQuestion(w, mode, all) {
    if (mode === 'en2vi') return { id: uid(), type: 'fill', text: `Nghĩa của từ "${w.en}" là gì?`, answer: w.vi };
    if (mode === 'vi2en') return { id: uid(), type: 'fill', text: `Từ tiếng Anh của "${w.viMain}" là gì?`, answer: w.en };
    if (mode === 'missing') return { id: uid(), type: 'fill', text: `Điền chữ cái còn thiếu: ${hideLetters(w.en)}  (${w.viMain})`, answer: w.en };
    if (mode === 'scramble') {
      const letters = [...w.en.replace(/\s+/g, '')];
      let mixed = shuffle(letters);
      for (let t = 0; t < 10 && mixed.join('') === letters.join('') && letters.length > 1; t++) mixed = shuffle(letters);
      return { id: uid(), type: 'fill', text: `Sắp xếp các chữ cái thành từ đúng: ${mixed.join(' / ')}  (${w.viMain})`, answer: w.en };
    }
    if (mode === 'listen') return { id: uid(), type: 'fill', text: 'Nghe và viết lại từ tiếng Anh em nghe được.', answer: w.en, speak: w.en };
    const wrong = shuffle(all.filter((x) => x !== w && x.viMain !== w.viMain)).slice(0, 3).map((x) => x.viMain);
    const options = shuffle([w.viMain, ...wrong]);
    return { id: uid(), type: 'mc', text: `"${w.en}" có nghĩa là gì?`, options, answer: options.indexOf(w.viMain) };
  }

  $('#btn-vocab').addEventListener('click', () => {
    const words = parseVocab($('#vocab-list').value);
    const mode = $('#vocab-mode').value;
    if (!words.length) return alert('Hãy nhập danh sách từ, mỗi dòng dạng: english - nghĩa tiếng Việt');
    if (mode === 'mc' && words.length < 4) return alert('Trắc nghiệm cần ít nhất 4 từ để có đáp án nhiễu.');
    const count = Math.min(words.length, Math.max(1, parseInt($('#vocab-count').value, 10) || 10));
    shuffle(words).slice(0, count).forEach((w) => current().questions.push(vocabQuestion(w, mode, words)));
    save(); renderEdit();
  });

  // ---------- Quiz view ----------
  const normalize = (s) => String(s).trim().toLowerCase().replace(',', '.').replace(/\s+/g, ' ');
  function isCorrect(q, val) {
    if (val === '' || val == null) return false;
    if (q.type === 'mc') return Number(val) === q.answer;
    const a = normalize(val);
    return String(q.answer).split('/').some((alt) => {
      const b = normalize(alt);
      return a === b || (a !== '' && b !== '' && !isNaN(a) && !isNaN(b) && Number(a) === Number(b));
    });
  }

  let attemptId = null; // một lần làm bài chỉ ghi một bản ghi, dù bấm nộp nhiều lần

  function renderQuiz() {
    attemptId = uid();
    const sh = current(), box = $('#quiz-box');
    if (!sh.questions.length) { box.innerHTML = '<p class="muted">Đề chưa có câu hỏi. Hãy soạn đề trước.</p>'; return; }
    box.innerHTML = `
      <h2>${esc(sh.title || 'Bài làm')}${sh.child ? ' — ' + esc(sh.child) : ''}</h2>
      <form id="quiz-form">
        ${sh.questions.map((q, i) => `
          <div class="quiz-q" data-i="${i}">
            <div><strong>Câu ${i + 1}.</strong> ${esc(q.text)}
              ${q.speak ? `<button type="button" class="speak" data-speak="${esc(q.speak)}">🔊 Nghe</button>` : ''}</div>
            ${q.type === 'mc' ? q.options.map((o, k) => `<label class="opt"><input type="radio" name="q${i}" value="${k}"> ${String.fromCharCode(65 + k)}. ${esc(o)}</label>`).join('')
              : q.type === 'fill' ? `<input type="text" name="q${i}" autocomplete="off">`
              : `<textarea name="q${i}" rows="3" placeholder="Con viết câu trả lời..."></textarea>`}
            <div class="result"></div>
          </div>`).join('')}
        <button class="primary" type="submit">Nộp bài</button>
      </form>
      <div id="quiz-score"></div>`;
    $('#quiz-form').addEventListener('submit', (e) => { e.preventDefault(); gradeQuiz(); });
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.speak');
    if (!btn) return;
    if (!('speechSynthesis' in window)) return alert('Trình duyệt này không hỗ trợ đọc phát âm.');
    const u = new SpeechSynthesisUtterance(btn.dataset.speak);
    u.lang = 'en-US'; u.rate = 0.85;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  });

  function gradeQuiz() {
    const sh = current(), form = $('#quiz-form');
    let right = 0, gradable = 0, essays = 0;
    const wrong = [];
    sh.questions.forEach((q, i) => {
      const el = form.elements['q' + i];
      const val = q.type === 'mc' ? (form.querySelector(`input[name=q${i}]:checked`) || {}).value : el.value;
      const out = form.querySelector(`.quiz-q[data-i="${i}"] .result`);
      if (q.type === 'essay') { essays++; out.innerHTML = '<span class="muted">Bố mẹ chấm câu này.</span>'; return; }
      gradable++;
      if (isCorrect(q, val)) { right++; out.innerHTML = '<span class="right">✔ Đúng rồi!</span>'; }
      else {
        wrong.push(`Câu ${i + 1}: ${q.text.slice(0, 120)} → ${answerText(q)}`);
        out.innerHTML = `<span class="wrong">✘ Chưa đúng.</span> Đáp án: ${esc(answerText(q))}`;
      }
    });
    const rec = {
      id: attemptId, date: new Date().toISOString(), sheetTitle: sh.title || '(Chưa đặt tên)',
      child: sh.child.trim() || '(Chưa ghi tên)', right, total: gradable, essays, wrong,
    };
    const at = state.history.findIndex((h) => h.id === attemptId);
    if (at >= 0) state.history[at] = rec; else state.history.push(rec);
    save();
    $('#quiz-score').innerHTML = `<div class="score">Điểm: ${right}/${gradable}${essays ? ` <small class="muted">(+ ${essays} câu tự luận chờ bố mẹ chấm)</small>` : ''}</div>`;
    $('#quiz-score').scrollIntoView({ behavior: 'smooth' });
  }

  // ---------- History view ----------
  const fmtDate = (iso) => new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
  const pct = (h) => (h.total ? Math.round((h.right / h.total) * 100) : 0);

  function viewedHistory() {
    const sel = $('#hist-child').value;
    return state.history.filter((h) => !sel || h.child === sel);
  }

  function renderHistory() {
    const sel = $('#hist-child');
    const prev = sel.value;
    const kids = [...new Set(state.history.map((h) => h.child))];
    sel.innerHTML = '<option value="">Tất cả</option>' + kids.map((k) => `<option value="${esc(k)}">${esc(k)}</option>`).join('');
    if (kids.includes(prev)) sel.value = prev;

    const list = viewedHistory();
    const scored = list.filter((h) => h.total > 0);
    $('#hist-empty').hidden = list.length > 0;
    const avg = scored.length ? Math.round(scored.reduce((s, h) => s + pct(h), 0) / scored.length) : 0;
    $('#hist-summary').innerHTML = list.length
      ? `<p>Đã làm <strong>${list.length}</strong> lần · Điểm trung bình <strong>${avg}%</strong>${scored.length ? ` · Cao nhất <strong>${Math.max(...scored.map(pct))}%</strong>` : ''}</p>`
      : '';
    $('#hist-chart').innerHTML = scored.slice(-10).map((h) =>
      `<div class="bar" style="height:${Math.max(pct(h), 2)}%" title="${esc(h.sheetTitle)} · ${fmtDate(h.date)}"><span>${pct(h)}%</span></div>`).join('');
    $('#hist-chart').hidden = !scored.length;
    $('#hist-list').innerHTML = list.slice().reverse().map((h) => `
      <li>
        <details>
          <summary><span>${esc(h.sheetTitle)} · ${esc(h.child)} <span class="muted">${fmtDate(h.date)}</span></span>
            <strong>${h.right}/${h.total}${h.total ? ` (${pct(h)}%)` : ''}</strong></summary>
          ${h.essays ? `<div class="muted">${h.essays} câu tự luận chưa tính điểm.</div>` : ''}
          ${h.wrong.length ? '<ul>' + h.wrong.map((w) => `<li>${esc(w)}</li>`).join('') + '</ul>' : '<div class="right">Không sai câu nào 🎉</div>'}
        </details>
      </li>`).join('');
  }
  $('#hist-child').addEventListener('change', renderHistory);

  $('#btn-hist-clear').addEventListener('click', () => {
    const del = new Set(viewedHistory().map((h) => h.id));
    if (del.size && confirm(`Xoá ${del.size} lần làm bài đang xem? Không thể hoàn tác.`)) {
      state.history = state.history.filter((h) => !del.has(h.id));
      save(); renderHistory();
    }
  });

  $('#btn-hist-csv').addEventListener('click', () => {
    const cell = (v) => `"${String(v).replace(/"/g, '""').replace(/^([=+\-@\t\r])/, "'$1")}"`;
    const rows = [['Ngày', 'Con', 'Đề', 'Đúng', 'Tổng câu chấm', 'Phần trăm', 'Câu tự luận']]
      .concat(viewedHistory().map((h) => [fmtDate(h.date), h.child, h.sheetTitle, h.right, h.total, h.total ? pct(h) + '%' : '', h.essays]));
    const blob = new Blob(['﻿' + rows.map((r) => r.map(cell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'lich-su-diem.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  // ---------- Print view ----------
  function renderPrint() {
    const sh = current(), withAns = $('#print-answers').checked;
    $('#print-area').innerHTML = `
      <h2>${esc(sh.title || 'Bài tập')}</h2>
      <div class="sub">Họ tên: ${esc(sh.child) || '..............................'} &nbsp;·&nbsp; Ngày: ........../........../..........</div>
      ${sh.questions.map((q, i) => `
        <div class="pq">
          <strong>Câu ${i + 1}.</strong> ${esc(q.text)}
          ${q.type === 'mc' ? '<div>' + q.options.map((o, k) => `<div>${String.fromCharCode(65 + k)}. ${esc(o)}</div>`).join('') + '</div>' : ''}
          ${q.speak ? '<div class="muted">🔊 Câu nghe: làm trên máy ở mục "Con làm bài".</div>' : ''}
          ${q.type === 'fill' ? '<div>Đáp án: ........................</div>' : ''}
          ${q.type === 'essay' ? '<div class="line"></div><div class="line"></div><div class="line"></div>' : ''}
          ${withAns && q.type !== 'essay' ? `<div class="ans">Đáp án: ${esc(answerText(q))}</div>` : ''}
        </div>`).join('') || '<p class="muted">Đề chưa có câu hỏi.</p>'}`;
  }
  $('#print-answers').addEventListener('change', renderPrint);
  $('#btn-print').addEventListener('click', () => { renderPrint(); window.print(); });

  // ---------- Library ----------
  function renderLibrary() {
    $('#lib-list').innerHTML = state.sheets.map((s) => `
      <li data-id="${s.id}" class="${s.id === state.currentId ? 'current' : ''}">
        <span>${esc(s.title || '(Chưa đặt tên)')}${s.child ? ' · ' + esc(s.child) : ''} <span class="muted">— ${s.questions.length} câu</span></span>
        <span>
          <button data-act="open">Mở</button>
          <button data-act="dup">Nhân bản</button>
          <button data-act="del" class="danger">Xoá</button>
        </span>
      </li>`).join('');
  }
  $('#lib-list').addEventListener('click', (e) => {
    const act = e.target.dataset.act;
    if (!act) return;
    const id = e.target.closest('li').dataset.id;
    const sh = state.sheets.find((s) => s.id === id);
    if (act === 'open') { state.currentId = id; save(); show('edit'); }
    if (act === 'dup') {
      const copy = JSON.parse(JSON.stringify(sh));
      copy.id = uid(); copy.title = (sh.title || 'Đề') + ' (bản sao)';
      copy.questions.forEach((q) => { q.id = uid(); });
      state.sheets.push(copy); save(); renderLibrary();
    }
    if (act === 'del' && confirm('Xoá đề này? Không thể hoàn tác.')) {
      state.sheets = state.sheets.filter((s) => s.id !== id);
      if (!state.sheets.length) state.sheets.push(newSheet());
      if (!state.sheets.some((s) => s.id === state.currentId)) state.currentId = state.sheets[0].id;
      save(); renderLibrary();
    }
  });
  $('#btn-new').addEventListener('click', () => {
    const s = newSheet(); state.sheets.push(s); state.currentId = s.id; save(); show('edit');
  });

  // ---------- Import / Export ----------
  $('#btn-export').addEventListener('click', () => {
    const sh = current();
    const blob = new Blob([JSON.stringify({ app: 'de-cua-bo-me', version: 1, sheet: sh }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (sh.title || 'de-bai').replace(/[^\p{L}\p{N}]+/gu, '-') + '.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  function sanitizeQuestion(q) {
    if (!q || !['fill', 'mc', 'essay'].includes(q.type) || typeof q.text !== 'string') return null;
    const out = { id: uid(), type: q.type, text: q.text.slice(0, 2000) };
    if (q.type === 'fill') { if (typeof q.answer !== 'string' && typeof q.answer !== 'number') return null; out.answer = String(q.answer); if (typeof q.speak === 'string') out.speak = q.speak.slice(0, 200); }
    if (q.type === 'mc') {
      if (!Array.isArray(q.options) || q.options.length < 2 || !Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) return null;
      out.options = q.options.map((o) => String(o).slice(0, 500)); out.answer = q.answer;
    }
    return out;
  }

  $('#file-import').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const src = data.sheet;
      if (!src || !Array.isArray(src.questions)) throw new Error('bad');
      const sheet = {
        id: uid(), title: String(src.title || '').slice(0, 200), child: String(src.child || '').slice(0, 100),
        questions: src.questions.map(sanitizeQuestion).filter(Boolean),
      };
      state.sheets.push(sheet); state.currentId = sheet.id; save();
      alert(`Đã nhập "${sheet.title || 'đề'}" với ${sheet.questions.length} câu.`);
      show('edit');
    } catch (err) {
      alert('File không hợp lệ. Hãy chọn file .json được xuất từ app này.');
    }
  });

  // ---------- Kid mode (rào chắn nhẹ, chạy hoàn toàn trên trình duyệt) ----------
  const hashStr = (str) => {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
  };

  function askPin(msg) {
    return new Promise((resolve) => {
      const dlg = $('#pin-dialog'), input = $('#pin-input');
      $('#pin-msg').textContent = msg;
      input.value = '';
      dlg.returnValue = '';
      dlg.addEventListener('close', () => resolve(dlg.returnValue === 'ok' ? input.value : null), { once: true });
      dlg.showModal();
      input.focus();
    });
  }
  $('#pin-cancel').addEventListener('click', () => $('#pin-dialog').close('cancel'));

  async function setNewPin() {
    const a = await askPin('Đặt mã PIN gồm 4–8 chữ số (bố mẹ giữ, đừng cho con biết):');
    if (a === null) return false;
    if (!/^\d{4,8}$/.test(a)) { alert('Mã PIN phải gồm 4–8 chữ số.'); return false; }
    const b = await askPin('Nhập lại mã PIN để xác nhận:');
    if (b === null) return false;
    if (b !== a) { alert('Hai lần nhập không khớp.'); return false; }
    const salt = uid();
    state.pin = { salt, hash: hashStr(salt + a) };
    save();
    return true;
  }

  let pinFails = 0, lockedUntil = 0;
  async function checkPin(msg) {
    if (Date.now() < lockedUntil) {
      alert(`Nhập sai nhiều lần. Thử lại sau ${Math.ceil((lockedUntil - Date.now()) / 1000)} giây.`);
      return false;
    }
    const p = await askPin(msg);
    if (p === null) return false;
    if (hashStr(state.pin.salt + p) === state.pin.hash) { pinFails = 0; return true; }
    if (++pinFails >= 5) { pinFails = 0; lockedUntil = Date.now() + 30000; alert('Sai 5 lần. Khoá 30 giây.'); }
    else alert('Sai mã PIN.');
    return false;
  }

  function applyMode() {
    document.body.classList.toggle('kid', !!state.kidMode);
    $('#btn-kid').textContent = state.kidMode ? '🔓 Thoát chế độ con' : '🔒 Chế độ con';
    if (state.kidMode) $('#print-area').innerHTML = ''; // không để lộ đáp án qua Ctrl+P
  }

  $('#btn-kid').addEventListener('click', async () => {
    if (state.kidMode) {
      if (await checkPin('Nhập mã PIN của bố mẹ để thoát chế độ con:')) {
        state.kidMode = false; save(); applyMode(); show('edit');
      }
      return;
    }
    if (!state.pin && !(await setNewPin())) return;
    state.kidMode = true; save(); applyMode(); show('quiz');
  });

  $('#btn-pin').addEventListener('click', async () => {
    if (state.pin && !(await checkPin('Nhập mã PIN hiện tại:'))) return;
    if (await setNewPin()) alert('Đã lưu mã PIN mới.');
  });

  // ---------- Init ----------
  syncTypeFields();
  renderEdit();
  applyMode();
  if (state.kidMode) show('quiz');
})();
