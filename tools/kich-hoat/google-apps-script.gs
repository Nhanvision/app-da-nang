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
    .addSeparator().addItem('Đặt lại máy của mã đang chọn', 'resetDevices').addToUi();
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

function norm(s) { return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
function ymd(d) { return Utilities.formatDate(d, 'Asia/Ho_Chi_Minh', 'yyyyMMdd'); }

function doGet(e) {
  const p = (e && e.parameter) || {};
  let out;
  try { out = p.action === 'activate' ? activate(p.code, p.device) : { ok: false, reason: 'bad_request' }; }
  catch (err) { out = { ok: false, reason: 'error' }; }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
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
      const max = rows[i][1] === '' ? DEFAULT_MAX_DEVICES : Number(rows[i][1]);
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
