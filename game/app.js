'use strict';
const ROUND = 10, LIVES = 3;
const REVIEW_CFG = { name: 'Ôn từ hay sai', speed: LEVELS.basic.speed, fish: 6 };
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

const layer = $('fishLayer');
let st = null;        // trạng thái ván chơi
let rafId = 0, lastT = 0;

// ---------- tiện ích ----------
const rand = (a, b) => a + Math.random() * (b - a);
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const bestKey = l => 'oceanvocab-best-' + l;
function loadBest(l) { try { return +localStorage.getItem(bestKey(l)) || 0; } catch (e) { return 0; } }
function saveBest(l, v) { try { localStorage.setItem(bestKey(l), v); } catch (e) {} }

// ---------- âm thanh hiệu ứng (tự tạo bằng WebAudio, không cần file) ----------
let actx = null;
function tone(freq, start, dur, type = 'sine', vol = 0.16) {
  const t = actx.currentTime + start, o = actx.createOscillator(), g = actx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(actx.destination);
  o.start(t); o.stop(t + dur + 0.02);
}
const SFX = {
  ok:    () => { tone(660, 0, .12, 'triangle'); tone(880, .09, .2, 'triangle'); },
  fast:  () => { tone(660, 0, .1, 'triangle'); tone(880, .08, .1, 'triangle'); tone(1320, .16, .25, 'triangle'); },
  bad:   () => { tone(180, 0, .22, 'sawtooth', .1); tone(140, .12, .25, 'sawtooth', .1); },
  win:   () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * .12, .3, 'triangle')),
  lose:  () => [392, 330, 262, 196].forEach((f, i) => tone(f, i * .16, .3, 'sine')),
  flip:  () => tone(520, 0, .08, 'sine', .1)
};
function sfx(name) {
  if (!$('optSfx').checked) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    SFX[name]();
  } catch (e) { /* trình duyệt không hỗ trợ âm thanh: bỏ qua */ }
}
// Nhớ lựa chọn bật/tắt âm thanh
[['optSound', 'speech'], ['optSfx', 'sfx'], ['optSlow', 'slow']].forEach(([id, key]) => {
  $(id).checked = store.get(key, id !== 'optSlow');   // "Đọc chậm" mặc định tắt
  $(id).onchange = () => store.set(key, $(id).checked);
});

