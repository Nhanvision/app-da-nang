'use strict';
// Trợ lý hỏi đáp ở góc dưới bên phải trang giới thiệu.
// Đây là trợ lý TỰ ĐỘNG theo kịch bản (không dùng AI trực tuyến): trả lời đúng theo thông tin trong config.js, miễn phí, không gửi dữ liệu đi đâu.
// Ý nào chưa có sẵn thì mời khách nhắn Zalo.
(function () {
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const zaloDigits = (SHOP.zalo || '').replace(/\D/g, '');
  const zaloUrl = zaloDigits ? 'https://zalo.me/' + zaloDigits : '';
  const GAME = 'index.html';
  const slotsLine = () => {
    const left = window.__slotsLeft;
    if (SHOP.priceOriginal && SHOP.promoNote && typeof left === 'number' && left > 0) return '\n⏳ Hiện còn ' + left + '/' + SHOP.promoTotal + ' suất ưu đãi.';
    return '';
  };
  const promoLive = () => SHOP.priceOriginal && SHOP.promoNote && !(typeof window.__slotsLeft === 'number' && window.__slotsLeft <= 0);
  const priceNow = () => ((window.__slotsLeft === 0 && SHOP.priceOriginal) ? SHOP.priceOriginal : SHOP.price).replace(/\s*\(.*\)\s*$/, '');

  const A = {
    zalo: zaloUrl ? { label: '💬 Nhắn Zalo ' + SHOP.zalo, href: zaloUrl } : null,
    mua: { label: '🛒 Xem cách mua & QR', go: '#mua' },
    choi: { label: '🎮 Chơi thử miễn phí', href: GAME },
    guide: { label: '📖 Hướng dẫn có hình', href: 'huong-dan.html' },
    voice: { label: '🔇 Cách bật giọng đọc', href: 'huong-dan.html#giongdoc' }
  };
  const ask = (id, label) => ({ label, id });

  // Kho kiến thức: keys là các cụm từ khoá (không dấu) để hiểu câu hỏi gõ tự do
  const KB = [
    { id: 'gia', chip: 'Giá bao nhiêu?', keys: ['gia', 'bao nhieu', 'bao nhieu tien', 'phi', 'tien', 'dat', 're', 'khuyen mai', 'uu dai', 'giam gia', 'bao lau', 'thoi han'],
      text: () => 'Bản đầy đủ dùng 1 năm: ' + priceNow() + '.' + (promoLive() ? '\n🔥 ' + SHOP.promoNote + ' ' + SHOP.price.replace(/\s*\(.*\)/, '') + ', sau đó về giá gốc ' + SHOP.priceOriginal + '.' + slotsLine() : '') + '\nBạn có thể chơi thử miễn phí trước khi mua.',
      actions: () => [A.mua, A.choi] },
    { id: 'mua', chip: 'Mua như thế nào?', keys: ['mua', 'thanh toan', 'chuyen khoan', 'qr', 'quet ma', 'dat mua', 'cach mua', 'dang ky', 'mua nhu the nao', 'ngan hang', 'stk'],
      text: () => 'Mua rất đơn giản, 3 bước:\n1) Chơi thử miễn phí để chắc bé thích.\n2) Chuyển khoản bằng mã QR ở phần "Mua bản đầy đủ" (số tiền và nội dung đã điền sẵn, bạn nhập số Zalo của mình vào ô).\n3) Nhắn Zalo kèm ảnh chuyển khoản, mình gửi lại một mã ngắn dạng ABCD-EFGH để kích hoạt.',
      actions: () => [A.mua, A.guide, A.zalo].filter(Boolean) },
    { id: 'thu', chip: 'Bản dùng thử có gì?', keys: ['dung thu', 'choi thu', 'mien phi', 'free', 'thu truoc', 'khac nhau', 'ban day du', 'gioi han'],
      text: () => 'Bản dùng thử miễn phí cho chơi cấp Cơ bản (10 từ), có cả Bé tập nói, Học từ vựng và Bảng điểm.\nBản đầy đủ mở thêm: cấp Trung bình và Nâng cao (hơn 250 từ tất cả), và bố mẹ thêm được từ riêng theo bài ở trường.',
      actions: () => [A.choi] },
    { id: 'kichhoat', chip: 'Nhập mã kích hoạt ở đâu?', keys: ['kich hoat', 'nhap ma', 'ma kich hoat', 'nhap ma o dau', 'ma code', 'code', 'khoa', 'mo khoa', 'o khoa', 'da mua roi'],
      text: () => 'Sau khi nhận mã, bạn mở game rồi bấm 🔑 "Nhập mã kích hoạt" (ở dòng trên menu), hoặc bấm vào cấp độ có ổ khoá. Gõ mã 8 ký tự rồi bấm Kích hoạt.\nLần kích hoạt cần có mạng. Dùng đầy đủ 1 năm tính từ lúc kích hoạt.',
      actions: () => [A.guide, A.choi] },
    { id: 'loima', chip: 'Nhập mã không được?', keys: ['khong nhap duoc', 'ma sai', 'ma khong dung', 'bao loi', 'loi ma', 'ma bi loi', 'khong kich hoat', 'da dung', 'dang dung tren may khac', 'khong vao duoc', 'khong duoc'],
      text: () => 'Bạn thử kiểm tra:\n• Mã gồm 8 ký tự (chữ + số), gõ đúng, không cần phân biệt chữ hoa/thường.\n• Điện thoại đang có mạng.\n• Nếu báo "mã đang dùng trên một máy khác": bạn vừa đổi máy hoặc cài lại app. Nhắn Zalo cho mình, mình chuyển mã sang máy này ngay, không mất thêm phí.',
      actions: () => [A.zalo].filter(Boolean) },
    { id: 'cai', chip: 'Cài vào Màn hình chính', keys: ['man hinh chinh', 'cai app', 'cai dat', 'them vao man hinh', 'icon', 'iphone', 'ipad', 'android', 'ios', 'tai app', 'tai ve', 'app store', 'chplay', 'ung dung'],
      text: () => 'Game là ứng dụng web, không cần tải từ cửa hàng.\n• iPhone/iPad: mở bằng Safari → nút Chia sẻ → "Thêm vào Màn hình chính".\n• Android: mở bằng Chrome → dấu ⋮ → "Cài đặt ứng dụng" (hoặc "Thêm vào màn hình chính").\nSau khi cài, chơi được cả khi không có mạng. Trên iPhone, nếu app hỏi mã lần nữa thì bạn cứ nhập lại đúng mã đó.',
      actions: () => [A.guide, A.choi] },
    { id: 'tuoi', chip: 'Bé mấy tuổi chơi được?', keys: ['tuoi', 'be may tuoi', 'be nho', 'be 4 tuoi', 'be 5 tuoi', 'be 3 tuoi', 'mam non', 'lop 1', 'tieu hoc', 'phu hop', 'doi tuong'],
      text: () => '• 🐣 Bé tập nói: dành cho bé nhỏ (khoảng 4 tuổi). Bé chạm vào con cá, máy đọc to từ tiếng Anh và hiện hình, nghĩa tiếng Việt. Không có điểm số, không bị thua.\n• 🎮 Chơi game: bé đọc nghĩa rồi bấm nhanh vào cá đúng từ. Hợp bé đã nhận được mặt chữ, có thể có bố mẹ ngồi cùng.\n• Cấp Cơ bản có hình minh hoạ, cá bơi chậm hơn.',
      actions: () => [A.choi] },
    { id: 'themtu', chip: 'Thêm từ riêng của bé', keys: ['them tu', 'tu rieng', 'tu moi', 'bai o truong', 'nhap tu', 'tu vung rieng', 'tuy chinh', 'sua tu', 'bo me them', 'pin'],
      text: () => 'Bản đầy đủ cho bố mẹ thêm từ theo bài ở trường: cuối menu game bấm "⚙️ Dành cho bố mẹ", đặt mã PIN (để bé không vào sửa được), rồi nhập mỗi dòng một từ, ví dụ:\nbutterfly - con bướm 🦋\nHình emoji ở cuối dòng là tuỳ chọn. Có thể xuất/nhập file để chuyển sang máy khác.',
      actions: () => [A.guide] },
    { id: 'tu', chip: 'Có bao nhiêu từ?', keys: ['bao nhieu tu', 'so tu', 'cap do', 'noi dung', 'tu vung', 'chu de', 'co hinh', 'phat am', 'doc to', 'giong doc', 'giong', 'tieng anh'],
      text: () => 'Có 3 cấp độ, hơn 250 từ: Cơ bản (90 từ, có hình), Trung bình (86 từ) và Nâng cao (81 từ), cấp càng cao từ càng khó.\nCó thẻ học để bé nghe và xem nghĩa trước khi chơi, và chế độ ôn lại các từ bé hay sai. Giọng đọc dùng giọng của điện thoại (có tuỳ chọn đọc chậm cho Bé tập nói), nên giọng có thể khác nhau tuỳ máy.' },
    { id: 'may', chip: 'Dùng được trên mấy máy?', keys: ['2 dien thoai', 'hai dien thoai', 'nhieu dien thoai', 'doi dien thoai', 'dien thoai moi', 'may', 'thiet bi', 'may tinh bang', 'nhieu may', '2 may', 'hai may', 'may tinh', 'nhieu dien thoai', 'chia se', 'cho muon', 'nha co', 'ca nha', 'bo me deu'],
      text: () => 'Mỗi mã dùng cho 1 thiết bị. Nhà có 2 điện thoại thì nhắn Zalo, mình có loại mã dùng được cho 2 máy (cùng mức giá).\nĐổi điện thoại hoặc xoá app cài lại: nhắn Zalo, mình chuyển mã sang máy mới, không mất thêm phí.',
      actions: () => [A.zalo].filter(Boolean) },
    { id: 'hethan', chip: 'Hết 1 năm thì sao?', keys: ['het han', 'gia han', 'het nam', 'qua han', '1 nam', 'mot nam', 'tron doi', 'vinh vien', 'mat phi'],
      text: () => 'Hết 1 năm game tự quay về bản dùng thử, các từ riêng bạn đã nhập vẫn được giữ. Bạn nhắn Zalo để gia hạn và nhận mã mới, nhập mã là dùng tiếp.',
      actions: () => [A.zalo].filter(Boolean) },
    { id: 'offline', chip: 'Không có mạng chơi được không?', keys: ['offline', 'khong co mang', 'mat mang', 'wifi', '3g', '4g', 'internet', 'mang'],
      text: () => 'Được. Chỉ cần mạng khi mở game lần đầu và khi nhập mã kích hoạt. Sau đó game chơi được cả khi không có mạng (nên cài vào Màn hình chính cho tiện).' },
    { id: 'riengtu', chip: 'Dữ liệu của bé có an toàn không?', keys: ['an toan', 'bao mat', 'du lieu', 'quang cao', 'thong tin ca nhan', 'rieng tu', 'luu o dau', 'thu thap'],
      text: () => 'Game không có quảng cáo và không thu thập thông tin của bé. Điểm số, từ riêng, mã PIN đều chỉ lưu ngay trên thiết bị của bạn.' },
    { id: 'hoantien', chip: 'Chính sách hoàn tiền?', keys: ['hoan tien', 'tra lai', 'doi tra', 'bao hanh', 'chinh sach', 'khong thich', 'tra tien'],
      text: () => 'Phần này mình chưa có sẵn quy định để trả lời chính xác. Bạn nhắn Zalo để chủ shop trao đổi trực tiếp nhé. Bạn cũng nên chơi thử miễn phí trước khi mua.',
      actions: () => [A.zalo, A.choi].filter(Boolean) },
    { id: 'huongdan', chip: 'Hướng dẫn có hình', keys: ['huong dan', 'cach dung', 'cach su dung', 'su dung', 'dung nhu the nao', 'tai lieu', 'xem hinh', 'chi dan', 'tutorial'],
      text: () => 'Mình có trang hướng dẫn từng bước kèm hình minh hoạ: mua, nhập mã, cài vào Màn hình chính, cho bé chơi, bố mẹ thêm từ riêng. Bạn mở xem nhé.',
      actions: () => [A.guide] },
    { id: 'khongtieng', chip: 'Không nghe thấy tiếng?', keys: ['khong nghe', 'khong co tieng', 'mat tieng', 'khong doc', 'khong phat am', 'am thanh', 'loa', 'im lang', 'khong ra tieng', 'khong noi', 'cham ca khong'],
      text: () => 'Bạn thử: tăng âm lượng (iPhone nhớ tắt chế độ im lặng), tick ô "🔊 Đọc to từ tiếng Anh" ở menu game.\nTrên một số điện thoại Android chưa có giọng đọc tiếng Anh: vào Cài đặt → Ngôn ngữ và nhập liệu → Đầu ra chuyển văn bản thành giọng nói → Google → tải giọng Tiếng Anh. Game cũng tự báo ở menu nếu máy thiếu giọng.',
      actions: () => [A.voice, A.zalo].filter(Boolean) },
    { id: 'lienhe', chip: 'Liên hệ chủ shop', keys: ['lien he', 'zalo', 'so dien thoai', 'sdt', 'goi', 'nhan tin', 'ho tro', 'giup do', 'nguoi that', 'chu shop', 'tu van'],
      text: () => 'Bạn nhắn Zalo ' + (SHOP.zalo || '') + ' để được hỗ trợ trực tiếp nhé.',
      actions: () => [A.zalo].filter(Boolean) },
    { id: 'chao', chip: null, keys: ['xin chao', 'chao', 'hello', 'hi', 'alo', 'cam on', 'thanks', 'ok'],
      text: () => 'Chào bạn! Mình là trợ lý tự động của Đại Dương Từ Vựng. Bạn cứ bấm một câu hỏi bên dưới hoặc gõ câu hỏi của bạn nhé.' }
  ];
  const byId = id => KB.find(e => e.id === id);

  function match(q) {
    const n = ' ' + norm(q) + ' ';
    let best = null, score = 0;
    for (const e of KB) {
      let s = 0;
      for (const k of e.keys) {
        const nk = ' ' + norm(k) + ' ';
        if (n.includes(nk)) s += nk.trim().split(' ').length * 2 + nk.trim().length / 10;
      }
      if (s > score) { score = s; best = e; }
    }
    return score >= 2 ? best : null;
  }

  // ---------- Giao diện ----------
  const css = document.createElement('style');
  css.textContent = `
  .ast-fab{position:fixed;right:16px;bottom:16px;z-index:60;display:flex;align-items:center;gap:8px;border:0;border-radius:32px;padding:12px 18px 12px 14px;background:#0a6ebd;color:#fff;font:800 16px system-ui,sans-serif;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.3)}
  .ast-fab img{width:30px;height:30px;border-radius:9px;background:#fff}
  .ast-panel{position:fixed;right:16px;bottom:86px;z-index:61;width:min(380px,calc(100vw - 24px));max-height:min(620px,calc(100vh - 110px));display:none;flex-direction:column;background:#fff;border-radius:20px;box-shadow:0 12px 40px rgba(0,0,0,.35);overflow:hidden;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#0a4a82}
  .ast-panel.open{display:flex}
  .ast-head{background:#0a6ebd;color:#fff;padding:12px 14px;display:flex;align-items:center;gap:10px}
  .ast-head b{font-size:16px;display:block}.ast-head small{opacity:.85;font-size:12px}
  .ast-head button{margin-left:auto;border:0;background:rgba(255,255,255,.2);color:#fff;width:32px;height:32px;border-radius:50%;font-size:18px;cursor:pointer}
  .ast-msgs{flex:1;overflow:auto;padding:12px;background:#f3f8fd;display:flex;flex-direction:column;gap:8px}
  .ast-m{max-width:88%;padding:9px 12px;border-radius:16px;font-size:15px;line-height:1.45;white-space:pre-wrap;word-wrap:break-word}
  .ast-m.bot{background:#fff;border:1px solid #d8e9f6;align-self:flex-start;border-bottom-left-radius:4px}
  .ast-m.me{background:#0a6ebd;color:#fff;align-self:flex-end;border-bottom-right-radius:4px}
  .ast-acts{display:flex;flex-wrap:wrap;gap:6px;align-self:flex-start}
  .ast-acts a,.ast-acts button,.ast-chips button{font:700 13px system-ui,sans-serif;border:2px solid #0a6ebd;background:#fff;color:#0a6ebd;border-radius:16px;padding:6px 11px;cursor:pointer;text-decoration:none}
  .ast-acts .z{background:#ffb300;border-color:#ffb300;color:#4a2b00}
  .ast-chips{padding:8px 10px;display:flex;gap:6px;overflow-x:auto;border-top:1px solid #e1eefa;background:#fff;flex-wrap:nowrap}
  .ast-chips button{white-space:nowrap;flex:0 0 auto}
  .ast-form{display:flex;gap:6px;padding:8px 10px 10px;background:#fff;border-top:1px solid #e1eefa}
  .ast-form input{flex:1;min-width:0;font:inherit;font-size:15px;padding:9px 12px;border:2px solid #9ec5e6;border-radius:20px;color:#0a4a82}
  .ast-form button{border:0;background:#0a6ebd;color:#fff;border-radius:20px;padding:0 16px;font:800 15px system-ui,sans-serif;cursor:pointer}
  .ast-dots{align-self:flex-start;background:#fff;border:1px solid #d8e9f6;border-radius:16px;padding:8px 14px;color:#7aa7c9;letter-spacing:3px}
  @media(max-width:480px){.ast-fab span{display:none}.ast-fab{padding:12px}}`;
  document.head.appendChild(css);

  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const fab = el('button', 'ast-fab'); fab.setAttribute('aria-label', 'Mở trợ lý hỏi đáp');
  const ic = document.createElement('img'); ic.src = 'icon-192.png'; ic.alt = ''; fab.append(ic, el('span', '', 'Hỏi trợ lý'));
  const panel = el('div', 'ast-panel'); panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Trợ lý Đại Dương Từ Vựng');
  const head = el('div', 'ast-head'); const ht = el('div'); ht.append(el('b', '', 'Trợ lý Đại Dương'), el('small', '', 'Trợ lý tự động · trả lời ngay'));
  const close = el('button', '', '✕'); close.setAttribute('aria-label', 'Đóng'); head.append(ht, close);
  const msgs = el('div', 'ast-msgs'); msgs.setAttribute('aria-live', 'polite');
  const chips = el('div', 'ast-chips');
  const form = el('form', 'ast-form'); const input = el('input'); input.placeholder = 'Gõ câu hỏi của bạn…'; input.setAttribute('aria-label', 'Câu hỏi'); input.maxLength = 200; input.autocomplete = 'off';
  const send = el('button', '', 'Gửi'); send.type = 'submit'; form.append(input, send);
  panel.append(head, msgs, chips, form);
  document.body.append(fab, panel);

  function scroll() { msgs.scrollTop = msgs.scrollHeight; }
  function say(text, who) { msgs.append(el('div', 'ast-m ' + who, text)); scroll(); }
  function actions(list) {
    if (!list || !list.length) return;
    const box = el('div', 'ast-acts');
    list.forEach(a => {
      let n;
      if (a.href) { n = el('a', a.href.startsWith('http') ? 'z' : '', a.label); n.href = a.href; if (a.href.startsWith('http')) { n.target = '_blank'; n.rel = 'noopener'; } }
      else { n = el('button', '', a.label); n.type = 'button'; n.onclick = () => { if (a.go) { panel.classList.remove('open'); const t = document.querySelector(a.go); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); } else if (a.id) answer(a.id, a.label); }; }
      box.append(n);
    });
    msgs.append(box); scroll();
  }
  function answer(id, asText) {
    if (asText) say(asText, 'me');
    const e = byId(id);
    const dots = el('div', 'ast-dots', '•••'); msgs.append(dots); scroll();
    setTimeout(() => { dots.remove(); say(e.text(), 'bot'); actions(e.actions ? e.actions() : null); }, 350);
  }
  function fallback() {
    const dots = el('div', 'ast-dots', '•••'); msgs.append(dots); scroll();
    setTimeout(() => {
      dots.remove();
      say('Mình chưa hiểu rõ câu này. Bạn bấm một gợi ý bên dưới, hoặc nhắn Zalo để chủ shop trả lời trực tiếp nhé.', 'bot');
      actions([A.zalo, ask('gia', 'Giá bao nhiêu?'), ask('mua', 'Mua như thế nào?')].filter(Boolean));
    }, 350);
  }
  KB.filter(e => e.chip).forEach(e => { const b = el('button', '', e.chip); b.type = 'button'; b.onclick = () => answer(e.id, e.chip); chips.append(b); });
  form.onsubmit = ev => {
    ev.preventDefault();
    const q = input.value.trim(); if (!q) return;
    input.value = ''; say(q, 'me');
    const e = match(q);
    if (e) answer(e.id); else fallback();
  };
  let greeted = false;
  function open() {
    panel.classList.add('open'); fab.setAttribute('aria-expanded', 'true');
    if (!greeted) { greeted = true; say('Chào bạn! 👋 Mình là trợ lý tự động của Đại Dương Từ Vựng. Bạn muốn biết điều gì: giá, cách mua, cách dùng cho bé… cứ bấm gợi ý bên dưới hoặc gõ câu hỏi nhé.', 'bot'); }
    setTimeout(() => input.focus(), 50);
  }
  fab.onclick = () => panel.classList.contains('open') ? panel.classList.remove('open') : open();
  close.onclick = () => panel.classList.remove('open');
  document.addEventListener('keydown', e => { if (e.key === 'Escape') panel.classList.remove('open'); });
  window.__assistant = { match, KB, open };   // để kiểm thử
})();
