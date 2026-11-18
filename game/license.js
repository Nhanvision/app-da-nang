'use strict';
// Kích hoạt bản đầy đủ bằng mã gắn với 1 thiết bị, có hạn sử dụng.
// Mã mới:  <YYYYMMDD hết hạn>.<chữ ký>   — chữ ký (ECDSA P-256) của "DAIDUONG|v2|<mã máy>|<YYYYMMDD>"
// Mã cũ:   <chữ ký>                      — của "DAIDUONG|v1|<mã máy>", không hết hạn (vẫn dùng được)
// App chỉ có khoá công khai (license-key.js) nên không thể tự tạo mã mới.
const ID_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function getDeviceId() {
  let id = store.get('device', '');
  if (!/^[A-HJ-NP-Z2-9]{12}$/.test(id)) {
    const r = crypto.getRandomValues(new Uint8Array(12));
    id = Array.from(r, b => ID_ALPHABET[b % 32]).join('');
    store.set('device', id);
  }
  return id;
}
// iPhone/iPad: trang mở trong Safari và app ở Màn hình chính lưu dữ liệu TÁCH BIỆT, nên mỗi nơi có một Mã máy riêng.
// Để khách không lấy nhầm Mã máy của tab Safari (rồi mất kích hoạt khi cài app), trên iOS chỉ app đã cài mới được lấy Mã máy và kích hoạt.
function isIOS() { return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); }
function isStandalone() { return navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches); }
const needInstall = () => isIOS() && !isStandalone();
const fmtDeviceId = id => id.match(/.{4}/g).join('-');
const fmtDate = ymd => ymd.slice(6, 8) + '/' + ymd.slice(4, 6) + '/' + ymd.slice(0, 4);
const todayYmd = () => { const d = new Date(); return d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0'); };

function b64uToBytes(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(s + '='.repeat((4 - s.length % 4) % 4)), c => c.charCodeAt(0));
}

// Trả về { valid, exp } — exp là 'YYYYMMDD' hoặc null (không hết hạn). Chưa xét hết hạn.
async function checkCode(code, deviceId) {
  try {
    if (!crypto.subtle) return { valid: false };
    const m = code.match(/^(\d{8})\.(.+)$/);
    const exp = m ? m[1] : null, sig = m ? m[2] : code;
    const msg = exp ? `DAIDUONG|v2|${deviceId}|${exp}` : `DAIDUONG|v1|${deviceId}`;
    const key = await crypto.subtle.importKey('jwk', LICENSE_PUBKEY, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
    const valid = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, b64uToBytes(sig), new TextEncoder().encode(msg));
    return { valid, exp };
  } catch (e) { return { valid: false }; }
}

function applyLicense(r) {
  LIC.exp = r.exp || null;
  LIC.expired = !!(r.valid && r.exp && todayYmd() > r.exp);
  LIC.ok = !!r.valid && !LIC.expired;
}

// Kiểm tra giấy phép đã lưu mỗi lần mở trang (mã ngắn kích hoạt qua máy chủ, hoặc mã ký số cũ); các trang chờ licReady trước khi vẽ giao diện
const licReady = (async () => {
  const l2 = store.get('license2', null), has2 = !!(l2 && /^\d{8}$/.test(l2.exp || ''));
  if (has2) applyLicense({ valid: true, exp: l2.exp });
  if (has2 && LIC.ok) return;
  const code = store.get('license', '');
  if (code) {
    const r = await checkCode(code, getDeviceId());
    if (r.valid) { applyLicense(r); if (LIC.ok) return; }
  }
  if (!has2) applyLicense({ valid: false });
})();

// Kích hoạt bằng mã ngắn: hỏi máy chủ (Google Sheet). Máy chủ đếm số máy và tính hạn từ lần kích hoạt đầu.
async function activateByCode(raw) {
  const code = String(raw).toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (code.length !== 8) return { r: 'invalid' };
  if (typeof ACTIVATE_URL === 'undefined' || !ACTIVATE_URL) return { r: 'noserver' };
  let j;
  try { j = await (await fetch(`${ACTIVATE_URL}?action=activate&code=${code}&device=${getDeviceId()}`)).json(); }
  catch (e) { return { r: 'offline' }; }
  if (j && j.ok && /^\d{8}$/.test(j.exp || '')) {
    store.set('license2', { c: code, exp: j.exp });
    applyLicense({ valid: true, exp: j.exp });
    return { r: LIC.ok ? 'ok' : 'expired', exp: j.exp };
  }
  return { r: (j && j.reason) || 'error', exp: j && j.exp };
}
function actMessage(res) {
  return ({
    invalid: '❌ Mã chưa đúng. Bạn kiểm tra lại mã (8 ký tự, dạng XXXX-XXXX) nhé.',
    full: '⚠️ Mã này đã dùng đủ số máy cho phép. Nhắn người bán để được hỗ trợ.',
    expired: '⌛ Mã này đã hết hạn' + (res.exp ? ' (' + fmtDate(res.exp) + ')' : '') + '. Nhắn người bán để lấy mã mới.',
    offline: '📶 Không kết nối được mạng. Bạn bật mạng rồi thử lại nhé.',
    noserver: '⚙️ Chức năng kích hoạt chưa sẵn sàng. Bạn nhắn người bán giúp nhé.'
  })[res.r] || '⚠️ Có lỗi, bạn thử lại sau ít phút nhé.';
}

// Trả về 'ok' | 'expired' (mã đúng nhưng đã quá hạn) | 'invalid' | 'install' (iOS, chưa mở từ app ở Màn hình chính)
async function activateCode(raw) {
  if (needInstall()) return 'install';   // iOS: chỉ kích hoạt trong app đã thêm vào Màn hình chính
  const code = String(raw).replace(/\s+/g, '');
  if (!code) return 'invalid';
  const r = await checkCode(code, getDeviceId());
  if (!r.valid) return 'invalid';
  applyLicense(r);
  if (!LIC.ok) return 'expired';
  store.set('license', code);
  return 'ok';
}
