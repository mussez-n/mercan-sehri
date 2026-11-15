// =============================================================
// Mercan Şehri — ana uygulama: kayıt, ses, ekranlar, gardırop, harita
// =============================================================

const SAVE_KEY = 'mercan-sehri-v1';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// ---------- KAYIT ----------
function freshState() {
  return {
    v: 1, name: '', look: { ...DEFAULT_LOOK }, pearls: 20, stars: 0, unlocked: [],
    quests: {}, sound: true, music: true, created: false, tipShown: false,
  };
}
function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) { const s = JSON.parse(raw); return Object.assign(freshState(), s, { look: Object.assign({}, DEFAULT_LOOK, s.look) }); }
  } catch (e) { /* kayıt okunamadı → yeni oyun */ }
  return freshState();
}
let S = load();
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* özel sekme vb. */ } }

const itemOf = (cat, id) => ITEMS[cat].find(i => i.id === id);
const key = (cat, id) => cat + ':' + id;
function isUnlocked(cat, item) {
  const u = item.unlock;
  if (u.type === 'free') return true;
  if (u.type === 'stars') return S.stars >= u.n;
  return S.unlocked.includes(key(cat, item.id));
}
const nameOr = () => S.name || 'Deniz Kızı';
const fill = (t) => t.replace(/\{ad\}/g, nameOr());

// ---------- SES ----------
const Sound = (() => {
  let ctx, master, timer;
  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC(); master = ctx.createGain(); master.gain.value = .6; master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(f, dur, type = 'sine', vol = .2, when = 0, glide) {
    const c = ensure(); if (!c) return;
    const t = c.currentTime + when, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (glide) o.frequency.exponentialRampToValueAtTime(glide, t + dur);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .05);
  }
  const fx = {
    tap: () => tone(700, .08, 'sine', .1),
    pop: () => tone(520, .16, 'sine', .25, 0, 1300),
    good: () => [523, 659, 784].forEach((f, i) => tone(f, .2, 'triangle', .14, i * .08)),
    bad: () => tone(240, .25, 'sine', .14, 0, 170),
    win: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .35, 'triangle', .14, i * .1)),
    coin: () => { tone(988, .08, 'square', .05); tone(1319, .3, 'square', .05, .08); },
    swim: () => tone(280, .45, 'sine', .07, 0, 620),
    unlock: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, .25, 'sine', .15, i * .07)),
  };
  const play = (n) => { if (S.sound && fx[n]) fx[n](); };
  const notes = [392, 440, 523.25, 587.33, 659.25, 783.99];
  const pat = [0, 2, 4, 2, 1, 3, 5, 3, 0, 4, 2, 1];
  function startMusic() {
    if (!S.music || timer || !ensure()) return;
    let i = 0;
    timer = setInterval(() => {
      tone(notes[pat[i % pat.length]] / 2, 1.3, 'sine', .045);
      if (i % 4 === 0) tone(notes[pat[(i / 4 | 0) % pat.length]] / 4, 2.6, 'triangle', .035);
      i++;
    }, 480);
  }
  function stopMusic() { clearInterval(timer); timer = null; }
  return { play, startMusic, stopMusic, ensure };
})();

function speak(text) {
  try {
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'tr-TR'; u.rate = .95; u.pitch = 1.15;
    const v = speechSynthesis.getVoices().find(v => (v.lang || '').toLowerCase().startsWith('tr'));
    if (v) u.voice = v;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  } catch (e) { /* okuma desteklenmiyor */ }
}

document.addEventListener('pointerdown', () => { Sound.ensure(); Sound.startMusic(); }, { once: true });
document.addEventListener('visibilitychange', () => document.hidden ? Sound.stopMusic() : Sound.startMusic());

// ---------- ORTAK PARÇALAR ----------
const PEARL_ICO = '<i class="pearl-ico"></i>';
function hud() {
  return `<div class="hud">
    <span class="chip">${PEARL_ICO}<b class="h-pearls">${S.pearls}</b></span>
    <span class="chip">⭐<b class="h-stars">${S.stars}</b></span>
  </div>`;
}
// Tek buton: ses efektleri + müzik birlikte açılıp kapanır (küçük ekranlara sığsın diye)
function toggles() {
  return `<button class="btn-round t-sound ${S.sound ? '' : 'off'}" aria-label="Ses">${S.sound ? '🔊' : '🔇'}</button>`;
}
function bindToggles(root) {
  $('.t-sound', root).onclick = (e) => {
    S.sound = S.music = !S.sound; save();
    e.currentTarget.textContent = S.sound ? '🔊' : '🔇';
    e.currentTarget.classList.toggle('off', !S.sound);
    if (S.sound) { Sound.play('tap'); Sound.startMusic(); } else Sound.stopMusic();
  };
}

