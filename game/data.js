'use strict';
// Từ vựng: [tiếng Anh, nghĩa tiếng Việt, emoji]
const WORDS = {
  basic: [
    ['cat','con mèo','🐱'],['dog','con chó','🐶'],['fish','con cá','🐟'],['bird','con chim','🐦'],['apple','quả táo','🍎'],
    ['banana','quả chuối','🍌'],['milk','sữa','🥛'],['bread','bánh mì','🍞'],['sun','mặt trời','☀️'],['moon','mặt trăng','🌙'],
    ['star','ngôi sao','⭐'],['tree','cái cây','🌳'],['flower','bông hoa','🌸'],['car','xe hơi','🚗'],['bus','xe buýt','🚌'],
    ['book','quyển sách','📖'],['pen','cái bút','🖊️'],['house','ngôi nhà','🏠'],['water','nước','💧'],['red','màu đỏ','🔴'],
    ['blue','màu xanh dương','🔵'],['happy','vui vẻ','😊'],['big','to, lớn','🐘'],['small','nhỏ bé','🐜'],['hand','bàn tay','✋'],
    ['eye','con mắt','👁️'],['rain','mưa','🌧️'],['ball','quả bóng','⚽'],['egg','quả trứng','🥚'],['hat','cái mũ','🎩']
  ],
  mid: [
    ['teacher','giáo viên'],['doctor','bác sĩ'],['kitchen','nhà bếp'],['bedroom','phòng ngủ'],['breakfast','bữa sáng'],
    ['weather','thời tiết'],['holiday','kỳ nghỉ'],['library','thư viện'],['hospital','bệnh viện'],['market','chợ'],
    ['beautiful','xinh đẹp'],['dangerous','nguy hiểm'],['expensive','đắt tiền'],['delicious','ngon'],['tired','mệt mỏi'],
    ['travel','du lịch'],['borrow','mượn'],['forget','quên'],['believe','tin tưởng'],['choose','lựa chọn'],
    ['mountain','ngọn núi'],['island','hòn đảo'],['neighbor','hàng xóm'],['vegetable','rau củ'],['umbrella','cái ô'],
    ['visit','thăm viếng'],['early','sớm'],['strong','mạnh mẽ'],['quiet','yên tĩnh'],['journey','chuyến đi']
  ],
  adv: [
    ['accomplish','hoàn thành, đạt được'],['advantage','lợi thế'],['environment','môi trường'],['necessary','cần thiết'],['achievement','thành tựu'],
    ['opportunity','cơ hội'],['responsible','có trách nhiệm'],['communicate','giao tiếp'],['independent','độc lập'],['knowledge','kiến thức'],
    ['experience','kinh nghiệm'],['reluctant','miễn cưỡng'],['generous','hào phóng'],['curious','tò mò'],['ambitious','đầy tham vọng'],
    ['encourage','khuyến khích'],['improve','cải thiện'],['prevent','ngăn ngừa'],['deliver','giao hàng, phát biểu'],['organize','tổ chức'],
    ['pollution','sự ô nhiễm'],['culture','văn hoá'],['guarantee','đảm bảo'],['competition','cuộc thi'],['temperature','nhiệt độ'],
    ['argument','cuộc tranh luận'],['disappear','biến mất'],['neglect','bỏ bê'],['reliable','đáng tin cậy'],['inevitable','không thể tránh khỏi']
  ]
};

// speed: px/giây, fish: số cá cùng lúc
const LEVELS = {
  basic: { name: 'Cơ bản', speed: 60, fish: 5 },
  mid:   { name: 'Trung bình', speed: 100, fish: 6 },
  adv:   { name: 'Nâng cao', speed: 140, fish: 7 }
};
const MIN_WORDS = 4;
const $ = id => document.getElementById(id);

const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem('oceanvocab-' + k)) ?? d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('oceanvocab-' + k, JSON.stringify(v)); } catch (e) { alert('Không lưu được dữ liệu trên trình duyệt này.'); } }
};
const getCustom = () => Object.assign({ basic: [], mid: [], adv: [] }, store.get('custom', {}));
const getOnly = () => Object.assign({ basic: false, mid: false, adv: false }, store.get('only', {}));
function getPool(lvl) {
  const custom = getCustom()[lvl], seen = new Set(), out = [];
  for (const w of (getOnly()[lvl] ? custom : [...custom, ...WORDS[lvl]])) {
    const k = w[0].toLowerCase();
    if (!seen.has(k)) { seen.add(k); out.push(w); }
  }
  return out;
}
// "english - nghĩa" mỗi dòng; chấp nhận - – = | : hoặc tab
function parseWords(text) {
  const ok = [], bad = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(/^(.+?)\s*(?:\t|\s[-–—]\s|[-–—=|:])\s*(.+)$/);
    if (m && /[A-Za-z]/.test(m[1])) ok.push([m[1].trim(), m[2].trim()]); else bad.push(line);
  }
  return { ok, bad };
}
