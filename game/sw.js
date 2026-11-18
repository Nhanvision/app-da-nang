const CACHE = 'daiduong-v16';
const FILES = ['./', 'index.html', 'admin.html', 'style.css', 'admin.css', 'data.js', 'app.js', 'admin.js', 'config.js', 'gioi-thieu.html', 'huong-dan.html', 'img/01-menu-dung-thu.webp', 'img/02-nhap-ma.webp', 'img/03-da-kich-hoat.webp', 'img/04-be-tap-noi.webp', 'img/05-choi-game.webp', 'img/06-hoc-tu.webp', 'img/07-bo-me.webp', 'landing.css', 'assistant.js', 'license.js', 'license-key.js',
  'manifest.json', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
// Ưu tiên mạng (luôn có bản mới nhất), mất mạng thì dùng bản đã lưu
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(r => {
    const copy = r.clone();
    caches.open(CACHE).then(c => c.put(e.request, copy));
    return r;
  }).catch(() => caches.match(e.request)));
});
