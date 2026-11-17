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

// ---- Bộ từ mở rộng (thêm sau 30 từ đầu; 10 từ đầu của Cơ bản dành cho bản dùng thử) ----
WORDS.basic.push(
  ['lion','sư tử','🦁'],['tiger','con hổ','🐯'],['elephant','con voi','🐘'],['monkey','con khỉ','🐵'],['rabbit','con thỏ','🐰'],
  ['horse','con ngựa','🐴'],['cow','con bò','🐮'],['pig','con heo','🐷'],['duck','con vịt','🦆'],['chicken','con gà','🐔'],
  ['frog','con ếch','🐸'],['snake','con rắn','🐍'],['bear','con gấu','🐻'],['turtle','con rùa','🐢'],['butterfly','con bướm','🦋'],
  ['bee','con ong','🐝'],['whale','cá voi','🐳'],['shark','cá mập','🦈'],['crab','con cua','🦀'],['orange','quả cam','🍊'],
  ['grape','quả nho','🍇'],['strawberry','quả dâu tây','🍓'],['watermelon','dưa hấu','🍉'],['pineapple','quả dứa','🍍'],['carrot','cà rốt','🥕'],
  ['tomato','cà chua','🍅'],['potato','khoai tây','🥔'],['rice','cơm, gạo','🍚'],['cake','bánh ngọt','🍰'],['pizza','bánh pizza','🍕'],
  ['coffee','cà phê','☕'],['ice cream','kem','🍦'],['cheese','phô mai','🧀'],['green','màu xanh lá','🟢'],['yellow','màu vàng','🟡'],
  ['black','màu đen','⚫'],['white','màu trắng','⚪'],['heart','trái tim','❤️'],['bed','cái giường','🛏️'],['chair','cái ghế','🪑'],
  ['door','cánh cửa','🚪'],['clock','đồng hồ','🕒'],['phone','điện thoại','📱'],['key','chìa khoá','🔑'],['bag','cái cặp','🎒'],
  ['shoe','chiếc giày','👟'],['shirt','cái áo','👕'],['glasses','kính mắt','👓'],['fire','ngọn lửa','🔥'],['snow','tuyết','❄️'],
  ['cloud','đám mây','☁️'],['boat','con thuyền','⛵'],['train','tàu hoả','🚆'],['plane','máy bay','✈️'],['bike','xe đạp','🚲'],
  ['school','trường học','🏫'],['music','âm nhạc','🎵'],['sad','buồn','😢'],['angry','giận dữ','😠'],['sleep','ngủ','😴']
);
WORDS.mid.push(
  ['morning','buổi sáng'],['evening','buổi tối'],['weekend','cuối tuần'],['airport','sân bay'],['station','nhà ga'],
  ['restaurant','nhà hàng'],['supermarket','siêu thị'],['bakery','tiệm bánh'],['museum','bảo tàng'],['farmer','nông dân'],
  ['engineer','kỹ sư'],['nurse','y tá'],['dentist','nha sĩ'],['pilot','phi công'],['police','cảnh sát'],
  ['customer','khách hàng'],['passenger','hành khách'],['dictionary','từ điển'],['newspaper','tờ báo'],['message','tin nhắn'],
  ['address','địa chỉ'],['password','mật khẩu'],['question','câu hỏi'],['answer','câu trả lời'],['problem','vấn đề'],
  ['solution','giải pháp'],['accident','tai nạn'],['exercise','bài tập, tập thể dục'],['health','sức khoẻ'],['medicine','thuốc'],
  ['headache','đau đầu'],['hungry','đói'],['thirsty','khát nước'],['nervous','lo lắng'],
  ['excited','hào hứng'],['careful','cẩn thận'],['popular','phổ biến'],['ancient','cổ xưa'],['modern','hiện đại'],
  ['narrow','hẹp'],['heavy','nặng'],['invite','mời'],['arrive','đến nơi'],['decide','quyết định'],
  ['receive','nhận được'],['explain','giải thích'],['remember','nhớ'],['repeat','lặp lại'],['practice','luyện tập'],
  ['describe','mô tả'],['suddenly','đột nhiên'],['usually','thường xuyên'],['finally','cuối cùng'],['together','cùng nhau'],
  ['perhaps','có lẽ'],['between','ở giữa']
);
WORDS.adv.push(
  ['abandon','từ bỏ'],['absorb','hấp thụ'],['abundant','dồi dào'],['accurate','chính xác'],['acquire','thu được'],
  ['adapt','thích nghi'],['adequate','đầy đủ, thích đáng'],['ambiguous','mơ hồ'],['anticipate','dự đoán, mong đợi'],['apparent','rõ ràng'],
  ['appreciate','trân trọng'],['arrogant','kiêu ngạo'],['authentic','chính hiệu, xác thực'],['benefit','lợi ích'],['bias','sự thiên vị'],
  ['capable','có khả năng'],['cautious','thận trọng'],['circumstance','hoàn cảnh'],['coincidence','sự trùng hợp'],['collaborate','cộng tác'],
  ['compassion','lòng trắc ẩn'],['complicated','phức tạp'],['consequence','hậu quả'],['controversy','sự tranh cãi'],['convenient','thuận tiện'],
  ['courage','lòng can đảm'],['criticize','chỉ trích'],['deadline','hạn chót'],['determine','xác định'],['dilemma','tình thế khó xử'],
  ['diverse','đa dạng'],['efficient','hiệu quả'],['eliminate','loại bỏ'],['emphasize','nhấn mạnh'],['endure','chịu đựng'],
  ['enormous','khổng lồ'],['essential','thiết yếu'],['evaluate','đánh giá'],['evidence','bằng chứng'],['exaggerate','phóng đại'],
  ['fundamental','cơ bản, nền tảng'],['hesitate','do dự'],['humble','khiêm tốn'],['immediate','ngay lập tức'],['impatient','thiếu kiên nhẫn'],
  ['inspire','truyền cảm hứng'],['obstacle','trở ngại'],['persuade','thuyết phục'],['priority','sự ưu tiên'],['sufficient','đủ'],
  ['vulnerable','dễ bị tổn thương']
);

