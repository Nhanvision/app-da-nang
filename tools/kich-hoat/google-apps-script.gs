/**
 * Máy chủ kích hoạt cho "Đại Dương Từ Vựng" (Google Apps Script gắn với 1 Google Sheet).
 * Sheet tên "Codes", hàng 1 là tiêu đề (chạy hàm setup() để tạo):
 *   A Mã | B Số máy tối đa | C Số ngày dùng | D Hết hạn (YYYYMMDD) | E Các máy | F Ngày kích hoạt đầu | G Ghi chú
 * Khách gõ mã ngắn (8 ký tự) trong app -> app gọi ?action=activate&code=...&device=...
 *  - Lần kích hoạt đầu: tính hạn = hôm nay + số ngày dùng (mặc định 365).
 *  - Mỗi mã dùng tối đa N máy (mặc định 1); máy cũ nhập lại không tốn thêm lượt.
 *  - Khách đổi máy / cài lại app: chọn dòng của mã trong Sheet rồi bấm menu Đại Dương > Đặt lại máy của mã đang chọn.
 * Triển khai: Deploy > New deployment > Web app > Execute as: Me > Who has access: Anyone.
 */
const SHEET_NAME = 'Codes';
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // bỏ 0 1 O I cho dễ đọc
const DEFAULT_MAX_DEVICES = 1, DEFAULT_DAYS = 365;
// Số máy tối đa của một dòng: ô trống hoặc không phải số (ví dụ gõ chữ "x") -> coi là 1 máy, KHÔNG bao giờ là không giới hạn. Số 0 = thu hồi mã.
function maxDev(v) { const n = Number(v); return (v !== '' && isFinite(n) && n >= 0) ? n : DEFAULT_MAX_DEVICES; }

function setup() {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  sh.getRange(1, 1, 1, 7).setValues([['Mã', 'Số máy tối đa', 'Số ngày dùng', 'Hết hạn', 'Các máy', 'Kích hoạt đầu', 'Ghi chú (tên/Zalo khách)']]).setFontWeight('bold');
  sh.getRange('D:D').setNumberFormat('@'); sh.getRange('F:F').setNumberFormat('@');
  sh.setFrozenRows(1);
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Đại Dương')
    .addItem('Tạo 20 mã mới (1 máy)', 'gen20').addItem('Tạo 20 mã mới (2 máy, cho nhà có 2 điện thoại)', 'gen20x2').addItem('Tạo 50 mã mới (1 máy)', 'gen50')
    .addSeparator().addItem('Đặt lại máy của mã đang chọn', 'resetDevices')
    .addItem('Đặt mật khẩu người bán (cho trang lấy mã)', 'setSellerKey').addToUi();
}
function gen20() { generateCodes(20); }
function gen50() { generateCodes(50); }
function gen20x2() { generateCodes(20, 2); }

// Cho khách chuyển sang máy mới: xoá danh sách máy đã kích hoạt của dòng đang chọn (hạn dùng giữ nguyên)
function resetDevices() {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME), row = sh.getActiveRange().getRow();
  if (row < 2) { SpreadsheetApp.getUi().alert('Hãy chọn một ô nằm ở dòng của mã cần đặt lại (từ dòng 2 trở xuống).'); return; }
  sh.getRange(row, 5).setValue('');
  SpreadsheetApp.getUi().alert('Đã đặt lại máy cho mã ' + sh.getRange(row, 1).getValue() + '. Khách nhập lại mã trên máy mới là dùng được.');
}

function generateCodes(n, maxDevices) {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  const have = {};
  sh.getDataRange().getValues().slice(1).forEach(r => { have[norm(r[0])] = true; });
  const rows = [];
  while (rows.length < n) {
    let c = '';
    for (let i = 0; i < 8; i++) c += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    if (have[c]) continue;
    have[c] = true;
    rows.push([c.slice(0, 4) + '-' + c.slice(4), maxDevices || DEFAULT_MAX_DEVICES, DEFAULT_DAYS, '', '', '', '']);
  }
  const start = sh.getLastRow() + 1;
  sh.getRange(start, 1, rows.length, 7).setValues(rows);
  sh.getRange(start, 4, rows.length, 1).setNumberFormat('@');
  sh.getRange(start, 6, rows.length, 1).setNumberFormat('@');
}