function speak(text, force) {
  if ((!force && !$('optSound').checked) || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US'; u.rate = force && $('optSlow').checked ? 0.5 : 0.85;   // Bé tập nói + bật "Đọc chậm" thì đọc chậm hơn
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
let menuMode = 'kid';   // 'kid' | 'play' | 'study' | 'board'
document.querySelectorAll('.tab').forEach(t => t.onclick = () => { menuMode = t.dataset.mode; refreshMenu(); });
function refreshMenu() {
  for (const l in LEVELS) {
    const b = loadBest(l);
    const locked = !LIC.ok && l !== 'basic', c = wordCounts(l);
    $('best-' + l).textContent = locked ? '🔒 Cần kích hoạt bản đầy đủ' : b ? '🏆 Điểm cao nhất: ' + b : 'Chưa chơi';
    $('cnt-' + l).textContent = locked ? `📚 ${c.full} từ trong bản đầy đủ`
      : `📚 ${c.total} từ` + (c.added ? ` (có ${c.added} từ bố mẹ thêm)` : '');
  }
  const kidMode = menuMode === 'kid';
  $('intro').innerHTML = kidMode
    ? 'Bé chạm vào con cá nào, cá sẽ <b>đọc to từ tiếng Anh</b> và hiện <b>nghĩa tiếng Việt</b>. Không có điểm, không bị thua!'
    : 'Đọc nghĩa tiếng Việt, rồi <b>bấm thật nhanh vào con cá mang đúng từ tiếng Anh</b>. Càng nhanh điểm càng cao!';
  $('btnKid').hidden = !kidMode;
  $('modeHelp').textContent = { kid: 'Dành cho bé 4 tuổi: chạm cá để nghe và xem nghĩa.', play: 'Chọn cấp độ để chơi:', study: 'Chọn cấp độ để học các từ trước khi chơi:', board: 'Top 10 điểm cao nhất của từng cấp độ:' }[menuMode];
  const nHard = hardWords().length;
  $('btnReview').hidden = menuMode === 'board' || kidMode || !nHard;
  $('btnReview').textContent = (menuMode === 'study' ? '📌 Học các từ hay sai · ' : '🧠 Ôn từ hay sai · ') + nHard + ' từ';
  $('levelsBox').hidden = menuMode === 'board' || kidMode;
  $('boardBox').hidden = menuMode !== 'board';
  if (menuMode === 'board') renderBoard();
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t.dataset.mode === menuMode));
  $('licBanner').innerHTML = LIC.ok ? '✅ Bản đầy đủ' + (LIC.exp ? ' · hạn đến ' + fmtDate(LIC.exp) : '')
    : LIC.expired ? '⚠️ Bản đầy đủ đã hết hạn ngày ' + fmtDate(LIC.exp) + ' · <a href="#" id="btnAct">🔑 Nhập mã gia hạn</a>'
    : `🎁 Bản dùng thử: cấp Cơ bản, ${TRIAL_WORDS} từ · <a href="gioi-thieu.html">Xem giá & mua</a> · <a href="#" id="btnAct">🔑 Nhập mã kích hoạt</a>`;
}
// ---------- nhập mã kích hoạt ngay trong game ----------
function openAct() {
  $('menu').hidden = true; $('actPanel').hidden = false;
  $('actMsg').textContent = ''; $('actCode').value = ''; $('actCode').focus();
}
$('licBanner').onclick = e => { if (e.target.id === 'btnAct') { e.preventDefault(); openAct(); } };
$('actCancel').onclick = showMenu;
$('actGo').onclick = async () => {
  $('actMsg').style.color = '#0a4a82'; $('actMsg').textContent = 'Đang kiểm tra…';
  const res = await activateByCode($('actCode').value);
  if (res.r === 'ok') { $('actMsg').style.color = '#2b8a3e'; $('actMsg').textContent = '✅ Đã kích hoạt! Chúc bé học vui.'; setTimeout(showMenu, 1200); }
  else { $('actMsg').style.color = '#d9453d'; $('actMsg').textContent = actMessage(res); }
};
$('actCode').onkeydown = e => { if (e.key === 'Enter') $('actGo').click(); };
function showMenu() {
  if (st) clearTimeout(st.nextT);   // huỷ bước chuyển từ đang chờ nếu thoát giữa chừng
  stopLoop(); clearFish(); delete $('sea').dataset.lvl;
  kid = null; clearTimeout(kidCardT); $('kidCard').hidden = true; $('hud').classList.remove('kid'); layer.classList.remove('kid');
  $('menu').hidden = false; $('result').hidden = true; $('hud').hidden = true; $('study').hidden = true; $('actPanel').hidden = true;
  refreshMenu();
}

function renderBoard() {
  const b = getBoard(), box = $('boardBox');
  box.innerHTML = '';
  for (const l in LEVELS) {
    const sec = document.createElement('div');
    sec.className = 'boardSec';
    const h = document.createElement('h3');
    h.textContent = LEVELS[l].name;
    sec.appendChild(h);
    if (!b[l].length) {
      const p = document.createElement('p');
      p.className = 'hint2';
      p.textContent = !LIC.ok && l !== 'basic' ? '🔒 Có trong bản đầy đủ' : 'Chưa có điểm nào. Chơi để lên bảng nhé!';
      sec.appendChild(p);
    }
    b[l].forEach((e, i) => {
      const r = document.createElement('div');
      r.className = 'boardRow';
      const [rank, name, date, score] = [document.createElement('span'), document.createElement('b'), document.createElement('i'), document.createElement('em')];
      rank.textContent = ['🥇', '🥈', '🥉'][i] || (i + 1) + '.';
      name.textContent = e.n; date.textContent = e.d.split('-').reverse().join('/'); score.textContent = e.s;
      r.append(rank, name, date, score);
      sec.appendChild(r);
    });
    box.appendChild(sec);
  }
}

