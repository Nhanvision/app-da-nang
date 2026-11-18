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

// Kiểm tra mã đã lưu mỗi lần mở trang; các trang chờ licReady trước khi vẽ giao diện
const licReady = (async () => {
  const code = store.get('license', '');
  applyLicense(code ? await checkCode(code, getDeviceId()) : { valid: false });
})();

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