function modal({ portrait = '', title = '', text = '', html = '', buttons = [], read = false, cls = '' }) {
  const ov = $('#overlay');
  ov.innerHTML = `<div class="modal-back"><div class="modal ${cls}">
      ${portrait ? `<div class="portrait">${portrait}</div>` : ''}
      ${title ? `<h2>${title}</h2>` : ''}
      ${text ? `<p class="m-text">${text}${read ? ' <button class="btn-read" aria-label="Sesli oku">🔊</button>' : ''}</p>` : ''}
      ${html}
      <div class="m-btns">${buttons.map((b, i) => `<button class="btn ${b.cls || ''}" data-i="${i}">${b.label}</button>`).join('')}</div>
    </div></div>`;
  ov.classList.add('open');
  const rb = $('.btn-read', ov); if (rb) rb.onclick = () => speak(text);
  $$('.m-btns .btn', ov).forEach(el => el.onclick = () => {
    Sound.play('tap');
    const b = buttons[+el.dataset.i];
    if (!b.keep) closeModal();
    b.onClick && b.onClick();
  });
}
function closeModal() { const ov = $('#overlay'); ov.classList.remove('open'); ov.innerHTML = ''; try { speechSynthesis.cancel(); } catch (e) { } }

function toast(text, ms = 3500) {
  const t = document.createElement('div');
  t.className = 'toast'; t.innerHTML = text;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('out'), ms);
  setTimeout(() => t.remove(), ms + 500);
}

function bubbles(on) {
  const b = $('#bubbles');
  if (!on) { b.innerHTML = ''; return; }
  if (b.childElementCount) return;
  b.innerHTML = Array.from({ length: 14 }, () => {
    const s = 8 + Math.random() * 26;
    return `<span style="left:${Math.random() * 100}%;width:${s}px;height:${s}px;animation-duration:${8 + Math.random() * 10}s;animation-delay:${-Math.random() * 15}s"></span>`;
  }).join('');
}

// ---------- BAŞLIK EKRANI ----------
function showTitle() {
  bubbles(true);
  const has = S.created;
  $('#app').innerHTML = `<section class="screen title-screen">
      <div class="title-bg">${Scene.map(S)}</div>
      <div class="title-box">
        <h1>Mercan<br><span>Şehri</span></h1>
        <p>Deniz kızının büyük macerası</p>
        <div class="title-mermaid">${Avatar.render(S.look)}</div>
        <button class="btn big" id="t-play">${has ? 'Devam Et' : 'Oyna'} ▶</button>
        ${has ? '<button class="link" id="t-new">Yeni oyun</button>' : ''}
      </div>
    </section>`;
  $('#t-play').onclick = () => { Sound.play('tap'); has ? showMap() : showWardrobe(); };
  const n = $('#t-new');
  if (n) n.onclick = () => modal({
    title: 'Yeni oyun mu?', text: 'Bütün incilerin, yıldızların ve açtığın parçalar silinecek.',
    buttons: [{ label: 'Vazgeç', cls: 'soft' }, { label: 'Evet, baştan başla', cls: 'warn', onClick: () => { S = freshState(); save(); showWardrobe(); } }],
  });
}