// ---------- học từ vựng (thẻ nhớ) ----------
let study = null;   // { lvl, words, i, flipped }
function openStudy(lvl) {
  study = { lvl, words: lvl === 'review' ? hardWords() : getPool(lvl), i: 0, flipped: false };
  $('menu').hidden = true; $('study').hidden = false;
  $('stTitle').textContent = 'Học từ · ' + (lvl === 'review' ? 'Từ hay sai' : LEVELS[lvl].name);
  renderStudy();
}
function renderStudy() {
  const w = study.words[study.i], n = study.words.length;
  $('cardEmoji').textContent = w[2] || '';
  $('cardMain').textContent = study.flipped ? w[1] : w[0];
  $('cardMain').className = study.flipped ? 'vi' : 'en';
  $('cardHint').textContent = study.flipped ? w[0] : 'Bấm vào thẻ để xem nghĩa';
  $('stPos').textContent = `Từ ${study.i + 1}/${n}`;
  $('stList').innerHTML = '';
  study.words.forEach((x, k) => {
    const d = document.createElement('div');
    d.className = 'stRow' + (k === study.i ? ' cur' : '');
    d.innerHTML = '<b></b><span></span>';
    d.firstChild.textContent = x[0]; d.lastChild.textContent = x[1];
    d.onclick = () => { study.i = k; study.flipped = false; renderStudy(); speak(x[0]); };
    $('stList').appendChild(d);
  });
}
function studyGo(d) {
  const n = study.words.length;
  study.i = (study.i + d + n) % n; study.flipped = false; renderStudy();
  speak(study.words[study.i][0]);
}
$('card').onclick = () => { study.flipped = !study.flipped; sfx('flip'); renderStudy(); };
$('card').onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('card').click(); } };
$('stNext').onclick = () => studyGo(1);
$('stPrev').onclick = () => studyGo(-1);
$('stSpeak').onclick = () => speak(study.words[study.i][0]);
$('stShuffle').onclick = () => { study.words = shuffle(study.words); study.i = 0; study.flipped = false; renderStudy(); };
$('stBack').onclick = showMenu;
$('stPlay').onclick = () => { $('study').hidden = true; startGame(study.lvl); };
document.querySelectorAll('.lvl').forEach(b => b.onclick = () => {
  if (!LIC.ok && b.dataset.lvl !== 'basic') {
    openAct();   // cấp này có trong bản đầy đủ: mời nhập mã kích hoạt
    return;
  }
  if (getPool(b.dataset.lvl).length < MIN_WORDS) return alert('Cấp độ này cần ít nhất ' + MIN_WORDS + ' từ. Nhờ bố mẹ vào trang Admin để thêm từ hoặc bỏ chế độ "chỉ dùng từ của tôi".');
  if (menuMode === 'study') return openStudy(b.dataset.lvl);
  startGame(b.dataset.lvl);
});
$('btnReview').onclick = () => menuMode === 'study' ? openStudy('review') : startGame('review');
$('btnQuit').onclick = showMenu;
$('btnMenu').onclick = showMenu;
$('btnAgain').onclick = () => {
  if (st.review && !hardWords().length) return showMenu();   // đã ôn hết từ hay sai
  startGame(st.lvl);
};

