'use strict';
// Trang Admin dành cho bố mẹ: mã PIN + từ vựng riêng
let admLvl = 'basic';
function showAdmin(which) { ['pinBox', 'admBox'].forEach(id => $(id).hidden = id !== which); }
function openPin() {
  $('pinMsg').textContent = '';
  $('pinHelp').textContent = store.get('pin', '') ? 'Nhập mã PIN của Admin.' : 'Lần đầu: đặt mã PIN 4–8 số để con không vào sửa từ được.';
  $('pinIn').value = '';
  $('pinForgot').hidden = !store.get('pin', '');
  showAdmin('pinBox'); $('pinIn').focus();
}
$('pinOk').onclick = () => {
  const v = $('pinIn').value.trim(), cur = store.get('pin', '');
  if (!cur) {
    if (!/^\d{4,8}$/.test(v)) return $('pinMsg').textContent = 'PIN phải gồm 4–8 chữ số.';
    store.set('pin', v);
  } else if (v !== cur) return $('pinMsg').textContent = 'Sai mã PIN.';
  showAdmin('admBox'); renderAdmin();
};
$('pinForgot').onclick = () => {
  if (!confirm('Đặt lại mã PIN sẽ XOÁ toàn bộ từ vựng riêng đã nhập. Tiếp tục?')) return;
  ['pin', 'custom', 'only'].forEach(k => { try { localStorage.removeItem('oceanvocab-' + k); } catch (e) {} });
  openPin();
};
$('pinIn').onkeydown = e => { if (e.key === 'Enter') $('pinOk').click(); };
$('admClose').onclick = openPin;   // khoá lại, cần nhập PIN để vào tiếp
document.querySelectorAll('.admTab').forEach(b => b.onclick = () => { admLvl = b.dataset.lvl; renderAdmin(); });
$('admOnly').onchange = e => { const o = getOnly(); o[admLvl] = e.target.checked; store.set('only', o); renderAdmin(); };
$('admAdd').onclick = () => {
  const { ok, bad } = parseWords($('admText').value);
  const c = getCustom(), have = new Set(c[admLvl].map(w => w[0].toLowerCase()));
  let added = 0;
  for (const w of ok) { const k = w[0].toLowerCase(); if (!have.has(k)) { have.add(k); c[admLvl].push(w); added++; } }
  store.set('custom', c);
  $('admText').value = bad.join('\n');
  $('admMsg').textContent = `Đã thêm ${added} từ` + (ok.length - added ? `, bỏ qua ${ok.length - added} từ trùng` : '') +
    (bad.length ? `. ${bad.length} dòng sai định dạng được giữ lại trong ô để anh sửa.` : '.');
  renderAdmin();
};
$('admPin').onclick = () => {
  const v = prompt('Nhập mã PIN mới (4–8 chữ số):');
  if (v === null) return;
  if (!/^\d{4,8}$/.test(v.trim())) return alert('PIN phải gồm 4–8 chữ số.');
  store.set('pin', v.trim());
  $('admMsg').textContent = 'Đã đổi mã PIN.';
};
$('admClear').onclick = () => {
  const c = getCustom();
  if (!c[admLvl].length || !confirm('Xoá toàn bộ ' + c[admLvl].length + ' từ riêng của cấp ' + LEVELS[admLvl].name + '?')) return;
  c[admLvl] = []; store.set('custom', c); renderAdmin();
};
function renderAdmin() {
  document.querySelectorAll('.admTab').forEach(b => b.classList.toggle('on', b.dataset.lvl === admLvl));
  const list = getCustom()[admLvl], only = getOnly()[admLvl];
  $('admOnly').checked = only;
  $('admCount').textContent = `Từ riêng: ${list.length} · Từ mặc định: ${WORDS[admLvl].length}` +
    (only && list.length < MIN_WORDS ? ' ⚠️ cần ≥ ' + MIN_WORDS + ' từ riêng để chơi' : '');
  const box = $('admList'); box.innerHTML = '';
  list.forEach((w, i) => {
    const s = document.createElement('span');
    s.textContent = `${w[0]} = ${w[1]} `;
    const x = document.createElement('button');
    x.textContent = '✕'; x.title = 'Xoá';
    x.onclick = () => { const c = getCustom(); c[admLvl].splice(i, 1); store.set('custom', c); renderAdmin(); };
    s.appendChild(x); box.appendChild(s);
  });
}


openPin();
