'use strict';
// Kích hoạt bản đầy đủ bằng mã gắn với 1 thiết bị.
// Mã = chữ ký số (ECDSA P-256) của "DAIDUONG|v1|<mã máy>", ký bằng khoá bí mật của người bán.
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
const fmtDeviceId = id => id.match(/.{4}/g).join('-');

function b64uToBytes(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(s + '='.repeat((4 - s.length % 4) % 4)), c => c.charCodeAt(0));
}

async function verifyCode(code, deviceId) {
  try {
    if (!crypto.subtle) return false;
    const key = await crypto.subtle.importKey('jwk', LICENSE_PUBKEY, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
    return await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, b64uToBytes(code),
      new TextEncoder().encode('DAIDUONG|v1|' + deviceId));
  } catch (e) { return false; }
}

// Kiểm tra mã đã lưu mỗi lần mở trang; các trang chờ licReady trước khi vẽ giao diện
const licReady = (async () => {
  const code = store.get('license', '');
  LIC.ok = !!code && await verifyCode(code, getDeviceId());
})();

async function activateCode(raw) {
  const code = String(raw).replace(/\s+/g, '');
  if (!code || !(await verifyCode(code, getDeviceId()))) return false;
  store.set('license', code);
  LIC.ok = true;
  return true;
}
