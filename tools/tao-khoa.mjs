// Tạo cặp khoá ký mã kích hoạt (ECDSA P-256).
//   node tools/tao-khoa.mjs <đường-dẫn-file-khoá-bí-mật>
// - Khoá bí mật ghi ra file đó (ĐỂ NGOÀI repo, sao lưu cẩn thận, không đưa cho ai).
// - Khoá công khai ghi vào game/license-key.js (được phép commit).
import { webcrypto as crypto } from 'node:crypto';
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const out = process.argv[2];
if (!out) { console.error('Thiếu đường dẫn file khoá bí mật.'); process.exit(1); }
const priv = resolve(out);
if (existsSync(priv)) { console.error('File đã tồn tại, không ghi đè: ' + priv); process.exit(1); }
const kp = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
const privJwk = await crypto.subtle.exportKey('jwk', kp.privateKey);
const pubJwk = await crypto.subtle.exportKey('jwk', kp.publicKey);
mkdirSync(dirname(priv), { recursive: true });
writeFileSync(priv, JSON.stringify(privJwk, null, 2));
const pub = { kty: pubJwk.kty, crv: pubJwk.crv, x: pubJwk.x, y: pubJwk.y };
writeFileSync(resolve('game/license-key.js'),
  '// Khoá CÔNG KHAI để kiểm tra mã kích hoạt (không phải bí mật).\nconst LICENSE_PUBKEY = ' + JSON.stringify(pub) + ';\n');
console.log('Đã tạo khoá bí mật: ' + priv);
console.log('Đã ghi khoá công khai: game/license-key.js');