// ---------- GARDIROP ----------
let wardCat = 'hair';
function showWardrobe(cat) {
  if (cat) wardCat = cat;
  bubbles(true);
  const first = !S.created;
  $('#app').innerHTML = `<section class="screen wardrobe">
    <header class="topbar">
      ${S.created ? '<button class="btn-round" id="w-back" aria-label="Şehre dön">🏠</button>' : '<span></span>'}
      ${hud()}
      <div class="tb-right">${toggles()}</div>
    </header>
    <div class="w-stage">
      <h2 class="w-title">${first ? 'Deniz kızını tasarla!' : 'Gardırop'}</h2>
      <div class="w-avatar" id="w-avatar">${Avatar.render(S.look)}</div>
      <div class="w-name-row">
        <input id="w-name" maxlength="12" placeholder="Adı ne olsun?" value="${S.name.replace(/"/g, '&quot;')}" autocomplete="off">
        <button class="btn-round" id="w-random" aria-label="Rastgele">🎲</button>
      </div>
      <button class="btn big go" id="w-go">Şehre Git 🫧</button>
    </div>
    <div class="w-panel">
      <nav class="tabs">${CATEGORIES.map(c => `<button class="tab ${c.id === wardCat ? 'on' : ''}" data-c="${c.id}"><span>${c.icon}</span>${c.name}</button>`).join('')}</nav>
      <div class="items" id="w-items"></div>
    </div>
  </section>`;
  bindToggles($('#app'));
  renderItems();
  $$('.tab').forEach(t => t.onclick = () => {
    wardCat = t.dataset.c; Sound.play('tap');
    $$('.tab').forEach(x => x.classList.toggle('on', x === t));
    renderItems();
  });
  $('#w-name').oninput = (e) => { S.name = e.target.value.trim(); save(); };
  $('#w-random').onclick = () => {
    CATEGORIES.forEach(c => {
      const ok = ITEMS[c.id].filter(i => isUnlocked(c.id, i));
      S.look[c.id] = ok[Math.floor(Math.random() * ok.length)].id;
    });
    save(); Sound.play('pop'); refreshAvatar(); renderItems();
  };
  $('#w-go').onclick = () => {
    if (!S.created) { S.created = true; save(); }
    Sound.play('tap'); showMap();
  };
  const back = $('#w-back'); if (back) back.onclick = () => { Sound.play('tap'); showMap(); };
}
function refreshAvatar() {
  const a = $('#w-avatar'); if (!a) return;
  a.innerHTML = Avatar.render(S.look);
  a.classList.remove('pop'); void a.offsetWidth; a.classList.add('pop');
}
function lockBadge(cat, item) {
  const u = item.unlock;
  if (u.type === 'pearl') return `<span class="badge">${PEARL_ICO}${u.cost}</span>`;
  if (u.type === 'stars') return `<span class="badge">⭐${u.n}</span>`;
  if (u.type === 'quest') { const q = QUESTS.find(q => q.id === u.quest); return `<span class="badge npc-b">${Scene.npcSVG(q.npc, 30)}</span>`; }
  return '';
}
function renderItems() {
  const box = $('#w-items'); if (!box) return;
  box.innerHTML = ITEMS[wardCat].map(item => {
    const ok = isUnlocked(wardCat, item), on = S.look[wardCat] === item.id;
    const look = Object.assign({}, S.look, { [wardCat]: item.id });
    return `<button class="item ${ok ? '' : 'locked'} ${on ? 'on' : ''}" data-id="${item.id}">
      <div class="thumb">${Avatar.render(look, { viewBox: Avatar.CROP[wardCat], cls: 'thumb-svg' })}</div>
      <span class="iname">${item.name}</span>
      ${ok ? '' : `<span class="lock">🔒</span>${lockBadge(wardCat, item)}`}
    </button>`;
  }).join('');
  $$('.item', box).forEach(el => el.onclick = () => pickItem(wardCat, itemOf(wardCat, el.dataset.id)));
}
function pickItem(cat, item) {
  if (isUnlocked(cat, item)) {
    S.look[cat] = item.id; save(); Sound.play('pop'); refreshAvatar(); renderItems();
    return;
  }
  const u = item.unlock;
  const pic = `<div class="m-thumb">${Avatar.render(Object.assign({}, S.look, { [cat]: item.id }), { viewBox: Avatar.CROP[cat] })}</div>`;
  if (u.type === 'pearl') {
    if (S.pearls >= u.cost) {
      modal({
        title: item.name, html: pic + `<p class="m-text">Bu parçayı <b>${u.cost}</b> ${PEARL_ICO} inciyle açmak ister misin?</p>`,
        buttons: [{ label: 'Şimdi değil', cls: 'soft' }, {
          label: `Aç! ${u.cost} ${PEARL_ICO}`, onClick: () => {
            S.pearls -= u.cost; S.unlocked.push(key(cat, item.id)); S.look[cat] = item.id; save();
            Sound.play('unlock'); showWardrobe(); toast(`✨ <b>${item.name}</b> artık senin!`);
          },
        }],
      });
    } else {
      modal({
        title: item.name, html: pic + `<p class="m-text">Bunun için <b>${u.cost - S.pearls}</b> ${PEARL_ICO} inci daha lazım. Şehirdeki dostlara yardım ederek inci kazanabilirsin!</p>`,
        buttons: [{ label: 'Tamam', cls: 'soft' }, { label: 'Şehre git 🫧', onClick: () => { S.created = true; save(); showMap(); } }],
      });
    }
  } else if (u.type === 'quest') {
    const q = QUESTS.find(q => q.id === u.quest);
    modal({
      portrait: Scene.npcSVG(q.npc, 110), title: item.name,
      html: pic + `<p class="m-text"><b>${q.npcName}</b> sana bunu hediye edecek. Ona yardım et!</p>`,
      buttons: [{ label: 'Tamam', cls: 'soft' }],
    });
  } else if (u.type === 'stars') {
    modal({
      title: item.name, html: pic + `<p class="m-text"><b>${u.n}</b> ⭐ yıldız topladığında açılacak. Şu an <b>${S.stars}</b> yıldızın var. Her görev 1 yıldız kazandırır!</p>`,
      buttons: [{ label: 'Tamam', cls: 'soft' }],
    });
  }
}

