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
// [màu sáng, màu đậm] của thân cá
const COLORS = [['#ff9a3c','#d9480f'],['#ffd43b','#e67700'],['#74c0fc','#1864ab'],['#f783ac','#a61e4d'],
  ['#b197fc','#5f3dc4'],['#69db7c','#2b8a3e'],['#ff8787','#c92a2a'],['#63e6be','#087f5b']];
let uid = 0;

// Vẽ cá bằng SVG (hướng sang phải), rộng W; variant 0: sọc, 1: đốm, 2: trơn
function fishSVG(W, [c1, c2], variant) {
  const id = 'f' + (uid++), L = 30, R = W - 2;
  const body = `M${L},32 C${L+10},-2 ${R-26},-4 ${R},30 C${R-26},66 ${L+10},66 ${L},32Z`;
  let deco = '';
  if (variant === 0) deco = [.34, .5, .66].map(p => `<rect x="${W*p}" y="-10" width="${p===.5?9:6}" height="80" fill="#fff" opacity=".55"/>`).join('');
  if (variant === 1) deco = [[.4,22,5],[.52,40,6],[.62,24,4],[.7,42,4],[.48,26,3]].map(([p,y,r]) => `<circle cx="${W*p}" cy="${y}" r="${r}" fill="${c2}" opacity=".4"/>`).join('');
  if (variant === 2) deco = `<path d="M${L},20 C${L+20},-4 ${R-26},-6 ${R},26 C${R-30},12 ${L+30},12 ${L},20Z" fill="${c2}" opacity=".45"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="78" viewBox="0 -8 ${W} 78">
<defs><linearGradient id="g${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c2}"/><stop offset=".45" stop-color="${c1}"/><stop offset="1" stop-color="#fff8e1"/></linearGradient>
<clipPath id="c${id}"><path d="${body}"/></clipPath></defs>
<g class="tail"><path d="M${L+4},32 L0,4 Q12,32 0,60 Z" fill="${c2}"/><path d="M${L+4},32 L6,14 M${L+4},32 L6,50" stroke="#fff" stroke-opacity=".35" stroke-width="1.5"/></g>
<path d="M${W*.34},6 Q${W*.5},-12 ${W*.7},4 Z" fill="${c2}"/>
<path d="M${W*.42},56 Q${W*.46},74 ${W*.6},58 Z" fill="${c2}"/>
<path d="${body}" fill="url(#g${id})"/>
<g clip-path="url(#c${id})">${deco}</g>
<path d="${body}" fill="none" stroke="${c2}" stroke-width="1.5"/>
<path d="M${R-30},12 Q${R-24},32 ${R-30},52" fill="none" stroke="${c2}" stroke-width="2" opacity=".6"/>
<g class="fin"><path d="M${W*.5},38 Q${W*.45},56 ${W*.58},54 Z" fill="${c2}" opacity=".85"/></g>
<circle cx="${R-14}" cy="24" r="6" fill="#fff"/><circle cx="${R-12}" cy="24" r="3.2" fill="#111"/><circle cx="${R-11}" cy="22.5" r="1" fill="#fff"/>
<path d="M${R},34 q-5,3 -9,1" fill="none" stroke="${c2}" stroke-width="2" stroke-linecap="round"/>
</svg>`;
}
const fishWidth = word => Math.max(116, Math.round(word.length * 12.5 + 66));

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
  const W = fishWidth(w[0]);
  const color = COLORS[(Math.random() * COLORS.length) | 0];
  el.innerHTML = `<div class="in">${fishSVG(W, color, (Math.random() * 3) | 0)}<span class="lbl">${w[0]}</span></div>`;
  el.style.width = W + 'px'; el.style.height = '78px';
  layer.appendChild(el);

  const LW = layer.clientWidth, H = layer.clientHeight;
  const top = 80, bottom = 130;
  const laneH = (H - top - bottom) / n;
  const f = {
    el, word: w, dir, w: W, h: 78,
    x: rand(0, Math.max(10, LW - W)),
    baseY: top + laneH * i + laneH / 2 - 39,
    amp: Math.min(10, laneH / 4), ph: rand(0, 6.28),
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

// ---------- đáy biển: san hô, rong, sao biển ----------
function buildFloor() {
  const svg = $('floor'), W = innerWidth, G = 170;
  svg.setAttribute('viewBox', `0 0 ${W} ${G}`);
  const sw = (x, h, c, wd) => `<path class="sway" style="animation-delay:${-rand(0, 3).toFixed(1)}s" d="M${x},${G} C${x-18},${G-h*.35} ${x+18},${G-h*.65} ${x},${G-h}" fill="none" stroke="${c}" stroke-width="${wd}" stroke-linecap="round"/>`;
  const branch = (x, h, c) => {
    let o = `<g stroke="${c}" stroke-width="9" stroke-linecap="round" fill="none"><path d="M${x},${G} L${x},${G-h}"/>`;
    for (let k = 1; k <= 3; k++) { const y = G - h * k / 4, d = 16 + k * 4; o += `<path d="M${x},${y+8} L${x-d},${y-14}"/><path d="M${x},${y-4} L${x+d},${y-24}"/>`; }
    return o + '</g>';
  };
  const fan = (x, r, c) => {
    let o = `<g stroke="${c}" stroke-width="4" stroke-linecap="round" fill="none">`; const pts = [];
    for (let a = -70; a <= 70; a += 14) { const t = a * Math.PI / 180, px = x + Math.sin(t) * r, py = G - Math.cos(t) * r; pts.push(px.toFixed(1) + ',' + py.toFixed(1)); o += `<path d="M${x},${G} L${px},${py}"/>`; }
    return o + `<polyline points="${pts.join(' ')}" stroke-width="3"/></g>`;
  };
  const brain = (x, r, c, d) => `<path d="M${x-r},${G} A${r},${r*.8} 0 0 1 ${x+r},${G}Z" fill="${c}"/><g fill="none" stroke="${d}" stroke-width="2.5" stroke-linecap="round" opacity=".6"><path d="M${x-r*.6},${G-6} q${r*.15},-${r*.5} ${r*.3},-${r*.1} t${r*.3},-${r*.1}"/><path d="M${x-r*.2},${G-r*.6} q${r*.2},${r*.15} ${r*.35},0"/><path d="M${x+r*.1},${G-8} q${r*.2},-${r*.4} ${r*.4},-${r*.05}"/></g>`;
  const tube = (x, h, c, d) => [[0, h], [16, h * .7], [-14, h * .55]].map(([dx, hh]) => `<rect x="${x+dx-6}" y="${G-hh}" width="12" height="${hh}" rx="5" fill="${c}"/><ellipse cx="${x+dx}" cy="${G-hh}" rx="6" ry="3" fill="${d}"/>`).join('');
  const star = (x, y, c) => { const p = []; for (let k = 0; k < 10; k++) { const r = k % 2 ? 5 : 12, t = (k * 36 - 90) * Math.PI / 180; p.push((x + Math.cos(t) * r).toFixed(1) + ',' + (y + Math.sin(t) * r).toFixed(1)); } return `<polygon points="${p.join(' ')}" fill="${c}" stroke="#fff" stroke-opacity=".4"/>`; };
  const pick = a => a[(Math.random() * a.length) | 0];

  let back = '', front = '';
  for (let x = 10; x < W; x += rand(28, 55)) {
    const k = Math.random();
    if (k < .34) back += sw(x, rand(60, 130), pick(['#2e9e5b', '#37b26c', '#1f8a4c']), rand(6, 9)) + sw(x + 9, rand(40, 90), pick(['#52c07a', '#2e9e5b']), 6);
    else if (k < .52) back += branch(x, rand(55, 95), pick(['#ff6b6b', '#ff8787', '#f06595']));
    else if (k < .66) back += fan(x, rand(40, 70), pick(['#b197fc', '#da77f2', '#9775fa']));
    else if (k < .80) back += brain(x, rand(22, 36), pick(['#f783ac', '#ffa94d', '#e599f7']), '#5c1a3a');
    else back += tube(x, rand(40, 70), pick(['#ffa94d', '#fcc419', '#ff922b']), '#7a3b00');
  }
  front += `<path d="M0,${G} L0,${G-22} Q${W*.25},${G-34} ${W*.5},${G-22} T${W},${G-24} L${W},${G}Z" fill="#e8cf8c"/><path d="M0,${G-22} Q${W*.25},${G-34} ${W*.5},${G-22} T${W},${G-24}" fill="none" stroke="#f6e6b4" stroke-width="4"/>`;
  for (let x = 30; x < W; x += rand(90, 200)) front += star(x, G - rand(4, 14), pick(['#ff7043', '#ffb300']));
  for (let x = 60; x < W; x += rand(120, 240)) front += `<ellipse cx="${x}" cy="${G-6}" rx="${rand(10, 20)}" ry="${rand(6, 10)}" fill="#8d99a6"/>`;
  svg.innerHTML = back + front;
}
function buildBgFish() {
  const box = $('bgFish');
  for (let k = 0; k < 5; k++) {
    const d = document.createElement('div');
    d.className = 'bf' + (k % 2 ? ' l' : '');
    d.style.cssText = `top:${rand(12, 60)}%;animation-duration:${rand(28, 50)}s;animation-delay:-${rand(0, 30)}s`;
    d.innerHTML = fishSVG(100, COLORS[(Math.random() * COLORS.length) | 0], k % 3).replace('width="100" height="78"', 'width="70" height="55"');
    box.appendChild(d);
  }
}
buildFloor(); buildBgFish();
let rzT; addEventListener('resize', () => { clearTimeout(rzT); rzT = setTimeout(buildFloor, 200); });

showMenu();