// ---------- chế độ bé tập nói: chạm cá → đọc tiếng Anh + hiện nghĩa tiếng Việt ----------
let kid = null, kidCardT = 0;   // { deck, fish }
$('btnKid').onclick = startKid;
function kidWord() {   // lấy từ kế tiếp trong bộ bài đã trộn, tránh trùng từ đang bơi
  if (!kid.deck.length) kid.deck = shuffle(kid.pool);
  const onScreen = new Set(kid.fish.map(f => f.word));
  const i = kid.deck.findIndex(w => !onScreen.has(w));
  return kid.deck.splice(i < 0 ? 0 : i, 1)[0];
}
function startKid() {
  if (st) clearTimeout(st.nextT);
  st = null; stopLoop(); clearFish();
  const pool = getPool('basic').filter(w => w[2]);   // chỉ từ có hình cho bé dễ hiểu
  if (pool.length < 3) return alert('Chưa đủ từ có hình để bé chơi.');
  kid = { pool, deck: shuffle(pool), fish: [], n: Math.min(layer.clientHeight < 520 ? 4 : 5, pool.length) };
  $('sea').dataset.lvl = 'basic';
  $('menu').hidden = true; $('result').hidden = true; $('hud').hidden = false;
  $('hud').classList.add('kid'); layer.classList.add('kid');
  for (let i = 0; i < kid.n; i++) spawnKidFish(i, false);
  lastT = performance.now();
  rafId = requestAnimationFrame(kidLoop);
}
function spawnKidFish(lane, fromEdge) {
  const w = kidWord(), dir = Math.random() < 0.5 ? 1 : -1;
  const el = document.createElement('div');
  el.className = 'fish ' + (dir > 0 ? 'right' : 'left');
  const W = Math.max(140, Math.round(w[0].length * 16 + 72));
  el.innerHTML = `<div class="in">${fishSVG(W, COLORS[(Math.random() * COLORS.length) | 0], (Math.random() * 3) | 0)}<span class="lbl">${w[0]}</span></div>`;
  el.style.width = W + 'px'; el.style.height = '78px';
  layer.appendChild(el);
  const LW = layer.clientWidth, H = layer.clientHeight, top = 80, bottom = 130, laneH = (H - top - bottom) / kid.n;
  const f = {
    el, word: w, dir, w: W, lane,
    x: fromEdge ? (dir > 0 ? -W - 10 : LW + 10) : rand(0, Math.max(10, LW - W)),
    baseY: top + laneH * lane + laneH / 2 - 39, amp: Math.min(10, laneH / 4), ph: rand(0, 6.28),
    v: 40 * rand(0.85, 1.2)
  };
  el.onclick = () => onKidPick(f);
  kid.fish.push(f);
  place(f, 0);
}
function onKidPick(f) {
  if (!kid || f.dead) return;
  f.dead = true;
  const [en, vi, emoji] = f.word;
  speak(en, true); sfx('ok');
  $('kcEmoji').textContent = emoji; $('kcEn').textContent = en; $('kcVi').textContent = vi;
  const c = $('kidCard'); c.hidden = false; c.classList.remove('show'); void c.offsetWidth; c.classList.add('show');
  clearTimeout(kidCardT); kidCardT = setTimeout(() => { c.hidden = true; }, 2200);
  f.el.classList.add('ok');
  const k = kid;
  setTimeout(() => {
    if (kid !== k) return;
    f.el.remove(); k.fish.splice(k.fish.indexOf(f), 1);
    spawnKidFish(f.lane, true);   // cá mới bơi vào thay chỗ
  }, 450);
}
function kidLoop(now) {
  const dt = Math.min(0.05, (now - lastT) / 1000), W = layer.clientWidth;
  lastT = now;
  for (const f of kid.fish) {
    if (f.dead) continue;
    f.x += f.dir * f.v * dt;
    if (f.dir > 0 && f.x > W + 20) f.x = -f.w - 20;
    if (f.dir < 0 && f.x < -f.w - 20) f.x = W + 20;
    place(f, now / 1000);
  }
  rafId = requestAnimationFrame(kidLoop);
}

// ---------- ván chơi ----------
function startGame(lvl) {
  if (st) clearTimeout(st.nextT);
  stopLoop(); clearFish();
  const review = lvl === 'review';   // chế độ ôn các từ hay sai
  const pool = shuffle(review ? allPool() : getPool(lvl));
  const queue = review ? shuffle(hardWords()).slice(0, ROUND) : pool.slice(0, ROUND);
  st = {
    lvl, review, cfg: review ? REVIEW_CFG : LEVELS[lvl], pool, round: queue.length, queue,
    idx: 0, score: 0, lives: LIVES, combo: 0, wrong: [], times: [],
    fish: [], target: null, askedAt: 0, missedThis: false, locked: false
  };
  $('sea').dataset.lvl = lvl;
  $('menu').hidden = true; $('result').hidden = true; $('hud').hidden = false;
  nextWord();
  lastT = performance.now();
  rafId = requestAnimationFrame(loop);
}

function updateHud() {
  $('hearts').textContent = '❤️'.repeat(st.lives) + '🖤'.repeat(LIVES - st.lives);
  $('score').textContent = st.score;
  $('progress').textContent = Math.min(st.idx + 1, st.round) + '/' + st.round;
}

