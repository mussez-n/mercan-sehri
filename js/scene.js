// =============================================================
// Şehir haritası, dekor ve şehir sakinleri (NPC) çizimleri
// =============================================================

const Scene = (() => {
  function rng(seed) {
    let s = seed % 2147483647; if (s <= 0) s += 2147483646;
    return () => (s = (s * 16807) % 2147483647, (s - 1) / 2147483646);
  }

  // ---------- dekor ----------
  function coral(x, y, s, color, seed) {
    const R = rng(seed);
    let out = '';
    function branch(bx, by, ang, len, w, depth) {
      const ex = bx + Math.cos(ang) * len, ey = by + Math.sin(ang) * len;
      const cx = bx + Math.cos(ang + (R() - .5) * .8) * len * .5, cy = by + Math.sin(ang + (R() - .5) * .8) * len * .5;
      out += `<path d="M${bx.toFixed(1)} ${by.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}" stroke-width="${w.toFixed(1)}"/>`;
      if (depth > 0) {
        branch(ex, ey, ang - .35 - R() * .4, len * (.62 + R() * .2), w * .72, depth - 1);
        branch(ex, ey, ang + .35 + R() * .4, len * (.62 + R() * .2), w * .72, depth - 1);
      } else out += `<circle cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="${(w * .75).toFixed(1)}" fill="${color}" stroke="none"/>`;
    }
    branch(x, y, -Math.PI / 2 - .5, 55 * s, 13 * s, 3);
    branch(x, y, -Math.PI / 2, 70 * s, 15 * s, 3);
    branch(x, y, -Math.PI / 2 + .5, 55 * s, 13 * s, 3);
    return `<g stroke="${color}" fill="none" stroke-linecap="round">${out}</g>`;
  }
  function seaweed(x, y, h, color, delay = 0, w = 9) {
    return `<path class="sway" style="animation-delay:${delay}s" d="M${x} ${y} C ${x - 18} ${y - h * .33}, ${x + 18} ${y - h * .66}, ${x} ${y - h}" stroke="${color}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
  }
  function fanCoral(x, y, s, color) {
    let veins = '';
    for (let a = -70; a <= 70; a += 20) {
      const r = a * Math.PI / 180;
      veins += `M${x} ${y} L${(x + Math.sin(r) * 60 * s).toFixed(1)} ${(y - Math.cos(r) * 60 * s).toFixed(1)} `;
    }
    return `<path d="M${x - 60 * s} ${y - 20 * s} Q${x - 60 * s} ${y - 75 * s} ${x} ${y - 75 * s} Q${x + 60 * s} ${y - 75 * s} ${x + 60 * s} ${y - 20 * s} L${x} ${y} Z" fill="${color}" opacity=".85"/>
      <path d="${veins}" stroke="#fff" stroke-opacity=".45" stroke-width="${2 * s}" fill="none"/>`;
  }
  function starfish(x, y, s, color) {
    return `<path d="${Avatar.star(x, y, 16 * s, 7 * s, -90 + x % 30)}" fill="${color}" stroke="${color}" stroke-width="${5 * s}" stroke-linejoin="round"/>`;
  }
  function bubbleDots(R, n, w, h) {
    let s = '';
    for (let i = 0; i < n; i++) s += `<circle cx="${(R() * w).toFixed(0)}" cy="${(R() * h).toFixed(0)}" r="${(2 + R() * 6).toFixed(1)}" fill="#fff" opacity="${(.15 + R() * .3).toFixed(2)}"/>`;
    return s;
  }

  function cityLayer(R, n, baseY, minH, maxH, color, op, win) {
    let s = `<g fill="${color}" opacity="${op}">`;
    for (let i = 0; i < n; i++) {
      const x = i * (2000 / n) + R() * 40 - 20, w = 50 + R() * 60, h = minH + R() * (maxH - minH), top = baseY - h;
      s += `<rect x="${x}" y="${top}" width="${w}" height="${h}" rx="6"/>`;
      const kind = R();
      if (kind < .5) s += `<path d="M${x - 4} ${top + 4} Q${x + w / 2} ${top - w * .9} ${x + w + 4} ${top + 4} Z"/><rect x="${x + w / 2 - 2}" y="${top - w * .75 - 26}" width="4" height="30"/>`;
      else if (kind < .8) s += `<path d="M${x} ${top + 2} L${x + w / 2} ${top - w * 1.1} L${x + w} ${top + 2} Z"/>`;
      else s += `<ellipse cx="${x + w / 2}" cy="${top}" rx="${w * .65}" ry="${w * .3}"/>`;
      if (win) for (let k = top + 30; k < baseY - 40; k += 46) s += `<path d="M${x + w / 2 - 8} ${k + 22} V${k + 8} Q${x + w / 2} ${k - 2} ${x + w / 2 + 8} ${k + 8} V${k + 22} Z" fill="${win}"/>`;
    }
    return s + '</g>';
  }

  // ---------- ŞEHİR SAKİNLERİ ----------
  // Her biri (0,0) merkezli, yaklaşık 160x160 kutu.
  const EYE = (x, y, r = 12) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="#2b2b4a" stroke-width="1.5"/><circle cx="${x + r * .15}" cy="${y + r * .15}" r="${r * .62}" fill="#2b2b4a"/><circle cx="${x + r * .35}" cy="${y - r * .25}" r="${r * .28}" fill="#fff"/>`;
  const NPC = {
    pofi() {
      let spikes = '';
      for (let i = 0; i < 18; i++) {
        const a = i / 18 * Math.PI * 2, a1 = a - .12, a2 = a + .12;
        spikes += `M${(Math.cos(a1) * 46).toFixed(1)} ${(Math.sin(a1) * 46).toFixed(1)} L${(Math.cos(a) * 64).toFixed(1)} ${(Math.sin(a) * 64).toFixed(1)} L${(Math.cos(a2) * 46).toFixed(1)} ${(Math.sin(a2) * 46).toFixed(1)} Z `;
      }
      return `<path d="${spikes}" fill="#f0b245" stroke="#d9952c" stroke-width="2" stroke-linejoin="round"/>
        <path d="M44 -6 C 72 -26 82 14 50 12 Z" fill="#ffcf6b" stroke="#d9952c" stroke-width="2"/>
        <path d="M-44 -6 C -72 -26 -82 14 -50 12 Z" fill="#ffcf6b" stroke="#d9952c" stroke-width="2"/>
        <circle r="52" fill="#ffd970" stroke="#d9952c" stroke-width="3"/>
        <ellipse cy="20" rx="36" ry="26" fill="#fff4cf"/>
        <path d="M-30 -36 Q0 -50 30 -36" stroke="#fff" stroke-width="5" opacity=".6" fill="none" stroke-linecap="round"/>
        ${EYE(-19, -10, 14)}${EYE(19, -10, 14)}
        <ellipse cx="0" cy="16" rx="7" ry="6" fill="#e46b7a"/>
        <ellipse cx="-34" cy="12" rx="8" ry="5" fill="#ff9fb0" opacity=".7"/><ellipse cx="34" cy="12" rx="8" ry="5" fill="#ff9fb0" opacity=".7"/>`;
    },
    dalga() {
      return `<path d="M14 30 C 22 62 -2 80 -16 66 C -26 56 -12 46 -4 54" stroke="#f0a83e" stroke-width="16" fill="none" stroke-linecap="round"/>
        <path d="M14 30 C 22 62 -2 80 -16 66 C -26 56 -12 46 -4 54" stroke="#ffcf72" stroke-width="10" fill="none" stroke-linecap="round"/>
        <path d="M34 -14 Q60 -6 44 18 Q50 0 34 -2 Z" fill="#ffb3c7" stroke="#e0809f" stroke-width="2"/>
        <ellipse cx="12" cy="4" rx="26" ry="36" fill="#ffcf72" stroke="#e39a33" stroke-width="3"/>
        <path d="M-2 -14 Q-12 6 2 30" stroke="#fff0c2" stroke-width="10" fill="none" stroke-linecap="round" opacity=".9"/>
        <path d="M-8 -6 h10 M-10 6 h10 M-8 18 h10" stroke="#e39a33" stroke-width="2" stroke-linecap="round"/>
        <rect x="-46" y="-52" width="34" height="16" rx="8" fill="#ffcf72" stroke="#e39a33" stroke-width="3"/>
        <circle cx="4" cy="-46" r="26" fill="#ffcf72" stroke="#e39a33" stroke-width="3"/>
        <path d="M14 -70 l6 -10 l4 10 l8 -6 l0 12" fill="#ffb3c7" stroke="#e0809f" stroke-width="2" stroke-linejoin="round"/>
        <path d="M-22 -66 Q4 -92 28 -66 Z" fill="#4a7fd6" stroke="#2f5aa8" stroke-width="2.5"/>
        <rect x="-26" y="-68" width="56" height="7" rx="3.5" fill="#2f5aa8"/>
        <circle cx="4" cy="-80" r="5" fill="#ffd36b"/>
        ${EYE(-4, -48, 11)}
        <ellipse cx="-12" cy="-34" rx="6" ry="4" fill="#ff9fb0" opacity=".7"/>`;
    },
    tosba() {
      return `<ellipse cx="-56" cy="34" rx="20" ry="11" fill="#9fdc9a" stroke="#5aa66a" stroke-width="2.5"/>
        <ellipse cx="44" cy="38" rx="20" ry="11" fill="#9fdc9a" stroke="#5aa66a" stroke-width="2.5"/>
        <circle cx="72" cy="-6" r="26" fill="#9fdc9a" stroke="#5aa66a" stroke-width="3"/>
        <path d="M-66 24 C -66 -48 56 -48 56 24 Z" fill="#7cc77f" stroke="#4d9a5c" stroke-width="3"/>
        <path d="M-40 -18 L-14 -30 L12 -18 L12 6 L-14 16 L-40 6 Z M12 -18 L36 -26 M12 6 L44 10 M-40 6 L-58 14 M-40 -18 L-54 -24 M-14 16 L-14 24" stroke="#4d9a5c" stroke-width="3" fill="#a6e0a0" stroke-linejoin="round"/>
        <rect x="-70" y="20" width="130" height="12" rx="6" fill="#f3e3b5" stroke="#cdb57a" stroke-width="2"/>
        <circle cx="62" cy="-10" r="9" fill="#fff" stroke="#7a5a3a" stroke-width="3"/><circle cx="84" cy="-10" r="9" fill="#fff" stroke="#7a5a3a" stroke-width="3"/>
        <path d="M71 -10 h4" stroke="#7a5a3a" stroke-width="3"/>
        <circle cx="63" cy="-9" r="4" fill="#2b2b4a"/><circle cx="85" cy="-9" r="4" fill="#2b2b4a"/>
        <path d="M66 8 Q74 14 82 8" stroke="#3d6b45" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <circle cx="72" cy="-32" r="10" fill="#e9eef2" stroke="#b9c2c8" stroke-width="2"/>
        <circle cx="52" cy="-26" r="6" fill="#ff9ec4"/><circle cx="52" cy="-26" r="2.5" fill="#fff3a8"/>`;
    },
    okto() {
      let t = '';
      const legs = [[-40, -1], [-24, 1], [-8, -1], [8, 1], [24, -1], [40, 1]];
      legs.forEach(([x, d], i) => {
        t += `<path d="M${x} 10 C ${x + d * 6} 40, ${x + d * 26} 50, ${x + d * 18} 70" stroke="#a678e0" stroke-width="15" fill="none" stroke-linecap="round"/>`;
      });
      return t + `<rect x="46" y="20" width="34" height="24" rx="3" fill="#fff" stroke="#c9b9e6" stroke-width="2" transform="rotate(-12 63 32)"/>
        <path d="M48 24 L63 34 L78 22" stroke="#c9b9e6" stroke-width="2" fill="none" transform="rotate(-12 63 32)"/>
        <path d="${Avatar.heart(64, 34, 4)}" fill="#ff7fa3"/>
        <path d="M40 20 C 56 26 54 40 60 36" stroke="#b58aea" stroke-width="12" fill="none" stroke-linecap="round"/>
        <ellipse cx="0" cy="-18" rx="50" ry="46" fill="#b58aea" stroke="#8b5fcf" stroke-width="3"/>
        <circle cx="-22" cy="-40" r="5" fill="#d7bdf7"/><circle cx="26" cy="-44" r="4" fill="#d7bdf7"/><circle cx="34" cy="-22" r="3" fill="#d7bdf7"/>
        <path d="M-36 -52 Q0 -88 36 -52 Z" fill="#4a7fd6" stroke="#2f5aa8" stroke-width="2.5"/>
        <path d="M-40 -54 Q-10 -46 30 -52 Q40 -48 44 -44" stroke="#2f5aa8" stroke-width="7" fill="none" stroke-linecap="round"/>
        <circle cx="0" cy="-70" r="7" fill="#ffd36b" stroke="#e3a53f" stroke-width="2"/>
        ${EYE(-17, -18, 13)}${EYE(17, -18, 13)}
        <path d="M-8 6 Q0 14 8 6" stroke="#5a3a8a" stroke-width="3" fill="none" stroke-linecap="round"/>
        <ellipse cx="-32" cy="2" rx="7" ry="4" fill="#ff9fb0" opacity=".7"/><ellipse cx="32" cy="2" rx="7" ry="4" fill="#ff9fb0" opacity=".7"/>`;
    },
    kiskac() {
      const claw = `<path d="M-46 0 C -66 -10 -72 -30 -68 -44" stroke="#f2665a" stroke-width="10" fill="none" stroke-linecap="round"/>
        <path d="M-68 -44 C -94 -48 -96 -80 -72 -86 C -66 -74 -72 -66 -64 -62 C -56 -70 -46 -66 -48 -54 C -50 -46 -58 -42 -68 -44 Z" fill="#ff7d6e" stroke="#d94a3e" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M-40 16 L-62 30 L-66 44 M-38 24 L-56 42 L-58 54" stroke="#f2665a" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      return `${claw}<g transform="scale(-1 1)">${claw}</g>
        <path d="M-14 -26 L-18 -52 M14 -26 L18 -52" stroke="#f2665a" stroke-width="6" stroke-linecap="round"/>
        <ellipse cy="10" rx="54" ry="36" fill="#ff7d6e" stroke="#d94a3e" stroke-width="3"/>
        <path d="M-30 -10 Q0 -24 30 -10" stroke="#fff" stroke-width="5" opacity=".5" fill="none" stroke-linecap="round"/>
        ${EYE(-18, -56, 12)}${EYE(18, -56, 12)}
        <path d="M-12 18 Q0 28 12 18" stroke="#8a2a24" stroke-width="3" fill="none" stroke-linecap="round"/>
        <ellipse cx="-30" cy="14" rx="7" ry="4" fill="#ffc0c0" opacity=".8"/><ellipse cx="30" cy="14" rx="7" ry="4" fill="#ffc0c0" opacity=".8"/>
        <path d="M-40 -72 Q0 -100 40 -72 Q0 -80 -40 -72 Z" fill="#f6dc8a" stroke="#c9a54a" stroke-width="2.5"/>
        <path d="M-56 -70 Q0 -60 56 -70" stroke="#e9c86a" stroke-width="7" fill="none" stroke-linecap="round"/>
        <path d="M-20 -78 Q0 -84 20 -78" stroke="#7fc77f" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    },
    minik() {
      return `<ellipse cx="-30" cy="18" rx="12" ry="7" fill="#b5ecae" stroke="#5aa66a" stroke-width="2"/>
        <ellipse cx="26" cy="20" rx="12" ry="7" fill="#b5ecae" stroke="#5aa66a" stroke-width="2"/>
        <circle cx="42" cy="-4" r="17" fill="#b5ecae" stroke="#5aa66a" stroke-width="2.5"/>
        <path d="M-40 14 C -40 -32 34 -32 34 14 Z" fill="#8fd68f" stroke="#4d9a5c" stroke-width="2.5"/>
        <path d="M-20 -6 L-4 -14 L12 -6 L12 6 L-4 12 L-20 6 Z" fill="#b5ecae" stroke="#4d9a5c" stroke-width="2"/>
        ${EYE(44, -7, 7)}
        <path d="M42 6 Q48 10 54 6" stroke="#3d6b45" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    },
  };
  function npcSVG(id, size = 120) {
    return `<svg viewBox="-100 -100 200 200" width="${size}" height="${size}" class="npc-svg">${NPC[id]()}</svg>`;
  }

  // ---------- HARİTA ----------
  function map(state) {
    const R = rng(7);
    const done = (id) => (state.quests[id] || {}).done > 0;
    const lit = done('dalga'), bloom = done('kiskac');

    let s = `<svg id="map-svg" viewBox="0 0 2000 1000" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c8f6ef"/><stop offset=".35" stop-color="#78d6d2"/><stop offset=".75" stop-color="#3fa9b8"/><stop offset="1" stop-color="#2f8ea6"/></linearGradient>
      <linearGradient id="sand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6e7c6"/><stop offset="1" stop-color="#dcc79c"/></linearGradient>
      <radialGradient id="glow"><stop offset="0" stop-color="#fffbd0" stop-opacity=".95"/><stop offset=".4" stop-color="#fff2a0" stop-opacity=".45"/><stop offset="1" stop-color="#fff2a0" stop-opacity="0"/></radialGradient>
      <radialGradient id="mpearl" cx=".35" cy=".35"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#d8c8ec"/></radialGradient>
    </defs>
    <rect width="2000" height="1000" fill="url(#sea)"/>`;
    // ışık huzmeleri
    [[180, 120], [520, 160], [900, 110], [1250, 170], [1620, 130]].forEach(([x, w], i) => {
      s += `<path class="ray" style="animation-delay:${i * 1.3}s" d="M${x} 0 H${x + w} L${x + w * 2.8} 1000 H${x + w * 1.4} Z" fill="#fff" opacity=".09"/>`;
    });
    s += bubbleDots(R, 40, 2000, 700);
    // uzak şehir
    s += cityLayer(R, 26, 820, 220, 520, '#9fe0dc', .55);
    s += `<g class="whale"><path d="M0 0 C 40 -40 140 -40 180 -6 L 214 -30 L 210 6 L 230 30 L 186 14 C 140 40 40 40 0 0 Z" fill="#7cb8cf" opacity=".7"/><circle cx="30" cy="-6" r="4" fill="#3a6a80" opacity=".7"/></g>`;
    s += cityLayer(R, 15, 860, 140, 330, '#c3efe6', .9, '#8fd3d0');
    // deniz tabanı
    s += `<path d="M0 820 Q 250 780 500 815 T 1000 805 T 1500 815 T 2000 800 V1000 H0 Z" fill="url(#sand)"/>`;
    s += `<path d="M0 860 Q 300 835 600 858 T 1200 852 T 2000 850" stroke="#fff" stroke-opacity=".35" stroke-width="4" fill="none"/>`;

    // Pofi'nin mercan resifi
    s += fanCoral(150, 860, 1.6, '#c9a7f0') + coral(230, 870, 1.5, '#ff8fb1', 3) + coral(390, 875, 1.2, '#ffa07a', 9);
    s += seaweed(110, 880, 200, '#5fbf93', 0) + seaweed(440, 880, 160, '#7fd6a8', 1.2);

    // Dalga'nın feneri
    const lx = 680;
    s += `<g class="lighthouse">
      ${lit ? `<circle class="glow-pulse" cx="${lx}" cy="420" r="220" fill="url(#glow)"/><path d="M${lx} 420 L${lx - 520} 300 L${lx - 520} 470 Z" fill="#fff6b0" opacity=".25"/><path d="M${lx} 420 L${lx + 520} 300 L${lx + 520} 470 Z" fill="#fff6b0" opacity=".25"/>` : ''}
      <path d="M${lx - 60} 880 L${lx - 40} 480 H${lx + 40} L${lx + 60} 880 Z" fill="#f4f0ff" stroke="#9a8ccf" stroke-width="5"/>
      <path d="M${lx - 56} 800 H${lx + 56} L${lx + 54} 760 H${lx - 54} Z M${lx - 50} 680 H${lx + 50} L${lx + 48} 640 H${lx - 48} Z M${lx - 45} 560 H${lx + 45} L${lx + 44} 525 H${lx - 44} Z" fill="#ff9fb8"/>
      <path d="M${lx - 16} 880 V840 Q${lx} 820 ${lx + 16} 840 V880 Z" fill="#9a8ccf"/>
      <rect x="${lx - 54}" y="468" width="108" height="16" rx="6" fill="#9a8ccf"/>
      <rect x="${lx - 36}" y="385" width="72" height="85" rx="10" fill="${lit ? '#fff4a8' : '#5b6d86'}" stroke="#9a8ccf" stroke-width="5"/>
      <path d="M${lx - 46} 390 Q${lx} 320 ${lx + 46} 390 Z" fill="#7fc8e8" stroke="#3d7fa8" stroke-width="5"/>
      <circle cx="${lx}" cy="335" r="10" fill="#ffd36b"/>
      ${lit ? '' : `<path d="M${lx - 20} 400 L${lx + 4} 430 L${lx - 10} 440 L${lx + 18} 462" stroke="#2c3a4f" stroke-width="3" fill="none"/>`}
    </g>`;
    s += coral(560, 880, .9, '#ff9fb8', 21) + seaweed(800, 880, 140, '#5fbf93', .6);

    // Tosba'nın kabuk evi
    const tx = 1090;
    s += `<g>
      <path d="M${tx - 140} 880 C ${tx - 140} 640 ${tx + 140} 640 ${tx + 140} 880 Z" fill="#8fd68f" stroke="#4d9a5c" stroke-width="6"/>
      <path d="M${tx - 60} 760 L${tx} 730 L${tx + 60} 760 L${tx + 60} 820 L${tx} 845 L${tx - 60} 820 Z M${tx - 60} 760 L${tx - 120} 740 M${tx + 60} 760 L${tx + 120} 740 M${tx} 730 L${tx} 690 M${tx - 60} 820 L${tx - 130} 840 M${tx + 60} 820 L${tx + 130} 840" stroke="#4d9a5c" stroke-width="5" fill="#b5ecae" stroke-linejoin="round"/>
      <path d="M${tx - 26} 880 V840 Q${tx} 812 ${tx + 26} 840 V880 Z" fill="#b98a5a" stroke="#7a5a3a" stroke-width="4"/>
      <circle cx="${tx - 80}" cy="800" r="18" fill="#fff8d0" stroke="#4d9a5c" stroke-width="4"/>
      <circle cx="${tx + 80}" cy="800" r="18" fill="#fff8d0" stroke="#4d9a5c" stroke-width="4"/>
      ${done('tosba') ? `<g transform="translate(${tx - 80} 846) scale(.38)">${NPC.minik()}</g>` : ''}
    </g>`;
    s += seaweed(930, 880, 120, '#7fd6a8', 2) + starfish(1210, 900, 1, '#ffa07a');

    // Okto'nun postanesi
    const ox = 1480;
    s += `<g>
      <rect x="${ox - 100}" y="640" width="200" height="240" rx="14" fill="#ffe3ee" stroke="#d98bb0" stroke-width="5"/>
      <path d="M${ox - 115} 650 Q${ox} 540 ${ox + 115} 650 Z" fill="#c9a7f0" stroke="#9a79d6" stroke-width="5"/>
      <rect x="${ox - 70}" y="664" width="140" height="40" rx="12" fill="#4a7fd6"/>
      <text x="${ox}" y="694" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="30" fill="#fff">POSTA</text>
      <path d="M${ox - 30} 880 V800 Q${ox} 770 ${ox + 30} 800 V880 Z" fill="#9a79d6"/>
      <rect x="${ox - 80}" y="730" width="40" height="40" rx="8" fill="#fff" stroke="#d98bb0" stroke-width="4"/>
      <rect x="${ox + 40}" y="730" width="40" height="40" rx="8" fill="#fff" stroke="#d98bb0" stroke-width="4"/>
      <rect x="${ox + 112}" y="800" width="40" height="80" rx="6" fill="#4a7fd6"/><rect x="${ox + 104}" y="780" width="56" height="34" rx="14" fill="#5b8fe6"/><rect x="${ox + 118}" y="794" width="28" height="5" rx="2" fill="#2f5aa8"/>
      ${done('okto') ? `<path d="M${ox} 545 V490" stroke="#9a79d6" stroke-width="5"/><path d="M${ox} 490 L${ox + 50} 502 L${ox} 514 Z" fill="#ffd36b"/>` : ''}
    </g>`;

    // Kıskaç'ın bahçesi
    const gx = 1820;
    const flower = (x, y, c, i) => bloom
      ? `<path d="M${x} ${y} V${y - 50}" stroke="#5fbf93" stroke-width="5"/>` + [0, 72, 144, 216, 288].map(a => `<circle cx="${(x + 13 * Math.cos(a * Math.PI / 180)).toFixed(1)}" cy="${(y - 58 + 13 * Math.sin(a * Math.PI / 180)).toFixed(1)}" r="11" fill="${c}"/>`).join('') + `<circle cx="${x}" cy="${y - 58}" r="8" fill="#fff6c9"/>`
      : `<path d="M${x} ${y} Q${x + 4} ${y - 30} ${x + 18} ${y - 36}" stroke="#9aa89a" stroke-width="5" fill="none"/><circle cx="${x + 20}" cy="${y - 32}" r="9" fill="#b9b2b8"/>`;
    s += `<g><path d="M${gx - 130} 900 Q${gx} 860 ${gx + 170} 900 V912 H${gx - 130} Z" fill="#c9a77a"/>`;
    ['#ff8fb8', '#ffd36b', '#b5a4ff', '#8fe3d0', '#ffa07a', '#ff8fb8'].forEach((c, i) => s += flower(gx - 100 + i * 50, 900, c, i));
    s += `</g>` + seaweed(1980, 900, 220, '#5fbf93', .3) + coral(1700, 905, .8, bloom ? '#ff8fb1' : '#b8a8b0', 33);

    // ön plan
    s += seaweed(20, 1000, 260, '#4fae86', .4, 14) + seaweed(980, 1000, 180, '#4fae86', 1.6, 12) + seaweed(1360, 1000, 220, '#4fae86', .9, 14);
    s += starfish(560, 950, 1.2, '#ff9f87') + starfish(1560, 960, 1, '#ffd36b');
    s += Avatar.shell(860, 950, 18, '#ffe0ee', '#d993b6') + Avatar.shell(1720, 975, 16, '#fff2d6', '#d9b37a');

    // şehir sakinleri
    QUESTS.forEach(q => {
      const d = done(q.id);
      s += `<g class="npc" data-q="${q.id}" transform="translate(${q.x} ${q.y})">
        <circle r="95" fill="#fff" opacity="0"/>
        <g class="npc-bob" style="animation-delay:${(q.x % 7) / 3}s"><g transform="scale(.95)">${NPC[q.npc]()}</g></g>
        <g class="marker ${d ? 'done' : ''}" transform="translate(0 -122)">
          <circle r="28" fill="${d ? '#fff' : '#ff8fb8'}" stroke="#fff" stroke-width="5"/>
          ${d ? `<path d="${Avatar.star(0, 1, 16, 7)}" fill="#ffcf4a" stroke="#e3a53f" stroke-width="2" stroke-linejoin="round"/>` : '<text y="12" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="38" fill="#fff">!</text>'}
        </g>
      </g>`;
    });

    s += `<g id="player"></g></svg>`;
    return s;
  }

  return { map, npcSVG, NPC, coral, seaweed, fanCoral, starfish, rng };
})();
