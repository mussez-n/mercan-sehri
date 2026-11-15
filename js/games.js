// =============================================================
// Mini oyunlar. Her biri: Games.ad(body, zorluk 0-2, kazanınca(), ilerleme(html))
// Temizlik fonksiyonu döndürür.
// =============================================================

const Games = (() => {
  const rand = (a, b) => a + Math.random() * (b - a);
  const shuffle = (arr) => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };
  const svgPoint = (svg, e) => new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
  const pearlIcons = (found, n) => Array.from({ length: n }, (_, i) => `<i class="pi ${i < found ? 'on' : ''}"></i>`).join('');
  function tween(from, to, ms, fn, done) {
    const t0 = performance.now();
    (function step(t) {
      const k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3);
      fn(from.x + (to.x - from.x) * e, from.y + (to.y - from.y) * e);
      if (k < 1) requestAnimationFrame(step); else done && done();
    })(t0);
  }
  function burst(svg, x, y) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'burst');
    g.setAttribute('transform', `translate(${x} ${y})`);
    g.innerHTML = Array.from({ length: 8 }, (_, i) => {
      const a = i / 8 * Math.PI * 2;
      return `<circle cx="${Math.cos(a) * 30}" cy="${Math.sin(a) * 30}" r="5" fill="${i % 2 ? '#fff' : '#ffd36b'}"/>`;
    }).join('');
    svg.appendChild(g);
    setTimeout(() => g.remove(), 700);
  }
  const reefBg = (W, H) => `
    <defs>
      <linearGradient id="gbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bff3ee"/><stop offset="1" stop-color="#4fb3c0"/></linearGradient>
      <radialGradient id="gpearl" cx=".35" cy=".35" r=".75"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#f6e9f7"/><stop offset="1" stop-color="#c9b6e4"/></radialGradient>
      <radialGradient id="glamp"><stop offset="0" stop-color="#fffbd0"/><stop offset=".5" stop-color="#fff2a0" stop-opacity=".5"/><stop offset="1" stop-color="#fff2a0" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#gbg)"/>
    <path d="M60 0 h80 L260 ${H} h-90 Z M420 0 h60 L600 ${H} h-70 Z" fill="#fff" opacity=".08"/>`;

  // ---------------------------------------------------------
  // 1) KAYIP İNCİLER — gizli nesne
  // ---------------------------------------------------------
  function inciler(body, diff, win, prog) {
    const n = [5, 6, 8][diff], W = 800, H = 500;
    const pts = [];
    while (pts.length < n) {
      const p = { x: rand(50, W - 50), y: rand(140, H - 30) };
      if (pts.every(q => Math.hypot(q.x - p.x, q.y - p.y) > 90)) pts.push(p);
    }
    let decor = `<path d="M0 360 Q200 330 400 355 T800 345 V${H} H0 Z" fill="#f3e2bf"/>`;
    for (let i = 0; i < 7; i++) decor += `<ellipse cx="${rand(20, W - 20)}" cy="${rand(380, 480)}" rx="${rand(30, 60)}" ry="${rand(16, 30)}" fill="#b9b2d8" opacity=".9"/>`;
    decor += Scene.coral(rand(80, 200), 400, 1.1, '#ff8fb1', 5) + Scene.coral(rand(560, 720), 410, 1.2, '#c9a7f0', 8) + Scene.fanCoral(rand(320, 480), 380, 1.1, '#ffa07a');
    for (let i = 0; i < 5; i++) decor += Avatar.shell(rand(40, W - 40), rand(400, 485), rand(9, 14), '#fff0f6', '#d9a3c0');
    let pearls = pts.map((p, i) => `<g class="g-pearl" data-i="${i}" transform="translate(${p.x.toFixed(0)} ${p.y.toFixed(0)})">
        <circle r="38" fill="#fff" opacity="0"/><circle r="15" fill="url(#gpearl)" stroke="#b9a7d6" stroke-width="1.2"/><circle cx="-5" cy="-5" r="4.5" fill="#fff"/></g>`).join('');
    let front = '';
    pts.forEach((p, i) => { if (i % 2 === 0) front += Scene.seaweed(p.x + rand(-14, 14), Math.min(H, p.y + 40), rand(90, 140), '#5fbf93', i * .3, 12); });
    front += Scene.seaweed(30, H, 220, '#4fae86', .2, 14) + Scene.seaweed(W - 30, H, 240, '#4fae86', 1, 14);

    body.innerHTML = `<p class="g-hint">Dokun ve incileri topla!</p><svg class="g-svg" viewBox="0 0 ${W} ${H}">${reefBg(W, H)}${decor}${pearls}<g style="pointer-events:none">${front}</g></svg>`;
    const svg = body.querySelector('svg');
    let found = 0, last = Date.now();
    prog(pearlIcons(0, n));
    svg.addEventListener('pointerdown', (e) => {
      const g = e.target.closest('.g-pearl');
      if (!g || g.classList.contains('got')) return;
      g.classList.add('got'); g.classList.remove('hint');
      const p = pts[+g.dataset.i]; burst(svg, p.x, p.y);
      found++; last = Date.now(); Sound.play('pop'); prog(pearlIcons(found, n));
      if (found === n) setTimeout(win, 800);
    });
    const timer = setInterval(() => {
      if (Date.now() - last > 10000) {
        const left = [...svg.querySelectorAll('.g-pearl:not(.got)')];
        if (left.length) { left[0].classList.add('hint'); last = Date.now(); }
      }
    }, 1000);
    return () => clearInterval(timer);
  }

  // ---------------------------------------------------------
  // 2) MERCAN FENERİ — parçaları sürükle
  // ---------------------------------------------------------
  const LAMP = {
    cap: { dy: 40, d: '<path d="M-60 30 Q-60 -25 0 -35 Q60 -25 60 30 Z" fill="#7fc8e8" stroke="#3d7fa8" stroke-width="4"/><circle cy="-44" r="10" fill="#ffd36b" stroke="#c99a2e" stroke-width="3"/><path d="M-62 30 H62" stroke="#3d7fa8" stroke-width="7" stroke-linecap="round"/>' },
    crystal: { dy: 125, d: '<path class="cr" d="M0 -45 L32 0 L0 45 L-32 0 Z" fill="#c9f5ff" stroke="#59b9d6" stroke-width="4" stroke-linejoin="round"/><path d="M0 -45 L10 0 L0 45 M-32 0 H32" stroke="#fff" stroke-width="2" opacity=".8" fill="none"/>' },
    ring: { dy: 186, d: '<rect x="-62" y="-16" width="124" height="32" rx="16" fill="#f2a6c4" stroke="#c4688f" stroke-width="4"/><circle cx="-36" r="6" fill="#fff"/><circle r="6" fill="#fff"/><circle cx="36" r="6" fill="#fff"/>' },
    column: { dy: 252, d: '<rect x="-30" y="-50" width="60" height="100" rx="10" fill="#9fe0d0" stroke="#4aa58f" stroke-width="4"/><path d="M-30 -18 H30 M-30 18 H30" stroke="#4aa58f" stroke-width="3"/>' },
    base: { dy: 327, d: '<path d="M-80 25 L-58 -25 H58 L80 25 Z" fill="#b8a6e8" stroke="#7a62c4" stroke-width="4" stroke-linejoin="round"/><circle cx="-30" r="5" fill="#fff" opacity=".7"/><circle cx="30" r="5" fill="#fff" opacity=".7"/>' },
  };
  function fener(body, diff, win, prog) {
    const land = body.clientWidth > body.clientHeight;
    const W = land ? 900 : 600, H = land ? 560 : 860;
    const lx = land ? 280 : 300, ly = land ? 110 : 50;
    const homes = land ? [[640, 120], [810, 120], [640, 290], [810, 290], [725, 450]] : [[110, 560], [300, 560], [490, 560], [190, 735], [410, 735]];
    const all = ['cap', 'crystal', 'ring', 'column', 'base'];
    const count = [3, 4, 5][diff];
    const missing = ['crystal', ...shuffle(all.filter(k => k !== 'crystal'))].slice(0, count);
    const hs = shuffle(homes.slice()).slice(0, count);

    let s = reefBg(W, H) + `<path d="M0 ${ly + 360} Q${W / 2} ${ly + 330} ${W} ${ly + 365} V${H} H0 Z" fill="#f3e2bf" opacity=".9"/>`;
    s += `<circle class="lamp-glow" cx="${lx}" cy="${ly + 125}" r="230" fill="url(#glamp)"/>`;
    if (land) s += `<rect x="560" y="30" width="320" height="500" rx="30" fill="#fff" opacity=".25"/>`;
    else s += `<rect x="20" y="470" width="560" height="370" rx="30" fill="#fff" opacity=".25"/>`;
    all.forEach(k => {
      const t = `translate(${lx} ${ly + LAMP[k].dy})`;
      s += missing.includes(k) ? `<g class="ghost" transform="${t}">${LAMP[k].d}</g>` : `<g class="placed" transform="${t}">${LAMP[k].d}</g>`;
    });
    missing.forEach((k, i) => s += `<g class="piece" data-k="${k}" transform="translate(${hs[i][0]} ${hs[i][1]})"><rect x="-85" y="-60" width="170" height="120" fill="#fff" opacity="0"/>${LAMP[k].d}</g>`);
    body.innerHTML = `<p class="g-hint">Parçaları sürükleyip fenerin üstündeki yerlerine bırak!</p><svg class="g-svg drag" viewBox="0 0 ${W} ${H}">${s}</svg>`;
    const svg = body.querySelector('svg');
    const pieces = [...svg.querySelectorAll('.piece')];
    pieces.forEach((g, i) => { g._x = hs[i][0]; g._y = hs[i][1]; g._h = { x: hs[i][0], y: hs[i][1] }; g._t = { x: lx, y: ly + LAMP[g.dataset.k].dy }; });
    const setPos = (g, x, y) => { g._x = x; g._y = y; g.setAttribute('transform', `translate(${x} ${y})`); };
    let drag = null, placed = 0;
    prog(`${placed} / ${count} parça`);
    svg.addEventListener('pointerdown', (e) => {
      const g = e.target.closest('.piece:not(.done)');
      if (!g) return;
      e.preventDefault();
      svg.setPointerCapture(e.pointerId);
      const p = svgPoint(svg, e);
      drag = { g, ox: p.x - g._x, oy: p.y - g._y };
      svg.appendChild(g); g.classList.add('dragging'); Sound.play('tap');
    });
    svg.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const p = svgPoint(svg, e);
      setPos(drag.g, p.x - drag.ox, p.y - drag.oy);
    });
    const up = () => {
      if (!drag) return;
      const g = drag.g; drag = null; g.classList.remove('dragging');
      if (Math.hypot(g._x - g._t.x, g._y - g._t.y) < 85) {
        g.classList.add('done');
        tween({ x: g._x, y: g._y }, g._t, 180, (x, y) => setPos(g, x, y));
        placed++; Sound.play('good'); prog(`${placed} / ${count} parça`);
        burst(svg, g._t.x, g._t.y);
        if (placed === count) {
          setTimeout(() => { svg.classList.add('lit'); Sound.play('win'); }, 300);
          setTimeout(win, 1700);
        }
      } else {
        Sound.play('bad');
        tween({ x: g._x, y: g._y }, g._h, 260, (x, y) => setPos(g, x, y));
      }
    };
    svg.addEventListener('pointerup', up);
    svg.addEventListener('pointercancel', up);
  }

  // ---------------------------------------------------------
  // 3) MİNİK EVE DÖNÜYOR — labirent
  // ---------------------------------------------------------
  function labirent(body, diff, win, prog) {
    const n = [5, 6, 7][diff], C = 100, pad = 20, S = n * C + pad * 2;
    const cells = Array.from({ length: n }, () => Array.from({ length: n }, () => ({ n: 1, e: 1, s: 1, w: 1, v: 0 })));
    const dirs = { n: [0, -1, 's'], s: [0, 1, 'n'], e: [1, 0, 'w'], w: [-1, 0, 'e'] };
    (function carve(x, y) {
      cells[y][x].v = 1;
      for (const k of shuffle(Object.keys(dirs))) {
        const [dx, dy, back] = dirs[k], nx = x + dx, ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < n && ny < n && !cells[ny][nx].v) { cells[y][x][k] = 0; cells[ny][nx][back] = 0; carve(nx, ny); }
      }
    })(0, 0);
    let walls = '';
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const X = pad + x * C, Y = pad + y * C, c = cells[y][x];
      if (c.n) walls += `M${X} ${Y} H${X + C} `;
      if (c.w) walls += `M${X} ${Y} V${Y + C} `;
      if (x === n - 1 && c.e) walls += `M${X + C} ${Y} V${Y + C} `;
      if (y === n - 1 && c.s) walls += `M${X} ${Y + C} H${X + C} `;
    }
    const cx = (i) => pad + i * C + C / 2;
    const gx = cx(n - 1), gy = cx(n - 1);
    body.innerHTML = `<p class="g-hint">Parmağınla Minik'i sürükleyerek yoldan eve götür!</p>
      <svg class="g-svg drag" viewBox="0 0 ${S} ${S}">
        <rect x="0" y="0" width="${S}" height="${S}" rx="30" fill="#bff3ee"/>
        <rect x="${pad}" y="${pad}" width="${n * C}" height="${n * C}" fill="#f6e9cc"/>
        <g id="trail"></g>
        <g transform="translate(${gx} ${gy + 30})"><path d="M-42 0 C -42 -64 42 -64 42 0 Z" fill="#8fd68f" stroke="#4d9a5c" stroke-width="4"/><path d="M-10 0 V-18 Q0 -28 10 -18 V0 Z" fill="#b98a5a"/><path d="${Avatar.heart(0, -54, 7)}" fill="#ff7fa3"/></g>
        <path d="${walls}" stroke="#ff8fb1" stroke-width="12" stroke-linecap="round" fill="none"/>
        <path d="${walls}" stroke="#ffc2d6" stroke-width="4" stroke-linecap="round" fill="none"/>
        <g id="turtle" transform="translate(${cx(0)} ${cx(0)})"><g transform="scale(.62)">${Scene.NPC.minik()}</g></g>
      </svg>`;
    const svg = body.querySelector('svg'), turtle = svg.querySelector('#turtle'), trail = svg.querySelector('#trail');
    let px = 0, py = 0, moving = false, active = false, steps = 0, over = false;
    prog('🏠 Eve götür');
    let target = null;
    const open = (dx, dy) => {
      const k = dx === 1 ? 'e' : dx === -1 ? 'w' : dy === 1 ? 's' : dy === -1 ? 'n' : null;
      return k && !cells[py][px][k];
    };
    function go(nx, ny) {
      if (moving || over) return;
      const dx = nx - px, dy = ny - py;
      if (Math.abs(dx) + Math.abs(dy) !== 1 || !open(dx, dy)) return false;
      trail.insertAdjacentHTML('beforeend', `<circle cx="${cx(px)}" cy="${cx(py)}" r="7" fill="#9fe0d0"/>`);
      moving = true; steps++;
      const from = { x: cx(px), y: cx(py) }; px = nx; py = ny;
      Sound.play('tap');
      tween(from, { x: cx(px), y: cx(py) }, 140, (x, y) => turtle.setAttribute('transform', `translate(${x} ${y})${dx < 0 ? ' scale(-1 1)' : ''}`), () => {
        moving = false;
        if (px === n - 1 && py === n - 1) { over = true; Sound.play('win'); burst(svg, gx, gy); setTimeout(win, 900); return; }
        walk();
      });
      return true;
    }
    function cellAt(e) {
      const p = svgPoint(svg, e);
      return { x: Math.max(0, Math.min(n - 1, Math.floor((p.x - pad) / C))), y: Math.max(0, Math.min(n - 1, Math.floor((p.y - pad) / C))) };
    }
    // Parmağın gösterdiği hücreye doğru, duvara çarpana kadar adım adım yürü
    function walk() {
      if (!target || moving || over) return;
      const ex = target.x - px, ey = target.y - py;
      if (!ex && !ey) { target = null; return; }
      const sx = Math.sign(ex), sy = Math.sign(ey);
      const first = Math.abs(ex) >= Math.abs(ey) ? [sx, 0] : [0, sy];
      const second = first[0] ? [0, sy] : [sx, 0];
      if ((first[0] || first[1]) && open(...first)) go(px + first[0], py + first[1]);
      else if ((second[0] || second[1]) && open(...second)) go(px + second[0], py + second[1]);
      else target = null;
    }
    function toward(e) { target = cellAt(e); walk(); }
    svg.addEventListener('pointerdown', (e) => { e.preventDefault(); active = true; svg.setPointerCapture(e.pointerId); toward(e); });
    svg.addEventListener('pointermove', (e) => { if (active) toward(e); });
    const stop = () => active = false;
    svg.addEventListener('pointerup', stop); svg.addEventListener('pointercancel', stop);
    const key = (e) => {
      const m = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.key];
      if (m) { e.preventDefault(); target = null; go(px + m[0], py + m[1]); }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }

  // ---------------------------------------------------------
  // 4) KARIŞIK MEKTUPLAR — eşleştirip sürükle
  // ---------------------------------------------------------
  const HOUSES = [
    { s: '🐚', c: '#ff8fb8' }, { s: '⭐', c: '#ffcf4a' }, { s: '🐠', c: '#6cc6f0' }, { s: '🌙', c: '#b48be8' },
  ];
  function mektup(body, diff, win, prog) {
    const hn = [3, 4, 4][diff], ln = [4, 6, 8][diff];
    const houses = HOUSES.slice(0, hn);
    const letters = shuffle(Array.from({ length: ln }, (_, i) => i % hn));
    body.innerHTML = `<p class="g-hint">Mektubu pulundaki resimle aynı eve sürükle!</p>
      <div class="post">
        <div class="houses">${houses.map((h, i) => `<div class="house" data-h="${i}" style="--c:${h.c}"><div class="roof"></div><div class="wall"><span>${h.s}</span><div class="door"></div></div></div>`).join('')}</div>
        <div class="letters">${letters.map((h, i) => `<div class="letter" data-h="${h}" style="--c:${houses[h].c}"><div class="flap"></div><div class="stamp">${houses[h].s}</div></div>`).join('')}</div>
      </div>`;
    let left = ln;
    prog(`✉️ ${ln - left} / ${ln}`);
    body.querySelectorAll('.letter').forEach(el => {
      let sx, sy, drag = false;
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault(); el.setPointerCapture(e.pointerId);
        sx = e.clientX; sy = e.clientY; drag = true; el.classList.add('dragging'); el.style.transition = 'none'; Sound.play('tap');
      });
      el.addEventListener('pointermove', (e) => {
        if (!drag) return;
        el.style.transform = `translate(${e.clientX - sx}px, ${e.clientY - sy}px) scale(1.1) rotate(-4deg)`;
      });
      const end = (e) => {
        if (!drag) return; drag = false; el.classList.remove('dragging');
        const house = [...body.querySelectorAll('.house')].find(h => {
          const r = h.getBoundingClientRect();
          return e.clientX > r.left - 10 && e.clientX < r.right + 10 && e.clientY > r.top - 10 && e.clientY < r.bottom + 30;
        });
        el.style.transition = '';
        if (house && house.dataset.h === el.dataset.h) {
          const hr = house.getBoundingClientRect(), er = el.getBoundingClientRect();
          const tx = e.clientX - sx + (hr.left + hr.width / 2 - (er.left + er.width / 2));
          const ty = e.clientY - sy + (hr.top + hr.height / 2 - (er.top + er.height / 2));
          el.style.transform = `translate(${tx}px, ${ty}px) scale(.2)`; el.style.opacity = '0';
          el.classList.add('sent');
          house.classList.remove('happy'); void house.offsetWidth; house.classList.add('happy');
          Sound.play('good'); left--; prog(`✉️ ${ln - left} / ${ln}`);
          setTimeout(() => el.style.visibility = 'hidden', 350);
          if (!left) { setTimeout(() => Sound.play('win'), 300); setTimeout(win, 1100); }
        } else {
          if (house) { house.classList.remove('nope'); void house.offsetWidth; house.classList.add('nope'); Sound.play('bad'); }
          el.style.transform = '';
        }
      };
      el.addEventListener('pointerup', end);
      el.addEventListener('pointercancel', end);
    });
  }

  // ---------------------------------------------------------
  // 5) MERCAN BAHÇESİ — hafıza kartları
  // ---------------------------------------------------------
  const FACES = ['🐠', '🐚', '⭐', '🦀', '🐙', '🪼', '🐡', '🌸'];
  function hafiza(body, diff, win, prog) {
    const pairs = [4, 6, 8][diff];
    const deck = shuffle([...FACES.slice(0, pairs), ...FACES.slice(0, pairs)]);
    const n = deck.length, land = body.clientWidth > body.clientHeight;
    const cols = land ? (n <= 12 ? n / 2 : 8) : (n <= 8 ? 2 : n <= 12 ? 3 : 4);
    body.innerHTML = `<p class="g-hint">İki kart aç, aynı resimleri bul!</p>
      <div class="memory" style="--cols:${cols};--rows:${deck.length / cols}">${deck.map((f, i) => `<button class="card" data-f="${f}"><span class="back"></span><span class="front">${f}</span></button>`).join('')}</div>`;
    let open = [], lock = false, matched = 0, tries = 0;
    prog(`🌸 0 / ${pairs}`);
    body.querySelectorAll('.card').forEach(c => c.addEventListener('click', () => {
      if (lock || c.classList.contains('flip')) return;
      c.classList.add('flip'); Sound.play('tap'); open.push(c);
      if (open.length < 2) return;
      tries++;
      const [a, b] = open; open = [];
      if (a.dataset.f === b.dataset.f) {
        matched++; prog(`🌸 ${matched} / ${pairs}`);
        setTimeout(() => { a.classList.add('match'); b.classList.add('match'); Sound.play('good'); }, 250);
        if (matched === pairs) { setTimeout(() => Sound.play('win'), 600); setTimeout(win, 1400); }
      } else {
        lock = true;
        setTimeout(() => { a.classList.remove('flip'); b.classList.remove('flip'); lock = false; }, 900);
      }
    }));
  }

  return { inciler, fener, labirent, mektup, hafiza };
})();