// ---------- HARİTA ----------
const PS = .55;
let pos = { x: 980, y: 560 }, facing = 1;
function showMap() {
  bubbles(false);
  $('#app').innerHTML = `<section class="screen map-screen">
    <header class="topbar floating">
      <button class="btn-round" id="m-home" aria-label="Başlık">🏠</button>
      ${hud()}
      <div class="tb-right"><button class="btn-round wardrobe-btn" id="m-ward" aria-label="Gardırop">👗</button>${toggles()}</div>
    </header>
    <div class="map-scroll" id="map-scroll">${Scene.map(S)}</div>
  </section>`;
  bindToggles($('#app'));
  const svg = $('#map-svg');
  placePlayer();
  const sc = $('#map-scroll');
  requestAnimationFrame(() => {
    const w = svg.getBoundingClientRect().width;
    sc.scrollLeft = pos.x / 2000 * w - sc.clientWidth / 2;
  });
  sc.addEventListener('wheel', (e) => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { sc.scrollLeft += e.deltaY; e.preventDefault(); } }, { passive: false });

  svg.addEventListener('click', (e) => {
    const npc = e.target.closest('.npc');
    if (npc) {
      const q = QUESTS.find(q => q.id === npc.dataset.q);
      swimTo(q.x - 150, q.y - 150, () => openQuest(q));
      return;
    }
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
    swimTo(Math.max(80, Math.min(1920, p.x)), Math.max(260, Math.min(820, p.y)));
  });
  $('#m-ward').onclick = () => { Sound.play('tap'); showWardrobe(); };
  $('#m-home').onclick = () => { Sound.play('tap'); showTitle(); };
  if (!S.tipShown) {
    S.tipShown = true; save();
    setTimeout(() => modal({
      portrait: `<div class="tip-av">${Avatar.render(S.look)}</div>`, title: `Hoş geldin ${nameOr()}!`,
      text: 'Burası Mercan Şehri. Başının üstünde pembe ünlem olan dostlarına dokun ve onlara yardım et. Her yardım sana inci ve yıldız kazandırır!',
      read: true, buttons: [{ label: 'Hadi başlayalım!' }],
    }), 400);
  }
}
function placePlayer() {
  const g = $('#player'); if (!g) return;
  if (!g.firstChild) g.innerHTML = `<g class="player-bob"><svg x="-150" y="-240" width="300" height="480" viewBox="0 0 300 480">${Avatar.render(S.look).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg></g>`;
  g.setAttribute('transform', `translate(${pos.x} ${pos.y}) scale(${facing * PS} ${PS})`);
}
let swimming = false;
function swimTo(x, y, cb) {
  if (swimming) return;
  const from = { ...pos }, dist = Math.hypot(x - from.x, y - from.y);
  if (dist < 20) { cb && cb(); return; }
  swimming = true;
  facing = x < from.x ? -1 : 1;
  const dur = Math.min(1600, Math.max(450, dist * .9)), t0 = performance.now();
  Sound.play('swim');
  (function step(t) {
    const k = Math.min(1, (t - t0) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    pos.x = from.x + (x - from.x) * e; pos.y = from.y + (y - from.y) * e - Math.sin(k * Math.PI) * 40;
    placePlayer();
    if (k < 1) requestAnimationFrame(step); else { swimming = false; cb && cb(); }
  })(t0);
}

// ---------- GÖREVLER ----------
function openQuest(q) {
  const st = S.quests[q.id] || { done: 0 };
  const text = fill(st.done ? q.again : q.intro);
  modal({
    portrait: Scene.npcSVG(q.npc, 130), title: q.npcName, text, read: true,
    html: st.done ? `<p class="m-sub">Yardım edersen ${PEARL_ICO} inci ve ⭐ kazanırsın.</p>` : `<p class="m-sub">Hediye: ${PEARL_ICO} ${q.pearls} inci, ⭐ 1 yıldız ve sürpriz bir parça!</p>`,
    buttons: [{ label: 'Sonra', cls: 'soft' }, { label: 'Yardım edeyim! 💪', onClick: () => startQuest(q) }],
  });
}
let cleanup = null;
function startQuest(q) {
  const diff = Math.min((S.quests[q.id] || {}).done || 0, 2);
  const g = $('#game');
  g.innerHTML = `<div class="game-head">
      <button class="btn-round" id="g-close" aria-label="Kapat">✕</button>
      <div class="g-title">${Scene.npcSVG(q.npc, 44)}<span>${q.title}</span></div>
      <div class="g-prog" id="g-prog"></div>
    </div>
    <div class="game-body" id="g-body"></div>`;
  g.classList.add('open');
  $('#g-close').onclick = () => { Sound.play('tap'); endGame(); };
  requestAnimationFrame(() => {
    cleanup = Games[q.game]($('#g-body'), diff, () => finishQuest(q, diff), (h) => { const p = $('#g-prog'); if (p) p.innerHTML = h; });
  });
}
function endGame() {
  if (typeof cleanup === 'function') cleanup();
  cleanup = null;
  const g = $('#game'); g.classList.remove('open'); g.innerHTML = '';
}
function starItems() {
  const out = [];
  CATEGORIES.forEach(c => ITEMS[c.id].forEach(i => { if (i.unlock.type === 'stars' && S.stars >= i.unlock.n) out.push(key(c.id, i.id)); }));
  return out;
}
function finishQuest(q, diff) {
  endGame();
  const st = S.quests[q.id] || { done: 0 };
  const first = st.done === 0;
  const gain = first ? q.pearls : 10 + diff * 5;
  const beforeStars = starItems();
  S.pearls += gain; S.stars += 1; st.done += 1; S.quests[q.id] = st;
  const fresh = [];
  if (first && q.reward) { const k = key(q.reward.cat, q.reward.id); if (!S.unlocked.includes(k)) { S.unlocked.push(k); fresh.push(q.reward); } }
  starItems().filter(k => !beforeStars.includes(k)).forEach(k => { const [cat, id] = k.split(':'); fresh.push({ cat, id }); });
  save();
  showMap();
  Sound.play('coin');
  const cards = fresh.map(r => {
    const it = itemOf(r.cat, r.id);
    return `<div class="new-item"><div class="thumb">${Avatar.render(Object.assign({}, S.look, { [r.cat]: r.id }), { viewBox: Avatar.CROP[r.cat] })}</div><span>${it.name}</span></div>`;
  }).join('');
  const buttons = [{ label: 'Şehre dön', cls: fresh.length ? 'soft' : '' }];
  if (fresh.length) buttons.push({ label: 'Hemen dene 👗', onClick: () => showWardrobe(fresh[0].cat) });
  modal({
    cls: 'reward', portrait: Scene.npcSVG(q.npc, 120), title: 'Teşekkürler!',
    text: fill(first ? q.outro : 'Yine yardım ettin, sen bir harikasın!'), read: true,
    html: `<div class="gains"><span class="gain">${PEARL_ICO} +${gain}</span><span class="gain">⭐ +1</span></div>
      ${fresh.length ? `<h3 class="new-title">✨ Yeni parça${fresh.length > 1 ? 'lar' : ''}!</h3><div class="new-items">${cards}</div>` : ''}
      <div class="confetti">${Array.from({ length: 24 }, (_, i) => `<i style="--x:${Math.random() * 100}%;--d:${Math.random() * .8}s;--c:${['#ff8fb8', '#ffd36b', '#8fe3d0', '#b48be8', '#fff'][i % 5]}"></i>`).join('')}</div>`,
    buttons,
  });
  setTimeout(() => Sound.play('unlock'), 400);
}

// ---------- BAŞLAT ----------
showTitle();
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { }));
}