function nextWord() {
  if (st.idx >= st.round) return endGame(true);
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

function clearFish() { layer.innerHTML = ''; if (st) st.fish = []; if (kid) kid.fish = []; }

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
  if (!st.locked) {   // thanh thời gian: còn bao nhiêu điểm thưởng tốc độ
    const left = Math.max(0, 1 - (now - st.askedAt) / 1000 / BONUS_SECS);
    const bar = $('timeBar').firstChild;
    bar.style.width = (left * 100) + '%';
    bar.style.background = left > .5 ? '#2fb36b' : left > .2 ? '#f09a1a' : '#d9453d';
  }
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

// Điểm theo thời gian: đúng được BASE_PTS, cộng thưởng tốc độ giảm dần về 0 sau BONUS_SECS giây
const BASE_PTS = 10, BONUS_MAX = 10, BONUS_SECS = 8;
const speedBonus = secs => Math.round(BONUS_MAX * Math.max(0, 1 - secs / BONUS_SECS));
function floatText(f, text) {
  const t = document.createElement('div');
  t.className = 'floatPts'; t.textContent = text;
  t.style.left = (f.x + f.w / 2) + 'px'; t.style.top = (parseFloat(f.el.style.transform.split(',')[1]) || 0) + 'px';
  layer.appendChild(t);
  setTimeout(() => t.remove(), 650);
}

function onPick(f) {
  if (st.locked || f.dead) return;
  if (f.word === st.target) {
    st.locked = true; f.dead = true;
    const secs = (performance.now() - st.askedAt) / 1000;
    st.times.push(secs);
    let pts;
    if (st.missedThis) { pts = BASE_PTS / 2; st.combo = 0; }      // đã chọn sai thì không có điểm tốc độ
    else { st.combo++; pts = BASE_PTS + speedBonus(secs) + Math.min(st.combo - 1, 5) * 2; }
    st.score += pts;
    floatText(f, '+' + pts + (!st.missedThis && speedBonus(secs) >= 7 ? ' ⚡' : ''));
    f.el.classList.add('ok');
    if (!st.missedThis) markGood(f.word);
    sfx(!st.missedThis && speedBonus(secs) >= 7 ? 'fast' : 'ok');
    speak(f.word[0]);
    st.idx++;
    updateHud();
    st.nextT = setTimeout(nextWord, 700);
  } else {
    if (!st.missedThis) markHard(st.target);   // ghi nhớ từ này khó với bé
    st.combo = 0; st.missedThis = true;
    sfx('bad');
    st.lives--;
    if (!st.wrong.includes(st.target)) st.wrong.push(st.target);
    f.el.classList.remove('bad'); void f.el.offsetWidth; f.el.classList.add('bad');
    updateHud();
    if (st.lives <= 0) { st.locked = true; st.nextT = setTimeout(() => endGame(false), 500); }
  }
}

function endGame(won) {
  stopLoop(); clearFish();
  const done = st.idx;
  const stars = won ? (st.lives >= 3 ? 3 : st.lives === 2 ? 2 : 1) : 0;
  const prev = st.review ? Infinity : loadBest(st.lvl);   // ôn từ hay sai không tính kỷ lục
  const newBest = st.score > prev;
  if (newBest) saveBest(st.lvl, st.score);
  $('hud').hidden = true; $('result').hidden = false;
  $('rTitle').textContent = won ? '🎉 Giỏi lắm!' : '😢 Hết mạng rồi!';
  $('rStars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
  const avg = st.times.length ? (st.times.reduce((a, b) => a + b, 0) / st.times.length).toFixed(1) : null;
  $('rScore').innerHTML = `Cấp độ <b>${st.cfg.name}</b> · Đúng <b>${done}/${st.round}</b> từ · Điểm <b>${st.score}</b>` +
    (avg ? `<br>⏱️ Trung bình <b>${avg}</b> giây/từ` : '') +
    (newBest ? '<br>🏆 Kỷ lục mới!' : '');
  $('rWrong').innerHTML = st.wrong.length
    ? '<b>Các từ cần ôn lại:</b>' + st.wrong.map(w => `<span>${w[0]} = ${w[1]}</span>`).join('')
    : '';
  $('savedMsg').textContent = '';
  const canSave = !st.review && qualifies(st.lvl, st.score);
  $('nameRow').hidden = !canSave;
  if (canSave) { $('playerName').value = store.get('lastName', ''); st.saved = false; }
  const left = hardWords().length;
  if (st.review) $('savedMsg').textContent = left ? `🧠 Còn ${left} từ hay sai, chơi tiếp để nhớ nhé!` : '🎉 Hết từ hay sai rồi, bé giỏi quá!';
  sfx(won ? 'win' : 'lose');
  if (won) speak('Well done!');
}
function saveScoreNow() {
  if (!st || st.review || st.saved || !qualifies(st.lvl, st.score)) return;
  addScore(st.lvl, $('playerName').value, st.score);
  st.saved = true;
  $('nameRow').hidden = true;
  $('savedMsg').textContent = '✅ Đã lưu vào bảng điểm!';
}
$('saveScore').onclick = saveScoreNow;
$('playerName').onkeydown = e => { if (e.key === 'Enter') saveScoreNow(); };

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
const SHARK = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="100" viewBox="0 -4 240 100"><defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b7285"/><stop offset=".55" stop-color="#8aa0b2"/><stop offset=".62" stop-color="#eef3f6"/><stop offset="1" stop-color="#dfe8ee"/></linearGradient></defs>
<g class="stail"><path d="M44,50 L4,12 Q20,48 6,88 Z" fill="#5b7285"/></g>
<path d="M100,30 L126,-3 L142,28 Z" fill="#5b7285"/><path d="M150,68 L130,94 L172,72 Z" fill="#6b8294"/>
<path d="M36,50 C70,28 150,18 214,46 C228,52 236,52 238,54 C220,60 200,70 150,76 C100,80 60,70 36,50Z" fill="url(#sg)"/>
<g stroke="#3d4f5e" stroke-width="2" fill="none" stroke-linecap="round"><path d="M172,44 q4,8 0,16"/><path d="M180,44 q4,8 0,16"/><path d="M188,45 q4,7 0,14"/><path d="M236,56 Q222,64 204,58"/></g>
<circle cx="208" cy="48" r="3.5" fill="#111"/></svg>`;
const TURTLE = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="90" viewBox="0 0 150 90">
<g class="flip2"><path d="M44,56 Q22,84 4,74 Q28,66 42,50Z" fill="#6fb36b"/></g>
<path d="M18,54 L8,50 L14,60Z" fill="#6fb36b"/>
<path d="M28,58 L112,58 Q70,72 28,58Z" fill="#d9c98b"/>
<path d="M28,58 C28,14 106,14 112,58Z" fill="#3f8f4f"/>
<g fill="none" stroke="#2a6a38" stroke-width="2.5"><path d="M52,58 L58,34 L82,34 L88,58"/><path d="M58,34 L50,22 M82,34 L92,24 M70,34 L70,18"/></g>
<circle cx="124" cy="46" r="12" fill="#7bc27a"/><circle cx="129" cy="43" r="2.8" fill="#111"/><path d="M130,52 q-5,3 -9,0" stroke="#2a6a38" stroke-width="1.8" fill="none"/>
<g class="flip1"><path d="M96,58 Q120,86 146,76 Q122,64 106,52Z" fill="#6fb36b"/></g></svg>`;
function spawnCrosser() {
  if (document.hidden) return;
  const shark = Math.random() < 0.5, d = document.createElement('div');
  d.className = 'cr' + (Math.random() < 0.5 ? ' l' : '');
  d.style.top = (shark ? rand(10, 50) : rand(25, 60)) + '%';
  d.style.animationDuration = (shark ? rand(11, 15) : rand(20, 26)) + 's';
  d.innerHTML = shark ? SHARK : TURTLE;
  d.onanimationend = () => d.remove();
  $('crossers').appendChild(d);
}
setTimeout(spawnCrosser, 2500);
setInterval(spawnCrosser, 14000);

buildFloor(); buildBgFish();
let rzT; addEventListener('resize', () => { clearTimeout(rzT); rzT = setTimeout(buildFloor, 200); });

licReady.then(showMenu);
