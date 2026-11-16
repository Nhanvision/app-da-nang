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
  showAdmin('admBox'); renderLic();
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


// ---------- Kích hoạt bản đầy đủ ----------
function renderLic() {
  $('licStatus').innerHTML = LIC.ok ? '✅ <b>Đã kích hoạt bản đầy đủ</b> trên thiết bị này.' : '🎁 Đang dùng bản dùng thử (chỉ cấp Cơ bản, ' + TRIAL_WORDS + ' từ).';
  $('licForm').hidden = LIC.ok;
  $('admWords').hidden = !LIC.ok;
  $('devId').textContent = $('devId0').textContent = fmtDeviceId(getDeviceId());
  $('devPre').hidden = LIC.ok;
  const s = [SHOP.price && 'Giá: ' + SHOP.price, SHOP.zalo && 'Zalo: ' + SHOP.zalo, SHOP.bank && 'Chuyển khoản: ' + SHOP.bank, SHOP.note].filter(Boolean);
  $('shopInfo').innerHTML = s.map(t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;')).join('<br>');
  if (LIC.ok) renderAdmin();
}
function copyDeviceId(btn) {
  const old = btn.textContent;
  navigator.clipboard.writeText(fmtDeviceId(getDeviceId())).then(() => btn.textContent = '✔ Đã chép', () => btn.textContent = 'Hãy bôi đen và copy');
  setTimeout(() => btn.textContent = old, 2000);
}
$('devCopy').onclick = () => copyDeviceId($('devCopy'));
$('devCopy0').onclick = () => copyDeviceId($('devCopy0'));
$('licGo').onclick = async () => {
  if (!crypto.subtle) return $('licMsg').textContent = 'Trình duyệt chỉ kích hoạt được khi mở bằng https (hoặc localhost).';
  if (await activateCode($('licCode').value)) { $('licMsg').textContent = ''; renderLic(); }
  else $('licMsg').textContent = '❌ Mã không đúng cho thiết bị này. Kiểm tra lại mã máy và mã kích hoạt.';
};

licReady.then(() => { renderLic(); openPin(); });

// ---------- Xuất / nhập file ----------
$('admExport').onclick = () => {
  const data = { app: 'oceanvocab', version: 1, exportedAt: new Date().toISOString(), custom: getCustom(), only: getOnly() };
  const total = Object.values(data.custom).reduce((n, l) => n + l.length, 0);
  if (!total) return $('admMsg').textContent = 'Chưa có từ riêng nào để xuất.';
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  a.download = 'tu-vung-dai-duong-' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  $('admMsg').textContent = `Đã xuất ${total} từ.`;
};
$('admImport').onclick = () => $('admFile').click();
$('admFile').onchange = async e => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  let data;
  try { data = JSON.parse(await file.text()); } catch (err) { return $('admMsg').textContent = 'File không đọc được (không phải JSON).'; }
  if (!data || data.app !== 'oceanvocab' || typeof data.custom !== 'object') return $('admMsg').textContent = 'Đây không phải file từ vựng của game này.';
  const c = getCustom(), o = getOnly();
  let added = 0, skipped = 0;
  for (const lvl of Object.keys(LEVELS)) {
    const list = Array.isArray(data.custom[lvl]) ? data.custom[lvl] : [];
    const have = new Set(c[lvl].map(w => w[0].toLowerCase()));
    for (const w of list) {
      if (!Array.isArray(w) || typeof w[0] !== 'string' || typeof w[1] !== 'string' || !w[0].trim() || !w[1].trim()) { skipped++; continue; }
      const k = w[0].trim().toLowerCase();
      if (have.has(k)) { skipped++; continue; }
      have.add(k); c[lvl].push([w[0].trim(), w[1].trim()]); added++;
    }
    if (data.only && data.only[lvl] === true) o[lvl] = true;
  }
  store.set('custom', c); store.set('only', o);
  $('admMsg').textContent = `Đã nhập ${added} từ` + (skipped ? `, bỏ qua ${skipped} từ trùng/không hợp lệ.` : '.');
  renderAdmin();
};
