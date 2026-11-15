// =============================================================
// Deniz kızı çizimi — katmanlı SVG
// Avatar.render(look, {viewBox}) → <svg> metni
// Koordinat sistemi: 300 x 480. Baş merkezi (150,120).
// =============================================================

const Avatar = (() => {
  let uid = 0;
  const byId = (cat, id) => ITEMS[cat].find(i => i.id === id) || ITEMS[cat][0];
  const MIRROR = 'transform="translate(300 0) scale(-1 1)"';

  // ---------- renk yardımcıları ----------
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const f = (c) => Math.max(0, Math.min(255, Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt)));
    return '#' + [f(r), f(g), f(b)].map(c => c.toString(16).padStart(2, '0')).join('');
  }
  const mid = (cols) => cols[Math.floor(cols.length / 2)];
  function stops(cols) {
    return cols.map((c, i) => `<stop offset="${cols.length === 1 ? 0 : i / (cols.length - 1)}" stop-color="${c}"/>`).join('');
  }

  // ---------- küçük şekiller ----------
  function star(cx, cy, R, r, rot = -90) {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = (rot + i * 36) * Math.PI / 180, rr = i % 2 ? r : R;
      d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a)).toFixed(1) + ' ';
    }
    return d + 'Z';
  }
  function heart(cx, cy, s) {
    return `M${cx} ${cy + s * 0.9} C ${cx - s * 1.7} ${cy - s * 0.2} ${cx - s * 0.6} ${cy - s * 1.4} ${cx} ${cy - s * 0.4} C ${cx + s * 0.6} ${cy - s * 1.4} ${cx + s * 1.7} ${cy - s * 0.2} ${cx} ${cy + s * 0.9} Z`;
  }
  function shell(cx, cy, s, fill, line) {
    const d = `M${cx - s * 0.25} ${cy + s * 0.55} L${cx - s} ${cy - s * 0.1} Q${cx - s * 0.9} ${cy - s * 0.85} ${cx} ${cy - s * 0.92} Q${cx + s * 0.9} ${cy - s * 0.85} ${cx + s} ${cy - s * 0.1} L${cx + s * 0.25} ${cy + s * 0.55} Z`;
    let ribs = '';
    for (let a = -60; a <= 60; a += 30) {
      const rad = (a - 90) * Math.PI / 180;
      ribs += `M${cx} ${cy + s * 0.5} L${(cx + s * 0.85 * Math.cos(rad)).toFixed(1)} ${(cy + s * 0.5 + s * 1.2 * Math.sin(rad)).toFixed(1)} `;
    }
    return `<path d="${d}" fill="${fill}" stroke="${line}" stroke-width="2" stroke-linejoin="round"/>
      <path d="${ribs}" stroke="${line}" stroke-width="1.4" opacity=".6" fill="none"/>
      <rect x="${cx - s * 0.3}" y="${cy + s * 0.45}" width="${s * 0.6}" height="${s * 0.22}" rx="${s * 0.1}" fill="${line}" opacity=".7"/>`;
  }
  const pearl = (p, x, y, r) =>
    `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="url(#${p}pearl)"/><circle cx="${(x - r * 0.35).toFixed(1)}" cy="${(y - r * 0.35).toFixed(1)}" r="${(r * 0.32).toFixed(1)}" fill="#fff"/>`;
  const sparkle = (x, y, s, c = '#fff') =>
    `<path d="M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s} Z" fill="${c}"/>`;
  // Saç üstünde bir yay boyunca noktalar (taçlar için)
  function arc(n, a0, a1, rx = 64, ry = 70, cx = 150, cy = 122) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0.5 : i / (n - 1);
      const a = (a0 + (a1 - a0) * t) * Math.PI / 180;
      pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
    }
    return pts;
  }

  // ---------- SAÇ ----------
  const BANGS = 'M88 138 C 82 80 110 50 150 50 C 192 50 218 80 212 138 C 206 120 200 106 190 98 C 184 112 168 114 152 104 C 140 114 120 114 112 100 C 104 110 94 122 88 138 Z';
  const SHORT_BACK = 'M150 50 C 90 50 78 100 82 150 C 84 178 86 194 100 202 C 120 208 180 208 200 202 C 214 194 216 178 218 150 C 222 100 210 50 150 50 Z';
  function hairShapes(style, f, s) {
    const P = (d, extra = '') => `<path d="${d}" fill="${f}" stroke="${s}" stroke-width="2" stroke-linejoin="round" ${extra}/>`;
    const C = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" stroke="${s}" stroke-width="2"/>`;
    const shine = '<path d="M114 70 Q150 54 186 70" stroke="#fff" stroke-opacity=".55" stroke-width="5" fill="none" stroke-linecap="round"/>';
    switch (style) {
      case 'bob':
        return {
          back: P(SHORT_BACK),
          front: P('M86 142 C 80 82 110 50 150 50 C 190 50 220 82 214 142 C 208 124 204 108 198 100 C 182 108 166 104 150 108 C 134 104 118 108 102 100 C 96 108 92 124 86 142 Z') + shine,
        };
      case 'topuz':
        return {
          back: P('M150 50 C 90 50 80 100 84 140 C 86 160 92 172 104 178 L 196 178 C 208 172 214 160 216 140 C 220 100 210 50 150 50 Z') +
            C(150, 38, 30) + '<path d="M128 30 Q150 16 172 30" stroke="#fff" stroke-opacity=".5" stroke-width="4" fill="none" stroke-linecap="round"/>' +
            '<ellipse cx="150" cy="64" rx="20" ry="7" fill="#ff8fb8" stroke="#e0638f" stroke-width="2"/>',
          front: P(BANGS) + shine,
        };
      case 'orgu': {
        let braid = '';
        for (let i = 0; i < 7; i++) braid += `<ellipse cx="${97 - i * 0.8}" cy="${160 + i * 22}" rx="15" ry="14" fill="${f}" stroke="${s}" stroke-width="2"/>`;
        braid += `<path d="${heart(92, 318, 8)}" fill="#ff8fb8" stroke="#e0638f" stroke-width="1.5"/>`;
        braid += `<path d="M86 322 L80 340 M98 322 L104 340" stroke="${f}" stroke-width="6" stroke-linecap="round"/>`;
        return { back: P(SHORT_BACK), front: P(BANGS) + shine + braid + `<g ${MIRROR}>${braid}</g>` };
      }
      case 'atkuyrugu':
        return {
          back: P('M178 64 C 236 40 270 104 252 170 C 240 216 256 262 238 306 C 222 276 214 246 220 206 C 226 160 228 112 186 84 Z') + P(SHORT_BACK),
          front: P(BANGS) + shine + '<circle cx="186" cy="66" r="9" fill="#ff8fb8" stroke="#e0638f" stroke-width="2"/>',
        };
      case 'bulut': {
        const back = [[100, 66], [124, 46], [150, 40], [176, 46], [200, 66], [212, 98], [218, 136], [214, 174], [202, 206], [180, 228], [98, 206], [86, 174], [82, 136], [88, 98], [120, 228]]
          .map(([x, y]) => C(x, y, 28)).join('');
        const front = [[94, 116, 16], [206, 116, 16], [106, 86, 21], [194, 86, 21], [126, 72, 23], [174, 72, 23], [150, 66, 24]]
          .map(([x, y, r]) => C(x, y, r)).join('');
        return { back, front: front + '<path d="M122 62 Q150 50 178 62" stroke="#fff" stroke-opacity=".55" stroke-width="4" fill="none" stroke-linecap="round"/>' };
      }
      default: { // uzun
        const lock = P('M92 124 C 78 170 94 214 82 260 C 98 250 108 214 106 180 C 105 158 102 138 100 126 Z');
        return {
          back: P('M150 48 C 92 48 76 95 79 140 C 82 190 68 232 74 272 C 78 302 66 322 84 344 C 95 328 104 333 113 318 C 108 290 117 262 113 232 L 187 232 C 183 262 192 290 187 318 C 196 333 205 328 216 344 C 234 322 222 302 226 272 C 232 232 218 190 221 140 C 224 95 208 48 150 48 Z'),
          front: P(BANGS) + shine + lock + `<g ${MIRROR}>${lock}</g>`,
        };
      }
    }
  }

  // ---------- KUYRUK ----------
  const TAIL_BODY = 'M126 258 C 114 300 120 336 136 368 C 148 392 160 405 166 418 L 184 414 C 184 396 181 378 177 360 C 169 324 188 292 174 258 Z';
  function fin(style, p, line) {
    const F = (d, op = 1) => `<path d="${d}" fill="url(#${p}tail)" stroke="${line}" stroke-width="2" stroke-linejoin="round" opacity="${op}"/>`;
    const ribs = (pts) => `<path d="${pts.map(([x, y]) => `M175 424 L${x} ${y}`).join(' ')}" stroke="#fff" stroke-opacity=".6" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    switch (style) {
      case 'yelpaze':
        return F('M168 412 C 118 418 88 450 92 478 C 116 468 136 478 156 466 C 166 480 186 480 196 466 C 214 478 236 470 256 478 C 260 448 230 418 184 408 Z') +
          ribs([[110, 462], [136, 466], [176, 468], [214, 466], [240, 462]]);
      case 'tul':
        return F('M168 412 C 120 398 66 418 34 472 C 76 456 116 462 148 450 C 138 466 150 476 170 470 C 202 480 244 470 274 448 C 242 440 212 424 184 410 Z', 0.92) +
          F('M170 420 C 130 420 96 440 76 468 C 110 456 140 458 160 452 Z', 0.6) +
          ribs([[70, 460], [120, 452], [170, 466], [230, 462]]);
      case 'dalgali':
        return F('M166 414 C 148 420 128 418 108 432 C 118 442 98 450 94 464 C 116 458 128 468 142 458 C 152 468 166 462 175 446 C 184 462 198 468 208 458 C 222 468 234 458 256 464 C 250 450 232 440 242 432 C 222 418 202 420 184 410 Z') +
          ribs([[112, 452], [142, 452], [175, 444], [208, 452], [238, 452]]);
      default:
        return F('M166 414 C 140 425 112 440 98 468 C 128 470 156 460 175 438 C 190 460 216 472 248 470 C 236 446 210 426 184 410 Z') +
          ribs([[112, 460], [146, 456], [206, 458], [236, 462]]);
    }
  }

  // ---------- ÜST ----------
  const BANDEAU = 'M121 202 C 140 196 160 196 179 202 L 177 232 C 160 238 140 238 123 232 Z';
  function top(id, p) {
    switch (id) {
      case 'yosun':
        return `<path d="M121 202 C 140 196 160 196 179 202 L 177 228 C 172 236 168 228 162 236 C 156 230 150 240 144 232 C 138 240 132 230 126 236 C 123 230 123 232 123 228 Z" fill="url(#${p}top)" stroke="#3f9a75" stroke-width="2" stroke-linejoin="round"/>
          <path d="M130 206 Q136 216 132 228 M150 204 Q156 216 150 230 M170 206 Q164 216 168 228" stroke="#e4ffe9" stroke-width="1.6" fill="none" opacity=".8"/>`;
      case 'inci': {
        let pearls = '';
        for (let i = 0; i <= 10; i++) { const t = i / 10, x = 124 + 52 * t, y = 233 + 12 * Math.sin(Math.PI * t); pearls += pearl(p, x, y, 3.2); }
        for (let i = 0; i <= 6; i++) { const t = i / 6, x = 133 + 34 * t, y = 236 + 18 * Math.sin(Math.PI * t); pearls += pearl(p, x, y, 2.6); }
        return `<path d="${BANDEAU}" fill="url(#${p}top)" stroke="#e7a7c4" stroke-width="2"/>` + pearls + pearl(p, 150, 205, 5);
      }
      case 'yildiz':
        return `<path d="${BANDEAU}" fill="url(#${p}top)" stroke="#e3a53f" stroke-width="2"/>
          <path d="${star(150, 217, 13, 6)}" fill="#fffbe6" stroke="#e3a53f" stroke-width="1.5" stroke-linejoin="round"/>
          <path d="${star(131, 212, 5, 2.3)}" fill="#fff"/><path d="${star(169, 222, 5, 2.3)}" fill="#fff"/>`;
      case 'mercan': {
        const br = '<path d="M128 204 Q120 192 112 186 M120 194 Q116 184 120 176 M124 199 Q130 188 128 180" stroke="#ff7f8f" stroke-width="5" fill="none" stroke-linecap="round"/>';
        return br + `<g ${MIRROR}>${br}</g><path d="${BANDEAU}" fill="url(#${p}top)" stroke="#e0607a" stroke-width="2"/>
          <circle cx="138" cy="216" r="3" fill="#fff" opacity=".7"/><circle cx="150" cy="222" r="3" fill="#fff" opacity=".7"/><circle cx="162" cy="216" r="3" fill="#fff" opacity=".7"/>`;
      }
      case 'denizanasi':
        return `<path d="M120 200 C 140 192 160 192 180 200 L 178 230 Q 172 240 166 230 Q 160 240 154 230 Q 148 240 142 230 Q 136 240 130 230 Q 124 240 122 230 Z" fill="url(#${p}top)" stroke="#a487e0" stroke-width="2" stroke-linejoin="round" opacity=".95"/>
          <path d="M136 234 q4 8 0 16 M150 236 q-4 8 0 18 M164 234 q4 8 0 16" stroke="#c9b2ff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <circle cx="140" cy="212" r="3" fill="#fff" opacity=".8"/><circle cx="160" cy="210" r="2.4" fill="#fff" opacity=".8"/>`;
      default: // kabuk
        return `<path d="M122 213 Q150 224 178 213" stroke="#c9a2e8" stroke-width="3" fill="none"/>` +
          shell(136, 214, 17, `url(#${p}top)`, '#b98bd6') + shell(164, 214, 17, `url(#${p}top)`, '#b98bd6');
    }
  }
  const TOP_COLORS = {
    kabuk: ['#ffe9f6', '#e5c9ff'], yosun: ['#b8f0c6', '#5fbf93'], inci: ['#fff0f6', '#ffd0e4'],
    yildiz: ['#fff4b8', '#ffcf6b'], mercan: ['#ffd0c8', '#ff8f9a'], denizanasi: ['#f1e8ff', '#c7b0f7'],
  };

  // ---------- MAKYAJ ----------
  function makeup(id) {
    switch (id) {
      case 'allik': return '<ellipse cx="114" cy="152" rx="12" ry="7" fill="#ff8fab" opacity=".55"/><ellipse cx="186" cy="152" rx="12" ry="7" fill="#ff8fab" opacity=".55"/>';
      case 'dudak': return 'LIPS';
      case 'far': return 'SHADOW';
      case 'parilti':
        return sparkle(104, 124, 7, '#fff7b0') + sparkle(196, 124, 7, '#fff7b0') + sparkle(110, 156, 4, '#fff') + sparkle(190, 156, 4, '#fff') +
          '<circle cx="118" cy="160" r="1.6" fill="#fff"/><circle cx="182" cy="160" r="1.6" fill="#fff"/><circle cx="104" cy="146" r="1.4" fill="#ffe680"/><circle cx="196" cy="146" r="1.4" fill="#ffe680"/>' +
          '<ellipse cx="114" cy="152" rx="10" ry="6" fill="#ffb3c7" opacity=".45"/><ellipse cx="186" cy="152" rx="10" ry="6" fill="#ffb3c7" opacity=".45"/>';
      case 'kalp': return `<path d="${heart(113, 152, 6)}" fill="#ff7fa3" opacity=".85"/><path d="${heart(187, 152, 6)}" fill="#ff7fa3" opacity=".85"/>`;
      case 'yildizcil':
        return [[112, 148], [120, 154], [106, 155], [188, 148], [180, 154], [194, 155]].map(([x, y]) => `<path d="${star(x, y, 3.2, 1.4)}" fill="#f2a64a"/>`).join('') +
          '<ellipse cx="114" cy="152" rx="10" ry="6" fill="#ffb3c7" opacity=".35"/><ellipse cx="186" cy="152" rx="10" ry="6" fill="#ffb3c7" opacity=".35"/>';
      default: return '<ellipse cx="114" cy="152" rx="10" ry="6" fill="#ffb3c7" opacity=".3"/><ellipse cx="186" cy="152" rx="10" ry="6" fill="#ffb3c7" opacity=".3"/>';
    }
  }

  // ---------- TAÇ / TOKA ----------
  function crown(id, p) {
    switch (id) {
      case 'kabuktoka': return shell(198, 78, 17, '#ffd3e6', '#e08bb0') + pearl(p, 198, 86, 3.5);
      case 'yildiztoka':
        return `<path d="${star(200, 80, 19, 9)}" fill="#ffa07a" stroke="#e9795a" stroke-width="5" stroke-linejoin="round"/>` +
          [[200, 70], [208, 78], [205, 89], [195, 89], [192, 78]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#fff3e8"/>`).join('');
      case 'incitac': {
        const pts = arc(9, 205, 335, 60, 64);
        return `<path d="M${pts.map(q => q.join(' ')).join(' L')}" stroke="#e9c46a" stroke-width="3" fill="none"/>` +
          `<path d="M140 62 L150 36 L160 62 Z" fill="#ffe08a" stroke="#d9a93e" stroke-width="2" stroke-linejoin="round"/>` +
          pts.map(([x, y], i) => pearl(p, x, y - 2, i === 4 ? 0 : 5)).join('') + pearl(p, 150, 34, 8);
      }
      case 'cicektac': {
        const cols = ['#ff9ec4', '#ffd36b', '#b5a4ff', '#8fe3d0', '#ff9ec4', '#ffd36b', '#b5a4ff'];
        return arc(7, 200, 340, 62, 66).map(([x, y], i) => {
          let petals = '';
          for (let k = 0; k < 5; k++) { const a = k * 72 * Math.PI / 180; petals += `<circle cx="${(x + 6 * Math.cos(a)).toFixed(1)}" cy="${(y + 6 * Math.sin(a)).toFixed(1)}" r="5.5" fill="${cols[i]}"/>`; }
          return petals + `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5" fill="#fff6c9"/>`;
        }).join('');
      }
      case 'mercantac': {
        const br = (x, h, lean) => `<path d="M${x} 66 Q${x + lean} ${66 - h * 0.6} ${x + lean * 1.5} ${66 - h} M${x + lean * 0.6} ${66 - h * 0.45} Q${x + lean * 0.6 + 9} ${66 - h * 0.7} ${x + lean * 0.6 + 12} ${66 - h * 0.85} M${x + lean * 0.8} ${66 - h * 0.6} Q${x + lean * 0.8 - 9} ${66 - h * 0.8} ${x + lean * 0.8 - 11} ${66 - h * 0.95}" stroke="#ff7f8f" stroke-width="6" fill="none" stroke-linecap="round"/>`;
        return `<path d="M108 74 Q150 50 192 74" stroke="#ff9faa" stroke-width="8" fill="none" stroke-linecap="round"/>` +
          br(118, 34, -6) + br(150, 46, 0) + br(182, 34, 6) + pearl(p, 150, 60, 5);
      }
      case 'denizanasi':
        return `<path d="M100 82 C 96 18 204 18 200 82 Q 186 74 175 82 Q 162 74 150 82 Q 138 74 125 82 Q 114 74 100 82 Z" fill="#e7d6ff" fill-opacity=".85" stroke="#a487e0" stroke-width="2.5" stroke-linejoin="round"/>
          <path d="M108 82 q-8 20 2 38 q8 18 -2 36 M192 82 q8 20 -2 38 q-8 18 2 36" stroke="#c9b2ff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".9"/>
          <circle cx="132" cy="48" r="5" fill="#fff" opacity=".8"/><circle cx="166" cy="40" r="4" fill="#ffc6ec"/><circle cx="178" cy="58" r="3.5" fill="#fff" opacity=".8"/>
          <path d="M120 40 Q140 26 162 30" stroke="#fff" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>`;
      default: return '';
    }
  }

  // ---------- KOLYE ----------
  function necklace(id, p) {
    const cord = '<path d="M136 188 Q150 206 164 188" stroke="#c99a5a" stroke-width="1.8" fill="none"/>';
    switch (id) {
      case 'inci': {
        let s = '';
        for (let i = 0; i <= 8; i++) { const t = i / 8; s += pearl(p, 134 + 32 * t, 189 + 14 * Math.sin(Math.PI * t), 3.3); }
        return s;
      }
      case 'kabuk': return cord + shell(150, 204, 8, '#ffe0ee', '#d993b6');
      case 'yildiz': return cord + `<path d="${star(150, 204, 8, 3.6)}" fill="#ffd36b" stroke="#e3a53f" stroke-width="2.5" stroke-linejoin="round"/>`;
      case 'kalp': return cord + `<path d="${heart(150, 203, 6.5)}" fill="#ff7fa3" stroke="#e0507b" stroke-width="1.5"/><circle cx="147" cy="200" r="1.5" fill="#fff"/>`;
      default: return '';
    }
  }

  // ---------- ANA ÇİZİM ----------
  function render(look, opts = {}) {
    const p = 'av' + (++uid) + '_';
    const L = Object.assign({}, DEFAULT_LOOK, look || {});
    const skin = byId('skin', L.skin).color;
    const skinLine = shade(skin, -0.28);
    const eye = byId('eyes', L.eyes).color;
    const hc = byId('hairColor', L.hairColor).colors;
    const hairLine = shade(hc[hc.length - 1], -0.25);
    const brow = shade(hc[hc.length - 1], -0.35);
    const tc = byId('tailColor', L.tailColor).colors;
    const tailLine = shade(tc[tc.length - 2] || tc[0], -0.25);
    const topc = TOP_COLORS[L.top] || TOP_COLORS.kabuk;
    const hair = hairShapes(L.hair, `url(#${p}hair)`, hairLine);
    const mk = makeup(L.makeup);

    const defs = `<defs>
      <linearGradient id="${p}hair" x1="0" y1="0" x2=".35" y2="1">${stops(hc)}</linearGradient>
      <linearGradient id="${p}tail" x1="0" y1="0" x2="1" y2="1">${stops(tc)}</linearGradient>
      <linearGradient id="${p}top" x1="0" y1="0" x2="0" y2="1">${stops(topc)}</linearGradient>
      <linearGradient id="${p}skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(skin, 0.12)}"/><stop offset="1" stop-color="${skin}"/></linearGradient>
      <radialGradient id="${p}pearl" cx=".35" cy=".35" r=".75"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#f6e9f7"/><stop offset="1" stop-color="#cdbde3"/></radialGradient>
      <radialGradient id="${p}iris" cx=".5" cy=".65" r=".6"><stop offset="0" stop-color="${shade(eye, 0.45)}"/><stop offset="1" stop-color="${shade(eye, -0.15)}"/></radialGradient>
      <pattern id="${p}scale" width="16" height="24" patternUnits="userSpaceOnUse">
        <path d="M0 12 Q8 0 16 12 M-8 24 Q0 12 8 24 M8 24 Q16 12 24 24" stroke="#fff" stroke-opacity=".6" stroke-width="1.6" fill="none"/>
      </pattern>
    </defs>`;

    const eyeOne = `
      ${mk === 'SHADOW' ? '<path d="M112 126 Q128 104 144 124 Q128 114 112 126 Z" fill="#8fd3ff" opacity=".85"/>' : ''}
      <ellipse cx="128" cy="133" rx="12.5" ry="14.5" fill="#fff"/>
      <ellipse cx="129" cy="135" rx="10" ry="11.5" fill="url(#${p}iris)"/>
      <ellipse cx="129" cy="136" rx="5" ry="6" fill="#1d2340"/>
      <circle cx="133" cy="130" r="3.8" fill="#fff"/><circle cx="125" cy="140" r="1.8" fill="#fff"/>
      <path d="M114 128 Q127 113 142 125" stroke="#3a2a3a" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <path d="M115 126 L109 120 M118 122 L114 115" stroke="#3a2a3a" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M117 112 Q127 106 138 110" stroke="${brow}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;

    const mouth = mk === 'LIPS'
      ? '<path d="M140 155 Q150 166 160 155 Q150 159 140 155 Z" fill="#ff5f8f" stroke="#e0457a" stroke-width="1.5" stroke-linejoin="round"/><ellipse cx="146" cy="160" rx="3" ry="1.3" fill="#fff" opacity=".6"/>'
      : '<path d="M141 155 Q150 165 159 155 Q150 159 141 155 Z" fill="#e2687f" stroke="#c4566b" stroke-width="1.6" stroke-linejoin="round"/>';
    const face = `
      ${eyeOne}<g ${MIRROR}>${eyeOne}</g>
      <path d="M147 146 Q150 149 153 146" stroke="${skinLine}" stroke-width="2" fill="none" stroke-linecap="round"/>
      ${mouth}
      ${mk === 'LIPS' || mk === 'SHADOW' ? makeup('yok') : mk}`;

    const arm = `<path d="M124 200 C 108 214 100 236 98 262 C 98 270 108 272 110 264 C 112 244 118 226 130 214 Z" fill="url(#${p}skin)" stroke="${skinLine}" stroke-width="1.6"/><circle cx="103" cy="266" r="8" fill="${skin}" stroke="${skinLine}" stroke-width="1.6"/>`;
    const frill = `<path d="M130 262 C 112 262 98 276 94 292 C 108 286 120 284 134 280 Z" fill="${tc[0]}" stroke="${tailLine}" stroke-width="1.6" opacity=".9"/>`;

    let waist = '';
    for (let i = 0; i < 7; i++) waist += `<path d="M${126 + i * 7} 262 q3.5 7 7 0" fill="${tc[1] || tc[0]}" stroke="${tailLine}" stroke-width="1.3"/>`;

    const svg = `
      ${hair.back}
      <g class="tail">
        ${fin(L.tail, p, tailLine)}
        <path d="${TAIL_BODY}" fill="url(#${p}tail)" stroke="${tailLine}" stroke-width="2" stroke-linejoin="round"/>
        <path d="${TAIL_BODY}" fill="url(#${p}scale)"/>
        <path d="M134 280 Q128 320 146 362" stroke="#fff" stroke-opacity=".55" stroke-width="5" fill="none" stroke-linecap="round"/>
      </g>
      ${frill}<g ${MIRROR}>${frill}</g>
      ${arm}<g ${MIRROR}>${arm}</g>
      <path d="M120 198 C 134 188 166 188 180 198 C 178 226 172 246 168 264 L 132 264 C 128 246 122 226 120 198 Z" fill="url(#${p}skin)" stroke="${skinLine}" stroke-width="1.6"/>
      <ellipse cx="150" cy="250" rx="2" ry="2.5" fill="${skinLine}" opacity=".5"/>
      ${waist}
      <rect x="141" y="166" width="18" height="30" rx="7" fill="${skin}" stroke="${skinLine}" stroke-width="1.4"/>
      ${top(L.top, p)}
      ${necklace(L.necklace, p)}
      <ellipse cx="150" cy="120" rx="58" ry="60" fill="url(#${p}skin)" stroke="${skinLine}" stroke-width="1.8"/>
      ${face}
      ${hair.front}
      ${crown(L.crown, p)}`;

    const vb = opts.viewBox || '0 0 300 480';
    return `<svg class="${opts.cls || 'mermaid'}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">${defs}<g class="mm-body">${svg}</g></svg>`;
  }

  // Gardırop küçük resimleri için kırpma alanları
  const CROP = {
    skin: '82 52 136 136', eyes: '104 104 92 52', hair: '40 14 220 250', hairColor: '40 14 220 250',
    tail: '30 240 250 240', tailColor: '30 240 250 240', top: '94 172 112 84', makeup: '92 96 116 80',
    crown: '76 0 148 150', necklace: '108 166 84 60',
  };

  return { render, CROP, shade, star, heart, shell };
})();
