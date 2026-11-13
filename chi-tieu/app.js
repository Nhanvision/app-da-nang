(() => {
  'use strict';

  const CATS = {
    out: [
      ['an', '🍜', 'Ăn uống'], ['dilai', '🛵', 'Đi lại'], ['nha', '🏠', 'Nhà cửa / hoá đơn'],
      ['muasam', '🛍️', 'Mua sắm'], ['suckhoe', '💊', 'Sức khoẻ'], ['giaoduc', '📚', 'Học tập'],
      ['giaitri', '🎬', 'Giải trí'], ['con', '🧸', 'Con cái'], ['khac', '📦', 'Khác']
    ],
    in: [['luong', '💼', 'Lương'], ['thuong', '🎁', 'Thưởng'], ['phu', '🧾', 'Thu nhập phụ'], ['thukhac', '💵', 'Thu khác']]
  };
  const CAT_INFO = Object.fromEntries([...CATS.out, ...CATS.in].map(c => [c[0], { icon: c[1], name: c[2] }]));

  const KEY = 'sochitieu.v1';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const state = Object.assign({ tx: [], budgets: {}, catBudgets: {}, recurring: [], recDone: [], su: 0 }, load());
  const saveLocal = () => localStorage.setItem(KEY, JSON.stringify(state));
  const save = () => { saveLocal(); scheduleSync(); };
  const touchSettings = () => { state.su = Date.now(); };
  // giao dịch đã xoá được giữ lại dạng "del" để việc xoá cũng đồng bộ sang máy khác
  const live = () => state.tx.filter(t => !t.del);

  const SYNC_KEY = 'sochitieu.sync';
  const cfg = (() => { try { return JSON.parse(localStorage.getItem(SYNC_KEY)) || {}; } catch { return {}; } })();
  const sync = { timer: null, busy: false, again: false };

  const $ = id => document.getElementById(id);
  const pad = n => String(n).padStart(2, '0');
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = () => iso(new Date());
  const vnd = n => Math.round(n).toLocaleString('vi-VN') + ' đ';
  const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sum = (arr, t) => arr.filter(x => x.type === t).reduce((s, x) => s + x.amount, 0);

  const moneyInput = el => el.addEventListener('input', () => {
    const d = el.value.replace(/\D/g, '');
    el.value = d ? (+d).toLocaleString('vi-VN') : '';
  });
  const num = s => +String(s).replace(/\D/g, '');
  const catOptions = type => CATS[type].map(c => `<option value="${c[0]}">${c[1]} ${c[2]}</option>`).join('');

  /* ---------- khoản định kỳ: tự ghi vào đúng ngày mỗi tháng ---------- */
  function applyRecurring() {
    const now = today();
    let changed = false;
    for (const r of state.recurring) {
      let [y, m] = r.start.split('-').map(Number);
      for (;;) {
        const ym = `${y}-${pad(m)}`;
        const date = `${ym}-${pad(Math.min(r.day, new Date(y, m, 0).getDate()))}`;
        if (date > now) break;
        const key = `${r.id}|${ym}`;
        if (!state.recDone.includes(key)) {
          // id cố định theo khoản + tháng: hai máy cùng sinh ra thì gộp thành một, không bị trùng
          state.tx.push({ id: `r${r.id}-${ym}`, u: Date.now(), type: r.type, amount: r.amount, cat: r.cat, note: r.note, date, recId: r.id });
          state.recDone.push(key);
          changed = true;
        }
        if (++m > 12) { m = 1; y++; }
      }
    }
    if (changed) save();
  }
  applyRecurring();

  let day = today();
  let mon = day.slice(0, 7);
  let editId = null;

  /* ---------- hiển thị ---------- */
  function rowHtml(t, showDate) {
    const c = CAT_INFO[t.cat] || { icon: '📦', name: 'Khác' };
    const sub = showDate ? t.date.split('-').reverse().slice(0, 2).join('/') + ' · ' : '';
    return `<li data-id="${t.id}">
      <span class="ico">${c.icon}</span>
      <span class="mid"><div>${esc(t.note || c.name)}${t.recId ? '<span class="tag">định kỳ</span>' : ''}</div><small>${sub}${c.name}</small></span>
      <span class="amt ${t.type}">${t.type === 'out' ? '-' : '+'}${vnd(t.amount)}</span></li>`;
  }
  const emptyHtml = msg => `<li class="empty">${msg}</li>`;

  function renderDay() {
    $('dayPick').value = day;
    const list = live().filter(t => t.date === day).sort((a, b) => (b.u || 0) - (a.u || 0));
    $('dayOut').textContent = vnd(sum(list, 'out'));
    $('dayIn').textContent = vnd(sum(list, 'in'));
    $('dayList').innerHTML = list.length ? list.map(t => rowHtml(t)).join('') : emptyHtml('Chưa có giao dịch. Bấm + để thêm.');
  }

  function renderMonth() {
    $('monPick').value = mon;
    const list = live().filter(t => t.date.startsWith(mon)).sort((a, b) => b.date.localeCompare(a.date) || (b.u || 0) - (a.u || 0));
    const out = sum(list, 'out'), inc = sum(list, 'in');
    $('monOut').textContent = vnd(out);
    $('monIn').textContent = vnd(inc);
    $('monBal').textContent = vnd(inc - out);

    // ngân sách
    const budget = state.budgets[mon] || 0;
    const bar = $('budgetBar');
    if (budget) {
      const pct = out / budget * 100;
      bar.style.width = Math.min(pct, 100) + '%';
      bar.className = pct >= 100 ? 'over' : pct >= 80 ? 'warn' : '';
      $('budgetText').textContent = out > budget
        ? `Vượt ngân sách ${vnd(out - budget)} (đã chi ${Math.round(pct)}% của ${vnd(budget)})`
        : `Đã chi ${Math.round(pct)}% · còn ${vnd(budget - out)} trên ${vnd(budget)}`;
    } else {
      bar.style.width = '0'; bar.className = '';
      $('budgetText').textContent = 'Chưa đặt ngân sách cho tháng này.';
    }

    // theo danh mục
    const byCat = {};
    list.filter(t => t.type === 'out').forEach(t => byCat[t.cat] = (byCat[t.cat] || 0) + t.amount);
    Object.keys(state.catBudgets).forEach(k => { if (!(k in byCat)) byCat[k] = 0; });
    const rows = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
    $('catBars').innerHTML = rows.length ? rows.map(([k, v]) => {
      const c = CAT_INFO[k] || { icon: '📦', name: 'Khác' };
      const cb = state.catBudgets[k];
      if (cb) {
        const pct = v / cb * 100;
        const cls = pct >= 100 ? 'over' : pct >= 80 ? 'warn' : '';
        return `<div class="catrow"><div class="h"><span>${c.icon} ${c.name}</span><span>${vnd(v)} / ${vnd(cb)}</span></div>
          <div class="bar"><i class="${cls}" style="width:${Math.min(pct, 100)}%"></i></div>
          ${v > cb ? `<p class="muted">Vượt ${vnd(v - cb)}</p>` : ''}</div>`;
      }
      const pct = out ? v / out * 100 : 0;
      return `<div class="catrow"><div class="h"><span>${c.icon} ${c.name}</span><span>${vnd(v)} · ${Math.round(pct)}%</span></div>
        <div class="bar"><i style="width:${pct}%"></i></div></div>`;
    }).join('') : '<p class="muted">Chưa có khoản chi.</p>';

    // theo ngày
    const [y, m] = mon.split('-').map(Number);
    const days = new Date(y, m, 0).getDate();
    const perDay = Array(days).fill(0);
    list.filter(t => t.type === 'out').forEach(t => perDay[+t.date.slice(8) - 1] += t.amount);
    const max = Math.max(...perDay, 1);
    $('dayChart').innerHTML = perDay.map((v, i) =>
      `<div class="${v ? '' : 'zero'}" style="height:${v ? Math.max(v / max * 100, 4) : 2}%" title="Ngày ${i + 1}: ${vnd(v)}"></div>`).join('');

    $('monList').innerHTML = list.length ? list.map(t => rowHtml(t, true)).join('') : emptyHtml('Tháng này chưa có giao dịch.');
  }

  function renderSettings() {
    $('recList').innerHTML = state.recurring.length ? state.recurring.map(r => {
      const c = CAT_INFO[r.cat] || { icon: '📦', name: 'Khác' };
      return `<li data-rid="${r.id}"><span class="ico">${c.icon}</span>
        <span class="mid"><div>${esc(r.note || c.name)}</div><small>Ngày ${r.day} hàng tháng · từ ${r.start.split('-').reverse().join('/')}</small></span>
        <span class="amt ${r.type}">${r.type === 'out' ? '-' : '+'}${vnd(r.amount)}</span></li>`;
    }).join('') : emptyHtml('Chưa có khoản định kỳ.');
    const focused = document.activeElement && document.activeElement.dataset.bud;
    if (!focused) {
      $('budList').innerHTML = CATS.out.map(c => `<div class="budrow"><span>${c[1]} ${c[2]}</span>
        <input type="text" inputmode="numeric" placeholder="Không giới hạn" data-bud="${c[0]}"
          value="${state.catBudgets[c[0]] ? state.catBudgets[c[0]].toLocaleString('vi-VN') : ''}"></div>`).join('');
      $('budList').querySelectorAll('input').forEach(moneyInput);
    }
  }

  const render = () => { renderDay(); renderMonth(); renderSettings(); };

  $('budList').addEventListener('change', e => {
    const k = e.target.dataset.bud;
    if (!k) return;
    const n = num(e.target.value);
    if (n) state.catBudgets[k] = n; else delete state.catBudgets[k];
    touchSettings(); save(); renderMonth();
  });

  /* ---------- tab & điều hướng ---------- */
  document.querySelectorAll('.tabs button').forEach(b => b.onclick = () => {
    document.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('active', x === b));
    ['day', 'month', 'set'].forEach(t => $('tab-' + t).hidden = b.dataset.tab !== t);
  });
  const shiftDay = n => { const d = new Date(day + 'T00:00'); d.setDate(d.getDate() + n); day = iso(d); mon = day.slice(0, 7); render(); };
  const shiftMon = n => { const [y, m] = mon.split('-').map(Number); const d = new Date(y, m - 1 + n, 1); mon = iso(d).slice(0, 7); render(); };
  $('dayPrev').onclick = () => shiftDay(-1);
  $('dayNext').onclick = () => shiftDay(1);
  $('dayToday').onclick = () => { day = today(); mon = day.slice(0, 7); render(); };
  $('dayPick').onchange = e => { if (e.target.value) { day = e.target.value; mon = day.slice(0, 7); render(); } };
  $('monPrev').onclick = () => shiftMon(-1);
  $('monNext').onclick = () => shiftMon(1);
  $('monPick').onchange = e => { if (e.target.value) { mon = e.target.value; render(); } };

  /* ---------- form thêm / sửa ---------- */
  const dlg = $('dlg');
  const curType = () => document.querySelector('input[name=type]:checked').value;
  function fillCats(sel) {
    $('fCat').innerHTML = CATS[curType()].map(c => `<option value="${c[0]}">${c[1]} ${c[2]}</option>`).join('');
    if (sel) $('fCat').value = sel;
  }
  document.querySelectorAll('input[name=type]').forEach(r => r.onchange = () => fillCats());
  $('fAmount').addEventListener('input', e => {
    const d = e.target.value.replace(/\D/g, '');
    e.target.value = d ? (+d).toLocaleString('vi-VN') : '';
  });

  function openForm(t) {
    editId = t ? t.id : null;
    $('dlgTitle').textContent = t ? 'Sửa giao dịch' : 'Thêm giao dịch';
    document.querySelector(`input[name=type][value=${t ? t.type : 'out'}]`).checked = true;
    fillCats(t && t.cat);
    $('fAmount').value = t ? t.amount.toLocaleString('vi-VN') : '';
    $('fNote').value = t ? t.note : '';
    $('fDate').value = t ? t.date : (!$('tab-day').hidden ? day : today());
    $('fDel').hidden = !t;
    dlg.showModal();
    $('fAmount').focus();
  }
  $('fab').onclick = () => openForm();
  $('fCancel').onclick = () => dlg.close();
  $('fDel').onclick = () => {
    if (confirm('Xoá giao dịch này?')) {
      Object.assign(state.tx.find(t => t.id === editId), { del: true, u: Date.now() });
      save(); render(); dlg.close();
    }
  };
  $('form').onsubmit = e => {
    e.preventDefault();
    const amount = +$('fAmount').value.replace(/\D/g, '');
    if (!amount) return;
    const rec = { type: curType(), amount, cat: $('fCat').value, note: $('fNote').value.trim(), date: $('fDate').value };
    if (editId) Object.assign(state.tx.find(t => t.id === editId), rec, { u: Date.now() });
    else state.tx.push({ id: 'x' + Date.now() + Math.random().toString(36).slice(2, 6), u: Date.now(), ...rec });
    day = rec.date; mon = day.slice(0, 7);
    save(); render(); dlg.close();
  };

  const openFromList = e => {
    const li = e.target.closest('li[data-id]');
    if (li) openForm(state.tx.find(t => String(t.id) === li.dataset.id));
  };
  $('dayList').onclick = openFromList;
  $('monList').onclick = openFromList;

  /* ---------- form khoản định kỳ ---------- */
  const rdlg = $('rdlg');
  const rType = () => document.querySelector('input[name=rtype]:checked').value;
  let recEdit = null;
  const fillRCats = sel => { $('rCat').innerHTML = catOptions(rType()); if (sel) $('rCat').value = sel; };
  document.querySelectorAll('input[name=rtype]').forEach(r => r.onchange = () => fillRCats());
  moneyInput($('rAmount'));
  function openRec(r) {
    recEdit = r ? r.id : null;
    $('rTitle').textContent = r ? 'Sửa khoản định kỳ' : 'Thêm khoản định kỳ';
    document.querySelector(`input[name=rtype][value=${r ? r.type : 'out'}]`).checked = true;
    fillRCats(r && r.cat);
    $('rAmount').value = r ? r.amount.toLocaleString('vi-VN') : '';
    $('rNote').value = r ? r.note : '';
    $('rDay').value = r ? r.day : 1;
    $('rStart').value = r ? r.start : today().slice(0, 7);
    $('rDel').hidden = !r;
    rdlg.showModal();
  }
  $('recAdd').onclick = () => openRec();
  $('rCancel').onclick = () => rdlg.close();
  $('recList').onclick = e => {
    const li = e.target.closest('li[data-rid]');
    if (li) openRec(state.recurring.find(r => r.id === +li.dataset.rid));
  };
  $('rDel').onclick = () => {
    if (confirm('Xoá khoản định kỳ này? Các giao dịch đã ghi trước đó vẫn được giữ.')) {
      state.recurring = state.recurring.filter(r => r.id !== recEdit);
      touchSettings(); save(); render(); rdlg.close();
    }
  };
  $('rform').onsubmit = e => {
    e.preventDefault();
    const amount = num($('rAmount').value);
    if (!amount) return;
    const rec = { type: rType(), amount, cat: $('rCat').value, note: $('rNote').value.trim(),
      day: Math.min(31, Math.max(1, +$('rDay').value || 1)), start: $('rStart').value };
    if (recEdit) Object.assign(state.recurring.find(r => r.id === recEdit), rec);
    else state.recurring.push({ id: Date.now(), ...rec });
    touchSettings(); applyRecurring(); save(); render(); rdlg.close();
  };

  /* ---------- cài app (PWA) ---------- */
  let deferred = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; $('installBtn').hidden = false; });
  $('installBtn').onclick = async () => { if (!deferred) return; deferred.prompt(); await deferred.userChoice; deferred = null; $('installBtn').hidden = true; };
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});

  /* ---------- ngân sách & CSV ---------- */
  $('budgetBtn').onclick = () => {
    const cur = state.budgets[mon] || '';
    const v = prompt(`Ngân sách chi tiêu tháng ${mon.split('-').reverse().join('/')} (đ). Để trống để bỏ:`, cur);
    if (v === null) return;
    const n = +v.replace(/\D/g, '');
    if (n) state.budgets[mon] = n; else delete state.budgets[mon];
    touchSettings(); save(); renderMonth();
  };
  $('csvBtn').onclick = () => {
    const rows = live().filter(t => t.date.startsWith(mon)).sort((a, b) => a.date.localeCompare(b.date));
    if (!rows.length) return alert('Tháng này chưa có dữ liệu.');
    const q = s => `"${String(s).replace(/"/g, '""')}"`;
    const csv = '﻿Ngày,Loại,Danh mục,Ghi chú,Số tiền\n' + rows.map(t =>
      [t.date, t.type === 'out' ? 'Chi' : 'Thu', (CAT_INFO[t.cat] || {}).name || '', q(t.note), t.amount].join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `chi-tieu-${mon}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  /* ---------- đồng bộ qua Google Sheet (Apps Script) ---------- */
  const setStatus = msg => { $('syncStatus').textContent = msg; };

  function scheduleSync() {
    if (!cfg.url) return;
    clearTimeout(sync.timer);
    sync.timer = setTimeout(doSync, 1500);
  }

  // gộp theo từng giao dịch: bản nào sửa sau cùng (u lớn hơn) thì thắng
  function mergeTx(local, remote) {
    const map = new Map(local.map(t => [String(t.id), t]));
    for (const r of remote) {
      const cur = map.get(String(r.id));
      if (!cur || (r.u || 0) > (cur.u || 0)) map.set(String(r.id), r);
    }
    return [...map.values()];
  }

  async function doSync() {
    if (!cfg.url) return;
    if (sync.busy) { sync.again = true; return; }
    sync.busy = true;
    setStatus('Đang đồng bộ…');
    try {
      const body = JSON.stringify({
        key: cfg.key, tx: state.tx,
        settings: { catBudgets: state.catBudgets, budgets: state.budgets, recurring: state.recurring, recDone: state.recDone, u: state.su }
      });
      const res = await fetch(cfg.url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      state.tx = mergeTx(state.tx, data.tx || []);
      const s = data.settings;
      if (s) {
        if ((s.u || 0) > state.su) {
          state.catBudgets = s.catBudgets || {}; state.budgets = s.budgets || {};
          state.recurring = s.recurring || []; state.su = s.u;
        }
        state.recDone = [...new Set([...state.recDone, ...(s.recDone || [])])];
      }
      saveLocal();
      applyRecurring();
      render();
      const t = new Date();
      setStatus(`Đã đồng bộ lúc ${pad(t.getHours())}:${pad(t.getMinutes())}`);
    } catch (err) {
      setStatus(`Chưa đồng bộ được (${err.message}). Sẽ thử lại khi có mạng.`);
    } finally {
      sync.busy = false;
      if (sync.again) { sync.again = false; scheduleSync(); }
    }
  }

  function showSyncCfg() {
    $('syncUrl').value = cfg.url || '';
    $('syncKey').value = cfg.key || '';
    $('syncOff').hidden = !cfg.url;
    if (!cfg.url) setStatus('Chưa kết nối.');
  }
  $('syncSave').onclick = () => {
    const url = $('syncUrl').value.trim(), key = $('syncKey').value.trim();
    if (!/^https:\/\/script\.google\.com\/.+\/exec$/.test(url)) return setStatus('Link phải có dạng https://script.google.com/…/exec');
    if (!key) return setStatus('Chưa nhập mã bí mật.');
    Object.assign(cfg, { url, key });
    localStorage.setItem(SYNC_KEY, JSON.stringify(cfg));
    $('syncOff').hidden = false;
    doSync();
  };
  $('syncOff').onclick = () => {
    if (!confirm('Ngắt kết nối Google Sheet? Dữ liệu trên máy này và trong Sheet vẫn được giữ.')) return;
    delete cfg.url; delete cfg.key;
    localStorage.removeItem(SYNC_KEY);
    showSyncCfg();
  };
  document.addEventListener('visibilitychange', () => { if (!document.hidden) doSync(); });
  window.addEventListener('online', doSync);

  showSyncCfg();
  render();
  doSync();
})();
