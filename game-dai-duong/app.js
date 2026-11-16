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
const ROUND = 10, LIVES = 3;
const COLORS = ['#e8590c','#2b8a3e','#7048e8','#d6336c','#1971c2','#f08c00','#0ca678','#c2255c'];

const $ = id => document.getElementById(id);
const layer = $('fishLayer');
let st = null;        // trạng thái ván chơi
let rafId = 0, lastT = 0;

// ---------- tiện ích ----------
const rand = (a, b) => a + Math.random() * (b - a);
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const bestKey = l => 'oceanvocab-best-' + l;
function loadBest(l) { try { return +localStorage.getItem(bestKey(l)) || 0; } catch (e) { return 0; } }
function saveBest(l, v) { try { localStorage.setItem(bestKey(l), v); } catch (e) {} }

function speak(text) {
  if (!$('optSound').checked || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US'; u.rate = 0.85;
  speechSynthesis.speak(u);
}

// ---------- bong bóng nền ----------
setInterval(() => {
  const b = document.createElement('div');
  const s = rand(8, 26);
  b.className = 'bub';
  b.style.cssText = `left:${rand(0, 100)}%;width:${s}px;height:${s}px;animation-duration:${rand(6, 12)}s`;
  $('bubbles').appendChild(b);
  setTimeout(() => b.remove(), 12500);
}, 700);

// ---------- menu ----------
function refreshMenu() {
  for (const l in LEVELS) {
    const b = loadBest(l);
    $('best-' + l).textContent = b ? '🏆 Điểm cao nhất: ' + b : 'Chưa chơi';
  }
}
function showMenu() {
  stopLoop(); clearFish();
  $('menu').hidden = false; $('result').hidden = true; $('hud').hidden = true;
  refreshMenu();
}
document.querySelectorAll('.lvl').forEach(b => b.onclick = () => startGame(b.dataset.lvl));
$('btnQuit').onclick = showMenu;
$('btnMenu').onclick = showMenu;
$('btnAgain').onclick = () => startGame(st.lvl);

// ---------- ván chơi ----------
function startGame(lvl) {
  stopLoop(); clearFish();
  const pool = shuffle(WORDS[lvl]);
  st = {
    lvl, cfg: LEVELS[lvl], pool, queue: pool.slice(0, ROUND),
    idx: 0, score: 0, lives: LIVES, combo: 0, wrong: [],
    fish: [], target: null, askedAt: 0, missedThis: false, locked: false
  };
  $('menu').hidden = true; $('result').hidden = true; $('hud').hidden = false;
  nextWord();
  lastT = performance.now();
  rafId = requestAnimationFrame(loop);
}

function updateHud() {
  $('hearts').textContent = '❤️'.repeat(st.lives) + '🖤'.repeat(LIVES - st.lives);
  $('score').textContent = st.score;
  $('progress').textContent = Math.min(st.idx + 1, ROUND) + '/' + ROUND;
}

function nextWord() {
  if (st.idx >= ROUND) return endGame(true);
  st.target = st.queue[st.idx];
  st.askedAt = performance.now();
  st.missedThis = false; st.locked = false;
  $('pEmoji').textContent = st.target[2] || '';
  $('pText').textContent = st.target[1];
  clearFish();
  // 1 cá đúng + các cá nhiễu cùng cấp độ
  const distract = shuffle(st.pool.filter(w => w !== st.target)).slice(0, st.cfg.fish - 1);
  const words = shuffle([st.target, ...distract]);
  words.forEach((w, i) => spawnFish(w, i, words.length));
  updateHud();
}

function clearFish() { layer.innerHTML = ''; if (st) st.fish = []; }

function spawnFish(w, i, n) {
  const el = document.createElement('div');
  const dir = Math.random() < 0.5 ? 1 : -1;       // 1: bơi sang phải
  el.className = 'fish ' + (dir > 0 ? 'right' : 'left');
  const body = document.createElement('div');
  body.className = 'body';
  body.textContent = w[0];
  const color = COLORS[(Math.random() * COLORS.length) | 0];
  body.style.setProperty('--c', color);
  el.appendChild(body);
  layer.appendChild(el);

  const W = layer.clientWidth, H = layer.clientHeight;
  const top = 90, bottom = 90;
  const laneH = (H - top - bottom) / n;
  const f = {
    el, word: w, dir,
    w: el.offsetWidth, h: el.offsetHeight,
    x: rand(0, Math.max(10, W - 140)),
    baseY: top + laneH * i + laneH / 2 - el.offsetHeight / 2,
    amp: rand(6, 18), ph: rand(0, 6.28),
    v: st.cfg.speed * rand(0.8, 1.25)
  };
  el.onclick = () => onPick(f);
  st.fish.push(f);
  place(f, 0);
}

function place(f, t) {
  const y = f.baseY + Math.sin(t * 1.6 + f.ph) * f.amp;
  f.el.style.transform = `translate(${f.x}px,${y}px)`;
}

function loop(now) {
  const dt = Math.min(0.05, (now - lastT) / 1000);
  lastT = now;
  const W = layer.clientWidth;
  for (const f of st.fish) {
    if (f.dead) continue;
    f.x += f.dir * f.v * dt;
    if (f.dir > 0 && f.x > W + 20) f.x = -f.w - 20;
    if (f.dir < 0 && f.x < -f.w - 20) f.x = W + 20;
    place(f, now / 1000);
    if (f.word === st.target) f.el.classList.toggle('hint', now - st.askedAt > 12000 && !st.locked);
  }
  rafId = requestAnimationFrame(loop);
}
function stopLoop() { cancelAnimationFrame(rafId); rafId = 0; }

function onPick(f) {
  if (st.locked || f.dead) return;
  if (f.word === st.target) {
    st.locked = true; f.dead = true;
    st.combo++;
    st.score += 10 + Math.min(st.combo - 1, 5) * 2 + (st.missedThis ? -5 : 0);
    if (st.missedThis) st.combo = 0;
    f.el.classList.add('ok');
    speak(f.word[0]);
    st.idx++;
    updateHud();
    setTimeout(nextWord, 700);
  } else {
    st.combo = 0; st.missedThis = true;
    st.lives--;
    if (!st.wrong.includes(st.target)) st.wrong.push(st.target);
    f.el.classList.remove('bad'); void f.el.offsetWidth; f.el.classList.add('bad');
    updateHud();
    if (st.lives <= 0) { st.locked = true; setTimeout(() => endGame(false), 500); }
  }
}

function endGame(won) {
  stopLoop(); clearFish();
  const done = st.idx;
  const stars = won ? (st.lives >= 3 ? 3 : st.lives === 2 ? 2 : 1) : 0;
  const prev = loadBest(st.lvl);
  const newBest = st.score > prev;
  if (newBest) saveBest(st.lvl, st.score);
  $('hud').hidden = true; $('result').hidden = false;
  $('rTitle').textContent = won ? '🎉 Giỏi lắm!' : '😢 Hết mạng rồi!';
  $('rStars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
  $('rScore').innerHTML = `Cấp độ <b>${st.cfg.name}</b> · Đúng <b>${done}/${ROUND}</b> từ · Điểm <b>${st.score}</b>` +
    (newBest ? '<br>🏆 Kỷ lục mới!' : '');
  $('rWrong').innerHTML = st.wrong.length
    ? '<b>Các từ cần ôn lại:</b>' + st.wrong.map(w => `<span>${w[0]} = ${w[1]}</span>`).join('')
    : '';
  if (won) speak('Well done!');
}

showMenu();
