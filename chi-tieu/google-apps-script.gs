// Cầu nối giữa app Sổ Chi Tiêu và Google Sheet của bạn.
// Dán toàn bộ file này vào Apps Script của Sheet (xem HUONG-DAN-DONG-BO.md).

// ĐỔI dòng này thành một chuỗi bí mật của riêng bạn (dài, khó đoán).
// Phải nhập đúng chuỗi này vào ô "Mã bí mật" trong app.
const SECRET = 'DOI-MA-NAY';

const HEAD = ['id', 'u', 'del', 'type', 'amount', 'cat', 'note', 'date', 'recId'];

function doGet() {
  return out({ ok: true, msg: 'Sổ Chi Tiêu đang chạy. Dùng link này trong app, đừng mở trực tiếp.' });
}

function doPost(e) {
  let req;
  try { req = JSON.parse(e.postData.contents); } catch (err) { return out({ error: 'Dữ liệu không hợp lệ' }); }
  if (req.key !== SECRET) return out({ error: 'Sai mã bí mật' });

  const lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName('GiaoDich') || ss.insertSheet('GiaoDich');
    const st = ss.getSheetByName('CaiDat') || ss.insertSheet('CaiDat');

    // 1. đọc giao dịch đang có trong Sheet
    const map = {};
    const last = sh.getLastRow();
    if (last > 1) {
      sh.getRange(2, 1, last - 1, HEAD.length).getValues().forEach(r => {
        if (r[0] === '') return;
        map[String(r[0])] = {
          id: String(r[0]), u: Number(r[1]) || 0, del: String(r[2]) === 'true',
          type: String(r[3]), amount: Number(r[4]) || 0, cat: String(r[5]),
          note: String(r[6]), date: String(r[7]), recId: r[8] === '' ? undefined : Number(r[8])
        };
      });
    }

    // 2. gộp giao dịch gửi lên: bản nào sửa sau cùng thì thắng
    (req.tx || []).forEach(t => {
      const id = String(t.id);
      const cur = map[id];
      if (!cur || (Number(t.u) || 0) >= cur.u) {
        map[id] = {
          id: id, u: Number(t.u) || 0, del: !!t.del, type: t.type === 'in' ? 'in' : 'out',
          amount: Number(t.amount) || 0, cat: String(t.cat || ''), note: String(t.note || ''),
          date: String(t.date || ''), recId: t.recId === undefined ? undefined : Number(t.recId)
        };
      }
    });

    // 3. ghi lại (định dạng text để Sheet không tự đổi ngày/ghi chú)
    const rows = Object.keys(map).map(k => map[k]).sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
    sh.clear();
    sh.getRange(1, 1, 1, HEAD.length).setValues([HEAD]).setFontWeight('bold');
    if (rows.length) {
      const range = sh.getRange(2, 1, rows.length, HEAD.length);
      range.setNumberFormat('@');
      range.setValues(rows.map(t => [t.id, t.u, t.del, t.type, t.amount, t.cat, t.note, t.date, t.recId === undefined ? '' : t.recId].map(String)));
    }
    sh.setFrozenRows(1);

    // 4. cài đặt (ngân sách, khoản định kỳ): bản mới hơn thắng
    let settings = null;
    try { settings = JSON.parse(st.getRange('A1').getValue()); } catch (err) { settings = null; }
    const inc = req.settings;
    if (inc && (!settings || (Number(inc.u) || 0) > (Number(settings.u) || 0))) {
      // giữ nguyên danh sách "đã sinh khoản định kỳ" của cả hai bên
      const done = {};
      (settings && settings.recDone || []).concat(inc.recDone || []).forEach(k => done[k] = 1);
      settings = Object.assign({}, inc, { recDone: Object.keys(done) });
    } else if (settings && inc) {
      const done = {};
      (settings.recDone || []).concat(inc.recDone || []).forEach(k => done[k] = 1);
      settings.recDone = Object.keys(done);
    }
    if (settings) {
      st.getRange('A1').setNumberFormat('@').setValue(JSON.stringify(settings));
      st.getRange('B1').setValue('← cài đặt của app (đừng sửa tay)');
    }

    return out({ tx: rows, settings: settings });
  } finally {
    lock.releaseLock();
  }
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