// ======== Trang người bán (tools/ban-hang): lấy mã theo thứ tự từ trên xuống, xem mã đã gửi, đặt lại máy ========
// Mật khẩu người bán lưu trong Script Properties (KHÔNG nằm trong mã nguồn). Đặt bằng menu Đại Dương > Đặt mật khẩu người bán.
function setSellerKey() {
  const ui = SpreadsheetApp.getUi();
  const r = ui.prompt('Đặt mật khẩu người bán', 'Nhập mật khẩu (ít nhất 8 ký tự). Dùng mật khẩu này để vào trang lấy mã.', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  const k = r.getResponseText().trim();
  if (k.length < 8) { ui.alert('Mật khẩu cần ít nhất 8 ký tự.'); return; }
  PropertiesService.getScriptProperties().setProperty('SELLER_KEY', k);
  ui.alert('Đã đặt mật khẩu người bán.');
}

function doPost(e) {
  let out;
  try {
    const b = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const real = PropertiesService.getScriptProperties().getProperty('SELLER_KEY');
    if (!real) out = { ok: false, reason: 'no_key' };
    else if (String(b.key || '') !== real) { Utilities.sleep(1500); out = { ok: false, reason: 'bad_key' }; }
    else if (b.action === 'next') out = sellerNext(Number(b.maxDevices) || 1, String(b.note || '').trim());
    else if (b.action === 'list') out = sellerList();
    else if (b.action === 'unissue') out = sellerUnissue(b.code);
    else if (b.action === 'reset') out = sellerReset(b.code);
    else if (b.action === 'gen') out = sellerGen(Number(b.n) || 20, Number(b.maxDevices) || 1);
    else out = { ok: false, reason: 'bad_request' };
  } catch (err) { out = { ok: false, reason: 'error' }; }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

function sellerCounts(rows) {
  let left1 = 0, left2 = 0;
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][6] || '').trim() || String(rows[i][3] || '').trim() || !rows[i][0]) continue;
    const m = maxDev(rows[i][1]);
    if (m === 1) left1++; else if (m === 2) left2++;
  }
  return { left1: left1, left2: left2 };
}

// Lấy mã chưa phát đầu tiên (từ trên xuống) đúng loại 1 hoặc 2 máy; đánh dấu đã phát bằng cách ghi chú vào cột G.
function sellerNext(maxDevices, note) {
  const lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME), rows = sh.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i][0] || String(rows[i][6] || '').trim() || String(rows[i][3] || '').trim()) continue;
      const m = maxDev(rows[i][1]);
      if (m !== maxDevices) continue;
      const stamp = note || ('Đã gửi ' + Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM HH:mm'));
      sh.getRange(i + 1, 7).setValue(stamp);
      rows[i][6] = stamp;
      return Object.assign({ ok: true, code: String(rows[i][0]), maxDevices: m, note: stamp }, sellerCounts(rows));
    }
    return Object.assign({ ok: false, reason: 'empty' }, sellerCounts(rows));
  } finally { lock.releaseLock(); }
}

function sellerList() {
  const rows = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME).getDataRange().getValues(), items = [];
  for (let i = rows.length - 1; i >= 1 && items.length < 15; i--) {
    const note = String(rows[i][6] || '').trim(), exp = String(rows[i][3] || '').trim();
    if (!note && !exp) continue;
    const devs = String(rows[i][4] || '').split(',').filter(Boolean).length;
    items.push({ code: String(rows[i][0]), note: note, maxDevices: maxDev(rows[i][1]), activated: !!exp, exp: exp, devices: devs });
  }
  return Object.assign({ ok: true, items: items }, sellerCounts(rows));
}