// speed: px/giây, fish: số cá cùng lúc. Cơ bản bơi chậm cho bé nhỏ; Trung bình và Nâng cao bơi cùng tốc độ, khó hơn ở từ vựng.
const LEVELS = {
  basic: { name: 'Cơ bản', speed: 50, fish: 6 },
  mid:   { name: 'Trung bình', speed: 80, fish: 6 },
  adv:   { name: 'Nâng cao', speed: 80, fish: 6 }
};
const MIN_WORDS = 4, TRIAL_WORDS = 10;
const LIC = { ok: false };   // true khi đã kích hoạt (xem license.js)
const $ = id => document.getElementById(id);

const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem('oceanvocab-' + k)) ?? d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('oceanvocab-' + k, JSON.stringify(v)); } catch (e) { alert('Không lưu được dữ liệu trên trình duyệt này.'); } }
};
const getCustom = () => Object.assign({ basic: [], mid: [], adv: [] }, store.get('custom', {}));
const getOnly = () => Object.assign({ basic: false, mid: false, adv: false }, store.get('only', {}));
function getPool(lvl) {
  // Bản dùng thử: chỉ cấp Cơ bản với TRIAL_WORDS từ mặc định, không dùng từ riêng
  if (!LIC.ok) return lvl === 'basic' ? WORDS.basic.slice(0, TRIAL_WORDS) : [];
  const custom = getCustom()[lvl], seen = new Set(), out = [];
  for (const w of (getOnly()[lvl] ? custom : [...custom, ...WORDS[lvl]])) {
    const k = w[0].toLowerCase();
    if (!seen.has(k)) { seen.add(k); out.push(w); }
  }
  return out;
}
// "english - nghĩa" mỗi dòng; chấp nhận - – = | : hoặc tab
// Số từ của một cấp: tổng đang dùng được và số từ do bố mẹ thêm (không tính từ trùng từ mặc định)
function wordCounts(lvl) {
  const pool = getPool(lvl);
  if (!LIC.ok) return { total: pool.length, added: 0, full: WORDS[lvl].length };
  const base = new Set(WORDS[lvl].map(w => w[0].toLowerCase()));
  return { total: pool.length, added: pool.filter(w => !base.has(w[0].toLowerCase())).length, full: WORDS[lvl].length };
}
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

// ---- Bảng điểm cao (lưu trên thiết bị, top 10 mỗi cấp) ----
const BOARD_SIZE = 10;
const getBoard = () => Object.assign({ basic: [], mid: [], adv: [] }, store.get('board', {}));
const qualifies = (lvl, score) => score > 0 && (getBoard()[lvl].length < BOARD_SIZE || score > getBoard()[lvl][BOARD_SIZE - 1].s);
function addScore(lvl, name, score) {
  const b = getBoard();
  b[lvl].push({ n: String(name).trim().slice(0, 14) || 'Bé', s: score, d: new Date().toISOString().slice(0, 10) });
  b[lvl].sort((x, y) => y.s - x.s);
  b[lvl] = b[lvl].slice(0, BOARD_SIZE);
  store.set('board', b);
  store.set('lastName', b[lvl].find(e => e.s === score).n);
}