function findRow(rows, codeRaw) {
  const code = norm(codeRaw);
  for (let i = 1; i < rows.length; i++) if (norm(rows[i][0]) === code && code) return i;
  return -1;
}
// Huỷ "đã phát" nếu khách chưa kích hoạt (để khỏi tính nhầm vào số suất ưu đãi)
function sellerUnissue(code) {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME), rows = sh.getDataRange().getValues(), i = findRow(rows, code);
  if (i < 0) return { ok: false, reason: 'invalid' };
  if (String(rows[i][3] || '').trim()) return { ok: false, reason: 'activated' };
  sh.getRange(i + 1, 7).setValue('');
  return { ok: true };
}
// Khách đổi máy: xoá danh sách máy (hạn dùng giữ nguyên)
function sellerReset(code) {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME), rows = sh.getDataRange().getValues(), i = findRow(rows, code);
  if (i < 0) return { ok: false, reason: 'invalid' };
  sh.getRange(i + 1, 5).setValue('');
  return { ok: true };
}
function sellerGen(n, maxDevices) {
  if (n < 1 || n > 100 || (maxDevices !== 1 && maxDevices !== 2)) return { ok: false, reason: 'bad_request' };
  generateCodes(n, maxDevices);
  return Object.assign({ ok: true }, sellerCounts(SpreadsheetApp.getActive().getSheetByName(SHEET_NAME).getDataRange().getValues()));
}

function norm(s) { return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
function ymd(d) { return Utilities.formatDate(d, 'Asia/Ho_Chi_Minh', 'yyyyMMdd'); }

function doGet(e) {
  const p = (e && e.parameter) || {};
  let out;
  try {
    out = p.action === 'activate' ? activate(p.code, p.device)
        : p.action === 'stats' ? stats()
        : { ok: false, reason: 'bad_request' };
  }
  catch (err) { out = { ok: false, reason: 'error' }; }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

// Số mã đã bán = số dòng có ghi chú khách (cột G) hoặc đã kích hoạt (cột D). Trang giới thiệu dùng để hiện "Còn X/20 suất ưu đãi".
function stats() {
  const rows = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME).getDataRange().getValues();
  let sold = 0;
  for (let i = 1; i < rows.length; i++) if (String(rows[i][6] || '').trim() || String(rows[i][3] || '').trim()) sold++;
  return { ok: true, sold: sold };
}

function activate(codeRaw, deviceRaw) {
  const code = norm(codeRaw), dev = norm(deviceRaw).slice(0, 16);
  if (code.length !== 8 || !dev) return { ok: false, reason: 'invalid' };
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
    const rows = sh.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (norm(rows[i][0]) !== code) continue;
      const max = maxDev(rows[i][1]);
      const days = Number(rows[i][2]) || DEFAULT_DAYS;
      const devs = String(rows[i][4] || '').split(',').map(s => s.trim()).filter(Boolean);
      let exp = String(rows[i][3] || '').trim();
      const today = ymd(new Date());
      if (exp && today > exp) return { ok: false, reason: 'expired', exp: exp };
      if (devs.indexOf(dev) < 0) {
        if (devs.length >= max) return { ok: false, reason: 'full' };
        devs.push(dev);
        sh.getRange(i + 1, 5).setValue(devs.join(','));
      }
      if (!exp) {   // lần kích hoạt đầu tiên của mã
        exp = ymd(new Date(Date.now() + days * 86400000));
        sh.getRange(i + 1, 4).setNumberFormat('@').setValue(exp);
        sh.getRange(i + 1, 6).setNumberFormat('@').setValue(today);
      }
      return { ok: true, exp: exp };
    }
    return { ok: false, reason: 'invalid' };
  } finally { lock.releaseLock(); }
}
