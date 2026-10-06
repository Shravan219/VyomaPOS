// reel.js: 120.0s (2m 00s) Kinetic Motion Promo Reel for Vyoma POS @ 30 FPS (3,600 frames)
// 10 cinematic editorial chapters, gold/noir palette, 100% pure music + kinetic typography.
import * as THREE from '../node_modules/three/build/three.module.js';

const W = 1920, H = 1080, C = KCUE, S = C.S, Hh = C.hits, FPS = C.fps, BEAT = 60 / C.bpm;
window.DUR = C.dur;
window.PROJECT = { audio: 'assets/score.m4a' };

// Color Palette matching Vyoma POS Luxury Gold & Noir
const K = {
  ink: '#0A0A0B',
  ink2: '#141416',
  surface: '#0D0D0E',
  gold: '#C5A059',
  goldLight: '#E8D09B',
  goldBright: '#FFF2D4',
  goldDark: '#8C6E30',
  cream: '#F1EEE6',
  white: '#FFFFFF',
  red: '#E8412F',
  green: '#10B981',
  grey: '#71717A',
  border: '#27272A'
};

const F = {
  cond: '"Anton"',
  wide: '"Archivo Black"',
  serif: '"Instrument Serif"',
  mono: '"JetBrains Mono"',
  zh: '"Noto Sans SC"'
};

// Math utilities
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const easeIn = x => Math.pow(clamp(x), 3);
const expoOut = x => { x = clamp(x); return x === 1 ? 1 : 1 - Math.pow(2, -10 * x); };
const backOut = x => { x = clamp(x); const s = 1.7; return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const beatPulse = (t, k = 7) => Math.exp(-((t / BEAT) % 1) * k);
const TAU = Math.PI * 2;

// Canvases & Render buffers
const out = document.getElementById('out');
const c2 = document.createElement('canvas'); c2.width = W; c2.height = H;
let ctx = c2.getContext('2d');
const mainCtx = ctx;
const mkBuf = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
const bufA = mkBuf(), bufB = mkBuf();
let TRANS = false;
const RECT = {};

const glA = document.createElement('canvas'); glA.width = W; glA.height = H;
const RA = new THREE.WebGLRenderer({ canvas: glA, antialias: true, alpha: true, preserveDrawingBuffer: true });
RA.setPixelRatio(1); RA.setSize(W, H, false);
const RP = new THREE.WebGLRenderer({ canvas: out, antialias: false, preserveDrawingBuffer: true });
RP.setPixelRatio(1); RP.setSize(W, H, false); RP.outputColorSpace = THREE.LinearSRGBColorSpace;

// GL Layer: Particle Terrain
const terrain = (() => {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(42, W / H, .1, 100);
  const nx = 220, nz = 140, pos = new Float32Array(nx * nz * 3);
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
    const k = (i * nz + j) * 3;
    pos[k] = (i / (nx - 1) - .5) * 26;
    pos[k + 1] = 0;
    pos[k + 2] = -j / (nz - 1) * 30 + 3;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { time: { value: 0 }, amp: { value: 1 }, fade: { value: 1 }, tint: { value: new THREE.Color(K.gold) } },
    vertexShader: `uniform float time, amp; varying float vA;
      float wave(vec2 p, float t){ return sin(p.x*.5+t*.9)*.45 + sin(p.y*.38-t*.7)*.6 + sin((p.x+p.y)*.27+t*.5)*.7 + sin(length(p-vec2(3.,-9.))*.8-t*1.4)*.4; }
      void main(){ vec3 p = position; p.y = wave(p.xz, time)*amp; vec4 mv = modelViewMatrix*vec4(p,1.);
        gl_PointSize = 5.5 * (6.0 / -mv.z); float d = -mv.z; vA = clamp(1.0 - d/30.0, 0., 1.) * (.25 + .75*smoothstep(-1.2, 1.6, p.y)) * smoothstep(0.5, 3.5, d);
        gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform float fade; uniform vec3 tint; varying float vA;
      void main(){ vec2 c = gl_PointCoord-.5; float r = dot(c,c); if (r>.25) discard; gl_FragColor = vec4(tint, vA*fade*(1.0-r*2.5)); }`,
  });
  scene.add(new THREE.Points(g, mat));
  return (t, o = {}) => {
    mat.uniforms.time.value = t; mat.uniforms.amp.value = o.amp ?? 1; mat.uniforms.fade.value = o.fade ?? 1;
    if (o.tint) mat.uniforms.tint.value.set(o.tint);
    cam.position.set(Math.sin(t * .15) * 1.5, o.camY ?? 3.2, 5 - (o.push ?? 0));
    cam.lookAt(0, -.4, -8);
    RA.setClearColor(0x000000, 0); RA.clear(); RA.render(scene, cam);
    return glA;
  };
})();

// Post-Processing Pass
let FX = { split: 0, slice: 0, seed: 0, grain: .04, vign: .3, flash: 0, flashCol: K.gold };
const post = (() => {
  const tex = new THREE.CanvasTexture(c2); tex.colorSpace = THREE.NoColorSpace; tex.minFilter = tex.magFilter = THREE.LinearFilter;
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      tex: { value: tex }, split: { value: 0 }, slice: { value: 0 }, seed: { value: 0 },
      grain: { value: .04 }, time: { value: 0 }, vign: { value: .3 }, flash: { value: 0 },
      flashCol: { value: new THREE.Color(K.gold) }, res: { value: new THREE.Vector2(W, H) }
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`,
    fragmentShader: `uniform sampler2D tex; uniform float split, slice, seed, grain, time, vign, flash; uniform vec3 flashCol; uniform vec2 res; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      void main(){
        vec2 uv = vUv;
        float band = floor(uv.y*28.0 + h(vec2(seed,1.))*3.0), hb = h(vec2(band, seed));
        if (hb < slice) uv.x += (h(vec2(band, seed+2.)) - .5) * .16 * slice;
        vec2 d = vec2(split, split*.15);
        vec3 c = vec3(texture2D(tex, uv + d).r, texture2D(tex, uv).g, texture2D(tex, uv - d).b);
        c += (h(vUv*res + time*61.7) - .5) * grain;
        vec2 q = vUv - .5; c *= 1.0 - vign*dot(q,q)*.9;
        c = mix(c, flashCol, flash);
        gl_FragColor = vec4(c, 1.);
      }`,
  });
  const scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
  return (t, fx) => {
    tex.needsUpdate = true;
    const u = mat.uniforms;
    u.split.value = fx.split; u.slice.value = fx.slice; u.seed.value = fx.seed; u.time.value = Math.floor(t * FPS);
    u.grain.value = fx.grain; u.vign.value = fx.vign; u.flash.value = fx.flash; u.flashCol.value.set(fx.flashCol);
    RP.render(scene, cam);
  };
})();

// Typography and 2D Primitives
const font = (fam, size, weight = '') => `${weight} ${size}px ${fam}`.trim();
function txt(s, x, y, o = {}) {
  ctx.save();
  ctx.font = o.font; ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'alphabetic'; ctx.letterSpacing = (o.ls || 0) + 'px';
  ctx.globalAlpha = o.a ?? 1;
  if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = o.glowR || 24; }
  if (o.stroke) { ctx.lineWidth = o.lw || 2; ctx.strokeStyle = o.stroke; ctx.strokeText(s, x, y); }
  if (o.fill !== null) { ctx.fillStyle = o.fill || K.cream; ctx.fillText(s, x, y); }
  ctx.restore();
}

function letters(s, x, y, o, fn) {
  ctx.save(); ctx.font = o.font; ctx.letterSpacing = (o.ls || 0) + 'px';
  const total = ctx.measureText(s).width, x0 = o.align === 'center' ? x - total / 2 : o.align === 'right' ? x - total : x;
  const n = s.length;
  for (let i = 0; i < n; i++) {
    const ch = s[i]; if (ch === ' ') continue;
    const px = ctx.measureText(s.slice(0, i)).width, cw = ctx.measureText(ch).width, a = fn(i, n);
    if ((a.a ?? 1) <= 0.001) continue;
    ctx.save(); ctx.globalAlpha = a.a ?? 1; ctx.translate(x0 + px + cw / 2 + (a.dx || 0), y + (a.dy || 0)); ctx.rotate(a.r || 0); ctx.scale(a.s ?? 1, a.s ?? 1);
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    if (o.stroke) { ctx.lineWidth = o.lw || 2; ctx.strokeStyle = o.stroke; ctx.strokeText(ch, 0, 0); }
    if (o.fill !== null) { ctx.fillStyle = a.fill || o.fill || K.cream; ctx.fillText(ch, 0, 0); }
    ctx.restore();
  }
  ctx.restore();
  return total;
}

const measure = (s, f, ls = 0) => { ctx.save(); ctx.font = f; ctx.letterSpacing = ls + 'px'; const w = ctx.measureText(s).width; ctx.restore(); return w; };
const bg = col => { ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); };
function line(pts, col, lw = 2, a = 1) { ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); ctx.restore(); }
function circle(x, y, r, o = {}) { if (!(r > .01)) return; ctx.save(); ctx.globalAlpha = o.a ?? 1; ctx.beginPath(); ctx.arc(x, y, r, o.a0 ?? 0, o.a1 ?? TAU); if (o.fill) { ctx.fillStyle = o.fill; ctx.fill(); } if (o.stroke) { ctx.strokeStyle = o.stroke; ctx.lineWidth = o.lw || 2; ctx.stroke(); } ctx.restore(); }

function rrect(x, y, w, h, r, o = {}) {
  if (!(w > .5) || !(h > .5)) return;
  ctx.save(); ctx.globalAlpha = o.a ?? 1; ctx.beginPath(); ctx.roundRect(x, y, w, h, Math.min(r, w / 2, h / 2));
  if (o.fill) { ctx.fillStyle = o.fill; ctx.fill(); }
  if (o.stroke) { ctx.strokeStyle = o.stroke; ctx.lineWidth = o.lw || 2; ctx.stroke(); }
  ctx.restore();
}

function chip(s, x, y, o = {}) {
  const f = o.font || font(F.mono, 18, 700), ls = o.ls ?? 2, w = measure(s, f, ls) + 32, h = o.h || 42, k = o.k ?? 1;
  if (k <= 0) return w;
  rrect(x, y - h / 2, w * easeOut(k), h, o.r ?? 10, { fill: o.bg || K.surface, stroke: o.line || K.border, lw: o.lw || 1.5, a: o.a });
  if (k > .5) txt(s, x + 16, y + 6.5, { font: f, fill: o.fg || K.cream, ls, a: (o.a ?? 1) * seg(k, .5, 1) });
  return w;
}

const dropWord = (s, x, y, f, t0, t, o = {}) => letters(s, x, y, { font: f, fill: o.fill || K.cream, align: o.align }, (i) => {
  const k = seg(t, t0 + i * (o.stag ?? .03), t0 + i * (o.stag ?? .03) + (o.dur ?? .32));
  return { dy: (1 - expoOut(k)) * (o.fall ?? 180), a: k > 0 ? 1 : 0, fill: o.fillAt ? o.fillAt(i) : undefined };
});

function hud(t, o) {
  const col = 'rgba(232, 208, 155, 0.85)', dim = 'rgba(197, 160, 89, 0.45)';
  const k = o.k ?? 1, m = 44, L = 28 * k;
  if (o.brackets !== false) for (const [cx, cy, sx, sy] of [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]]) {
    line([[cx, cy + sy * L], [cx, cy], [cx + sx * L, cy]], K.gold, 2, k * 0.75);
  }
  const f = font(F.mono, 15, 600), a = clamp(k * 1.4 - .3);
  if (o.tl) txt(o.tl, m + 18, m + 26, { font: f, fill: col, ls: 2.5, a });
  if (o.tr) txt(o.tr, W - m - 18, m + 26, { font: f, fill: col, ls: 2.5, align: 'right', a });
  if (o.bl) txt(o.bl, m + 18, H - m - 16, { font: f, fill: col, ls: 2.5, a });
  if (o.br) txt(o.br, W - m - 18, H - m - 16, { font: f, fill: col, ls: 2.5, align: 'right', a });
  if (o.progress !== false) {
    const y = H - m + 14, x0 = m + 18, x1 = W - m - 18, X = s => lerp(x0, x1, s / C.dur);
    for (const [, a0, a1] of C.CH) {
      const xa = X(a0) + 3, xb = X(a1) - 3, on = t >= a0 && t < a1;
      line([[xa, y], [xb, y]], dim, 1, a * 0.4);
      if (t > a0) line([[xa, y], [Math.min(xb, X(t)), y]], K.gold, on ? 3.5 : 2, a);
    }
  }
}

const tc = t => {
  const f = Math.floor(t * FPS), s = Math.floor(f / FPS), fr = f % FPS, p = n => String(n).padStart(2, '0');
  const m = Math.floor(s / 60), secRem = s % 60;
  return `TC 00:${p(m)}:${p(secRem)}:${p(fr)}`;
};

const sec = (i, name) => `● ${String(i).padStart(2, '0')} / 07   ${name}`;
const glShot = (canvas, a = 1) => { ctx.save(); ctx.globalAlpha = a; ctx.drawImage(canvas, 0, 0, W, H); ctx.restore(); };

function odometer(v0, v1, k, x, y, f, col) {
  const s0 = String(v0), s1 = String(v1); ctx.save(); ctx.font = f;
  let xx = x; const hgt = parseFloat(f.match(/(\d+)px/)[1]) * .92;
  for (let i = 0; i < s1.length; i++) {
    const d0 = +s0[i] || 0, d1 = +s1[i] || 0, w = ctx.measureText(s1[i]).width, kk = expoOut(clamp(k * 1.2 - i * .12));
    ctx.save(); ctx.beginPath(); ctx.rect(xx - 8, y - hgt, w + 16, hgt * 1.12); ctx.clip();
    const steps = (d1 - d0 + 10) % 10 || 10, off = kk * steps;
    for (let j = -1; j <= steps + 1; j++) {
      const dy = (j - off) * hgt; if (Math.abs(dy) > hgt * 1.2) continue;
      ctx.fillStyle = col; ctx.fillText(String((d0 + j + 10) % 10), xx, y + dy);
    }
    ctx.restore(); xx += w;
  }
  ctx.restore(); return xx;
}

function drawVyomaLogo(x, y, r, k = 1) {
  if (k <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  circle(0, 0, r, { stroke: K.gold, lw: 3, a: 0.95 });
  circle(0, 0, r * 0.88, { stroke: K.goldDark, lw: 1.5, a: 0.5 });
  ctx.fillStyle = K.gold;
  ctx.beginPath();
  ctx.moveTo(0, r * 0.65);
  ctx.lineTo(-r * 0.45, -r * 0.45);
  ctx.lineTo(-r * 0.15, -r * 0.15);
  ctx.lineTo(0, -r * 0.45);
  ctx.lineTo(r * 0.15, -r * 0.15);
  ctx.lineTo(r * 0.45, -r * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ==================== 10 CHAPTER SCENES (120 SECONDS) ====================

// Chapter 1: INTRO & BRAND HOOK (0.0s - 8.0s)
function sOpen(t) {
  bg(K.ink);
  const lt = t - S.open;
  glShot(terrain(t, { fade: ease(seg(t, .2, 2.0)), amp: lerp(.2, 1.1, easeOut(seg(t, 0, 5.0))), push: t * .45, tint: K.gold }));
  
  const cx = W / 2, cy = H / 2 - 20;
  const kLogo = backOut(seg(t, 0.6, 2.2));
  drawVyomaLogo(cx, cy - 80, 110, kLogo);

  const fTitle = font(F.wide, 130);
  dropWord('VYOMA POS', cx, cy + 120, fTitle, 1.8, t, { align: 'center', fill: K.white });
  
  txt('THE CLOUD HOSPITALITY SUITE FOR MODERN LUXURY DINING', cx, cy + 195, {
    font: font(F.mono, 24, 700), fill: K.gold, ls: 6, align: 'center', a: seg(t, 2.8, 4.2), glow: K.goldDark, glowR: 24
  });

  txt('NATIVE WINDOWS (.EXE) & ANDROID (.APK) BINARIES • ZERO LATENCY LOCAL RELAY', cx, cy + 245, {
    font: font(F.mono, 18, 500), fill: K.cream, ls: 3, align: 'center', a: seg(t, 3.8, 5.5)
  });

  hud(t, {
    tl: 'VYOMA POS // PROMO REEL ’26', tr: tc(t),
    bl: sec(1, 'SYSTEM INITIALIZE'), br: 'HOSPITALITY OPERATING SYSTEM',
    k: ease(seg(lt, .2, 1.0))
  });
}

// Chapter 2: NATIVE DUAL BINARIES ARCHITECTURE (8.0s - 22.0s)
function sNative(t) {
  bg(K.ink);
  const lt = t - S.native;
  
  dropWord('NATIVE BINARIES.', 140, 230, font(F.cond, 160), S.native + 0.1, t, { fall: 140, fill: K.white });
  dropWord('ZERO LAG.', 140 + measure('NATIVE BINARIES. ', font(F.cond, 160)), 230, font(F.cond, 160), S.native + 0.4, t, { fall: 140, fill: K.gold });

  const cW = 790, cH = 520, yPos = 310;
  
  // Windows .exe Card
  const kW = backOut(seg(t, S.native + 0.8, S.native + 1.6));
  rrect(140, yPos, cW, cH, 26, { fill: K.surface, stroke: K.gold, lw: 2.5, a: kW });
  txt('WINDOWS (.EXE)', 190, yPos + 75, { font: font(F.wide, 44), fill: K.white, a: kW });
  txt('BILLING COUNTER & MULTI-STATION KDS', 190, yPos + 125, { font: font(F.mono, 20, 700), fill: K.gold, ls: 2, a: kW });
  txt('• Direct ESC/POS Thermal Printer Hooks (0ms Driver Lag)', 190, yPos + 200, { font: font(F.mono, 21), fill: K.white, a: kW });
  txt('• Dynamic UPI QR Display on Customer Facing Screen', 190, yPos + 260, { font: font(F.mono, 21), fill: K.white, a: kW });
  txt('• Instant Petpooja & Accounting ERP Synchronization', 190, yPos + 320, { font: font(F.mono, 21), fill: K.white, a: kW });
  txt('• High-Concurrency Multi-Till Cashier Reconciliation', 190, yPos + 380, { font: font(F.mono, 21), fill: K.white, a: kW });
  chip('< 4S SETTLEMENT VELOCITY', 190, yPos + 450, { k: kW, bg: K.gold, fg: K.ink, h: 46, font: font(F.mono, 20, 700) });

  // Android .apk Card
  const kA = backOut(seg(t, S.native + 1.4, S.native + 2.2));
  rrect(W - 140 - cW, yPos, cW, cH, 26, { fill: K.surface, stroke: K.gold, lw: 2.5, a: kA });
  txt('ANDROID (.APK)', W - 140 - cW + 50, yPos + 75, { font: font(F.wide, 44), fill: K.white, a: kA });
  txt('CAPTAIN WAITER TABLETS', W - 140 - cW + 50, yPos + 125, { font: font(F.mono, 20, 700), fill: K.gold, ls: 2, a: kA });
  txt('• Sub-50ms Tableside KOT Kitchen Dispatch', W - 140 - cW + 50, yPos + 200, { font: font(F.mono, 21), fill: K.white, a: kA });
  txt('• One-Handed Tablet UI with Rapid Course Modifiers', W - 140 - cW + 50, yPos + 260, { font: font(F.mono, 21), fill: K.white, a: kA });
  txt('• PIN-Protected Bill Locking & Dynamic Seat Splitting', W - 140 - cW + 50, yPos + 320, { font: font(F.mono, 21), fill: K.white, a: kA });
  txt('• 100% Zero-Loss Pipeline During ISP Outages', W - 140 - cW + 50, yPos + 380, { font: font(F.mono, 21), fill: K.white, a: kA });
  chip('SUB-50MS ORDER FIRE', W - 140 - cW + 50, yPos + 450, { k: kA, bg: K.gold, fg: K.ink, h: 46, font: font(F.mono, 20, 700) });

  RECT.nativeBox = [140, yPos, cW, cH];

  hud(t, {
    tl: '02 // ARCHITECTURE', tr: tc(t),
    bl: sec(2, 'NATIVE WINDOWS & ANDROID'), br: '0-DRIVER LAG THERMAL HOOKS',
    k: ease(seg(lt, .2, .8))
  });
}

// Chapter 3: THE SPEED LAYER & LOCAL RELAY (22.0s - 34.0s)
function sSpeed(t) {
  bg(K.ink2);
  const lt = t - S.speed;

  dropWord('THE SPEED LAYER.', 140, 230, font(F.cond, 160), S.speed + 0.1, t, { fall: 140, fill: K.gold });
  dropWord('< 50MS.', 140 + measure('THE SPEED LAYER. ', font(F.cond, 160)), 230, font(F.cond, 160), S.speed + 0.4, t, { fall: 140, fill: K.white });

  // Speed Benchmarks
  const fBig = font(F.cond, 320);
  const kOdo = seg(t, Hh.speedOdo, Hh.speedOdo + 1.8);
  const xNum = odometer(450, 48, kOdo, 140, 620, fBig, K.gold);
  txt('MS', xNum + 20, 620, { font: fBig, fill: K.gold });

  txt('TABLESIDE ORDER DISPATCH SPEED', 145, 680, { font: font(F.mono, 24, 700), fill: K.white, ls: 2 });
  txt('INSTANT ORDER ROUTING INTO KITCHEN DISPLAY SYSTEM', 145, 725, { font: font(F.mono, 18), fill: K.goldLight, ls: 1 });

  // Right Pillar Breakdown
  const rx = 1040, ry = 310;
  rrect(rx, ry, 740, 520, 26, { fill: K.surface, stroke: K.gold, lw: 2.5, a: ease(seg(lt, .3, .9)) });
  txt('0.4MS LOCAL MESH RELAY', rx + 55, ry + 80, { font: font(F.wide, 38), fill: K.white });
  txt('ON-PREMISES EVENT BUS', rx + 55, ry + 130, { font: font(F.mono, 20, 700), fill: K.gold, ls: 2 });

  const points = [
    '• 0.4ms Local Relay ping across floor captains & kitchen lines',
    '• Courses routed dynamically: Starters → Mains → Desserts',
    '• Acoustic kitchen alert chimes for rush-hour orders',
    '• Waiter seat-splitting with 1-tap table transfers',
    '• Eliminate waiter transit time by 45% during peak dinner service'
  ];

  points.forEach((p, i) => {
    const kP = seg(t, S.speed + 1.0 + i * 0.3, S.speed + 1.6 + i * 0.3);
    txt(p, rx + 55, ry + 200 + i * 50, { font: font(F.mono, 20), fill: K.cream, a: kP });
  });

  hud(t, {
    tl: '02.1 // THE SPEED LAYER', tr: tc(t),
    bl: sec(2, '0.4MS LOCAL MESH RELAY'), br: 'SUB-50MS ORDER FIRE',
    k: ease(seg(lt, .2, .8))
  });
}

// Chapter 4: ENTERPRISE IP-WHITELISTED SECURITY (34.0s - 48.0s)
function sSecurity(t) {
  bg(K.ink);
  const lt = t - S.security;

  dropWord('IP-LOCKED', 140, 230, font(F.cond, 160), S.security + 0.1, t, { fall: 140, fill: K.gold });
  dropWord('SECURITY.', 140 + measure('IP-LOCKED ', font(F.cond, 160)), 230, font(F.cond, 160), S.security + 0.4, t, { fall: 140, fill: K.white });

  // Security Core Shield
  const cx = 380, cy = 590;
  const kS = backOut(seg(t, Hh.secShield, Hh.secShield + 0.8));
  circle(cx, cy, 220 * kS, { stroke: K.gold, lw: 3, a: 0.95 });
  circle(cx, cy, 180 * kS, { fill: K.surface, stroke: K.border, lw: 2 });
  txt('STATIC IP', cx, cy - 30, { font: font(F.wide, 38), fill: K.gold, align: 'center', a: kS });
  txt('WHITELISTED', cx, cy + 25, { font: font(F.mono, 20, 700), fill: K.white, ls: 2, align: 'center', a: kS });
  chip('VENUE-LOCKED ACCESS', cx - 120, cy + 85, { k: kS, bg: K.gold, fg: K.ink, h: 44, font: font(F.mono, 18, 700) });

  // Right Badges
  const fxX = 680, yBase = 320;
  const items = [
    ['PREMISES-BOUND ACCESS CONTROL', 'Strict static IP verification blocks all unauthorized logins outside your restaurant floor.'],
    ['SQLITE LOCAL EDGE CACHE', 'Continuous local edge failover replication ensures 100% uptime when venue internet drops.'],
    ['AUTOMATIC CLOUD RECONCILIATION', 'Two-way database state reconciliation instantly re-syncs all offline orders upon reconnection.'],
    ['ROLE-BASED PIN AUTHORIZATION', 'Manager PIN approvals for item voids, complimentary courses, and discount overrides.']
  ];

  items.forEach(([title, desc], i) => {
    const kItem = seg(t, S.security + 0.6 + i * 0.4, S.security + 1.2 + i * 0.4);
    const yI = yBase + i * 135;
    rrect(fxX, yI, 1100, 115, 20, { fill: K.surface, stroke: K.border, lw: 2, a: kItem });
    circle(fxX + 50, yI + 58, 16, { fill: K.gold, a: kItem });
    txt(title, fxX + 90, yI + 48, { font: font(F.mono, 24, 700), fill: K.goldLight, ls: 2, a: kItem });
    txt(desc, fxX + 90, yI + 88, { font: font(F.mono, 18), fill: K.cream, a: kItem });
  });

  hud(t, {
    tl: '03 // ENTERPRISE SECURITY', tr: tc(t),
    bl: sec(3, 'PREMISES-BOUND NETWORK SECURITY'), br: 'LOCAL SQLITE EDGE REPLICATION',
    k: ease(seg(lt, .2, .8))
  });
}

// Chapter 5: 8 UNIFIED HOSPITALITY MODULES (48.0s - 64.0s)
function sModules(t) {
  bg(K.ink2);
  const lt = t - S.modules;

  dropWord('8 UNIFIED', 140, 220, font(F.cond, 160), S.modules + 0.1, t, { fall: 140, fill: K.white });
  dropWord('SUITE MODULES.', 140 + measure('8 UNIFIED ', font(F.cond, 160)), 220, font(F.cond, 160), S.modules + 0.4, t, { fall: 140, fill: K.gold });

  const mods = [
    { title: 'CAPTAIN TABLET (.APK)', sub: 'Tableside Ordering, Modifiers & Bill Splits', metric: '< 50ms KOT Fire' },
    { title: 'SERVICE RAIL PIPELINE', sub: 'Color-Coded Token Progression (Pending to Ready)', metric: '100% Zero-Loss' },
    { title: 'KITCHEN KDS DISPLAY', sub: 'Station Routing: Grill, Sauté, Pastry & Bar', metric: 'Multi-Station Pacing' },
    { title: 'COUNTER BILLING STATION', sub: 'Thermal Receipts & Dynamic UPI QR Pay', metric: '< 4s Settlement' }
  ];

  const gw = 790, gh = 230, gx0 = 140, gy0 = 310;
  mods.forEach((m, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = gx0 + col * (gw + 60), y = gy0 + row * (gh + 35);
    const kM = backOut(seg(t, S.modules + 0.5 + i * 0.4, S.modules + 1.2 + i * 0.4));

    rrect(x, y, gw, gh, 22, { fill: K.surface, stroke: K.border, lw: 2, a: kM });
    rrect(x + 25, y + 25, 54, 54, 14, { fill: K.ink, stroke: K.gold, lw: 2, a: kM });
    txt(String(i + 1), x + 52, y + 63, { font: font(F.wide, 26), fill: K.gold, align: 'center', a: kM });

    txt(m.title, x + 100, y + 62, { font: font(F.wide, 30), fill: K.white, a: kM });
    txt(m.sub, x + 100, y + 110, { font: font(F.mono, 20), fill: K.cream, a: kM });
    chip(m.metric, x + 100, y + 168, { k: kM, bg: K.gold, fg: K.ink, h: 40, font: font(F.mono, 18, 700) });
  });

  hud(t, {
    tl: '04 // CORE ENGINE', tr: tc(t),
    bl: sec(4, 'FLOOR, KITCHEN & CLOUD REAL-TIME MESH'), br: '8 SYNCHRONIZED SUBSYSTEMS',
    k: ease(seg(lt, .2, .8))
  });
}

// Chapter 6: SWIGGY & ZOMATO OMNICHANNEL INGESTION (64.0s - 76.0s)
function sAggregator(t) {
  bg(K.ink);
  const lt = t - S.aggregator;

  dropWord('SWIGGY & ZOMATO', 140, 220, font(F.cond, 160), S.aggregator + 0.1, t, { fall: 140, fill: K.gold });
  dropWord('SYNC.', 140 + measure('SWIGGY & ZOMATO ', font(F.cond, 160)), 220, font(F.cond, 160), S.aggregator + 0.4, t, { fall: 140, fill: K.white });

  // Central Omnichannel Flow Card
  const bx = 140, by = 310, bw = 1640, bh = 510;
  const kB = backOut(seg(t, S.aggregator + 0.6, S.aggregator + 1.4));
  rrect(bx, by, bw, bh, 26, { fill: K.surface, stroke: K.gold, lw: 2.5, a: kB });

  txt('DIRECT ONLINE ORDER INGESTION INTO SERVICE RAIL', bx + 65, by + 80, { font: font(F.wide, 40), fill: K.white, a: kB });
  txt('NO SEPARATE AGGREGATOR TABLETS • ZERO MANUAL PUNCH-INS', bx + 65, by + 135, { font: font(F.mono, 22, 700), fill: K.gold, ls: 2, a: kB });

  const aggPoints = [
    '• Two-way menu catalog and out-of-stock item sync across Swiggy & Zomato',
    '• Ingested delivery orders fire tickets directly to specific Kitchen KDS lines',
    '• Automated rider dispatch notifications and preparation timer synchronization',
    '• Unified end-of-day revenue, payout, and GST reconciliation across dine-in and online delivery',
    '• Eliminate aggregator order entry errors and recover up to 18 minutes per rush-hour turnaround'
  ];

  aggPoints.forEach((p, i) => {
    const kP = seg(t, S.aggregator + 1.0 + i * 0.35, S.aggregator + 1.6 + i * 0.35);
    txt(p, bx + 65, by + 205 + i * 55, { font: font(F.mono, 21), fill: K.cream, a: kP });
  });

  hud(t, {
    tl: '04.1 // OMNICHANNEL INGESTION', tr: tc(t),
    bl: sec(4, 'SWIGGY & ZOMATO NATIVE SYNC'), br: 'UNIFIED SINGLE-SCREEN OPERATION',
    k: ease(seg(lt, .2, .8))
  });
}

// Chapter 7: AI UPSELL ENGINE (76.0s - 90.0s)
function sAI(t) {
  bg(K.ink2);
  const lt = t - S.aiUpsell;

  dropWord('FLAGSHIP AI', 140, 220, font(F.cond, 160), S.aiUpsell + 0.1, t, { fall: 140, fill: K.gold });
  dropWord('UPSELL ENGINE.', 140 + measure('FLAGSHIP AI ', font(F.cond, 160)), 220, font(F.cond, 160), S.aiUpsell + 0.4, t, { fall: 140, fill: K.white });

  // Big Stat Counter: +24.6%
  const fNum = font(F.cond, 340);
  const kOdo = seg(t, Hh.aiRoll, Hh.aiRoll + 2.0);
  txt('+', 140, 640, { font: fNum, fill: K.gold, a: seg(lt, .2, .8) });
  const xEnd = odometer(0, 24, kOdo, 270, 640, fNum, K.gold);
  txt('.6%', xEnd + 10, 640, { font: fNum, fill: K.gold });

  txt('AVERAGE CHECK SIZE INCREASE', 145, 710, { font: font(F.mono, 24, 700), fill: K.white, ls: 2 });
  txt('PROVEN IN LIVE HIGH-END DINING DEPLOYMENTS', 145, 755, { font: font(F.mono, 18), fill: K.goldLight, ls: 1 });

  // Side Explanation
  const rx = 1040, ry = 310;
  rrect(rx, ry, 740, 520, 26, { fill: K.surface, stroke: K.gold, lw: 2.5, a: ease(seg(lt, .3, .9)) });
  txt('AUTOMATED CART INTELLIGENCE', rx + 55, ry + 80, { font: font(F.wide, 38), fill: K.white });
  txt('PROVEN REVENUE ACCELERATOR', rx + 55, ry + 130, { font: font(F.mono, 20, 700), fill: K.gold, ls: 2 });

  const aiBenefits = [
    '• Live cart analysis suggests high-margin chef pairings',
    '• Prompts cocktail pairings & signature desserts in QR menu',
    '• 100% automated during guest order placement',
    '• Configurable margin filters and chef-approved rules',
    '• Yields measurable +24.6% gross check increase without waiter pressure'
  ];

  aiBenefits.forEach((p, i) => {
    const kP = seg(t, S.aiUpsell + 1.2 + i * 0.35, S.aiUpsell + 1.8 + i * 0.35);
    txt(p, rx + 55, ry + 200 + i * 50, { font: font(F.mono, 20), fill: K.cream, a: kP });
  });

  chip('+24.6% CHECK LIFT', rx + 55, ry + 460, { k: ease(seg(lt, .8, 1.4)), bg: K.gold, fg: K.ink, h: 44, font: font(F.mono, 20, 700) });

  hud(t, {
    tl: '05 // REVENUE ACCELERATOR', tr: tc(t),
    bl: sec(5, 'SMART CART RECOMMENDATIONS'), br: '+24.6% AVERAGE CHECK SIZE',
    k: ease(seg(lt, .2, .8))
  });
}

// Chapter 8: TRANSPARENT COMMERCIAL INVESTMENT (90.0s - 104.0s)
function sPricing(t) {
  bg(K.ink);
  const lt = t - S.pricing;

  dropWord('TRANSPARENT', 140, 220, font(F.cond, 160), S.pricing + 0.1, t, { fall: 140, fill: K.white });
  dropWord('INVESTMENT.', 140 + measure('TRANSPARENT ', font(F.cond, 160)), 220, font(F.cond, 160), S.pricing + 0.4, t, { fall: 140, fill: K.gold });

  // 3 Pricing Cards
  const cards = [
    { tier: 'BASE ONBOARDING', price: '₹3,999', unit: 'ONE-TIME', desc: 'Menu digitization, thermal printer mapping, staff setup for Windows (.exe) & Android (.apk).' },
    { tier: 'BASIC POS SUITE', price: '₹25,000', unit: '/ YEAR', desc: 'Full billing desktop app (.exe), Captain Android app (.apk), and Kitchen KDS system.' },
    { tier: 'VIP HOSPITALITY SUITE', price: '₹40,000', unit: '/ YEAR', desc: 'Guest QR ordering, AI upselling, CRM loyalty, plus FREE restaurant website & domain!' }
  ];

  const cw = 510, ch = 520, gap = 45, x0 = 140, y0 = 310;
  cards.forEach((c, i) => {
    const x = x0 + i * (cw + gap);
    const kC = backOut(seg(t, S.pricing + 0.4 + i * 0.35, S.pricing + 1.0 + i * 0.35));
    const isVip = i === 2;

    rrect(x, y0, cw, ch, 26, {
      fill: isVip ? K.surface : K.ink2,
      stroke: isVip ? K.gold : K.border,
      lw: isVip ? 3.5 : 1.5,
      a: kC
    });

    if (isVip) {
      rrect(x + cw / 2 - 130, y0 - 22, 260, 44, 22, { fill: K.gold });
      txt('MOST POPULAR / FLAGSHIP', x + cw / 2, y0 + 7, { font: font(F.mono, 15, 700), fill: K.ink, align: 'center', ls: 2 });
    }

    txt(c.tier, x + 35, y0 + 80, { font: font(F.wide, 24), fill: isVip ? K.goldLight : K.white, a: kC });
    txt(c.price, x + 35, y0 + 175, { font: font(F.cond, 82), fill: isVip ? K.gold : K.white, a: kC });
    txt(c.unit, x + 35 + measure(c.price, font(F.cond, 82)) + 16, y0 + 165, { font: font(F.mono, 18, 700), fill: K.grey, a: kC });

    txt(c.desc, x + 35, y0 + 250, { font: font(F.mono, 19), fill: K.cream, a: kC });
    chip(isVip ? 'SAVE 17% ANNUALLY' : '100% TRANSPARENT', x + 35, y0 + 440, {
      k: kC, bg: isVip ? K.gold : K.border, fg: isVip ? K.ink : K.cream, h: 46, font: font(F.mono, 19, 700)
    });
  });

  hud(t, {
    tl: '06 // COMMERCIAL OVERVIEW', tr: tc(t),
    bl: sec(6, 'ZERO HIDDEN FEES'), br: 'ANNUAL BILLING DISCOUNTS (SAVE 17%)',
    k: ease(seg(lt, .2, .8))
  });
}

// Chapter 9: VIP ALL-INCLUSIVE SUITE (104.0s - 114.0s)
function sVIP(t) {
  bg(K.ink2);
  const lt = t - S.vipSuite;

  dropWord('VIP SUITE.', 140, 220, font(F.cond, 160), S.vipSuite + 0.1, t, { fall: 140, fill: K.gold });
  dropWord('ALL-INCLUSIVE.', 140 + measure('VIP SUITE. ', font(F.cond, 160)), 220, font(F.cond, 160), S.vipSuite + 0.4, t, { fall: 140, fill: K.white });

  const bx = 140, by = 310, bw = 1640, bh = 510;
  const kB = backOut(seg(t, S.vipSuite + 0.4, S.vipSuite + 1.2));
  rrect(bx, by, bw, bh, 28, { fill: K.surface, stroke: K.gold, lw: 3.5, a: kB });

  txt('COMPLETE LUXURY HOSPITALITY ECOSYSTEM', bx + 65, by + 85, { font: font(F.wide, 42), fill: K.goldLight, a: kB });
  txt('₹40,000 / YEAR (SAVE 17% • EQUIVALENT TO ₹3,333 / MONTH)', bx + 65, by + 140, { font: font(F.mono, 22, 700), fill: K.white, ls: 2, a: kB });

  const vipPerks = [
    '✓ Guest QR Table Ordering (Browser-Based, Zero App Download Required)',
    '✓ AI-Powered Upselling Engine (+24.6% Proven Average Check Lift)',
    '✓ VIP Customer Loyalty Program & Automated Guest CRM Profiles',
    '✓ FREE Custom Branded Restaurant Website + Custom Domain Included',
    '✓ Discounted Laser-Cut Acrylic QR Tabletop Stands @ ₹400 / stand (Save ₹100/stand)'
  ];

  vipPerks.forEach((p, i) => {
    const kP = seg(t, S.vipSuite + 0.8 + i * 0.3, S.vipSuite + 1.4 + i * 0.3);
    txt(p, bx + 65, by + 215 + i * 50, { font: font(F.mono, 22, 500), fill: K.cream, a: kP });
  });

  chip('ALL-IN-ONE HOSPITALITY STACK', bx + 65, by + 460, { k: ease(seg(lt, .6, 1.2)), bg: K.gold, fg: K.ink, h: 44, font: font(F.mono, 18, 700) });

  hud(t, {
    tl: '06.1 // VIP ECOSYSTEM', tr: tc(t),
    bl: sec(6, 'COMPLETE DIGITAL REVOLUTION'), br: 'FREE WEBSITE + DOMAIN',
    k: ease(seg(lt, .2, .8))
  });
}

// Chapter 10: FINALE & LAUNCH DEMO (114.0s - 120.0s)
function sEnd(t) {
  bg(K.ink);
  const lt = t - S.end;
  
  glShot(terrain(t, { fade: ease(seg(lt, 0, 1.5)), amp: 0.85, push: t * 0.45, tint: K.gold }));

  const cx = W / 2, cy = H / 2 - 30;
  drawVyomaLogo(cx, cy - 90, 95, backOut(seg(lt, 0.2, 0.9)));

  dropWord('LAUNCH LIVE DEMO', cx, cy + 90, font(F.wide, 100), S.end + 0.3, t, { align: 'center', fill: K.white });
  
  const kUrl = backOut(seg(t, S.end + 0.8, S.end + 1.5));
  rrect(cx - 420, cy + 160, 840, 80, 40, { fill: K.gold, a: kUrl });
  txt('VYOMAPOS.VERCEL.APP', cx, cy + 212, { font: font(F.wide, 36), fill: K.ink, align: 'center', a: kUrl, ls: 2 });

  txt('BOOK VENUE DEMO • ZERO COMMITMENT', cx, cy + 295, { font: font(F.mono, 20, 700), fill: K.goldLight, align: 'center', ls: 5, a: seg(lt, 1.5, 2.8) });

  hud(t, {
    tl: 'VYOMA POS // LIVE DEMO', tr: tc(t),
    bl: 'HTTPS://VYOMAPOS.VERCEL.APP', br: 'STATUS: READY FOR PRODUCTION',
    brackets: true,
    k: ease(seg(lt, .2, .8))
  });

  if (t > Hh.glitch) {
    const g = seg(t, Hh.glitch, Hh.endDot);
    FX.slice = g * 0.5; FX.split = 0.015 * g; FX.seed = Math.floor(t * FPS);
  }
  if (t > Hh.endDot) {
    const k = seg(t, Hh.endDot, Hh.endDot + 0.3);
    bg(K.ink);
    circle(W / 2, H / 2, lerp(60, 4, easeIn(k)) * (1 - seg(t, C.dur - 0.2, C.dur)), { fill: K.gold });
    FX.slice = 0; FX.split = 0;
  }
}

// Transitions
const easeInOut = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const ioExpo = x => { x = clamp(x); return x === 0 ? 0 : x === 1 ? 1 : x < .5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2; };

const trIris = (cx, cy, ring = K.gold) => (k, A, B, g) => {
  const e = easeIn(k) * .6 + ease(k) * .4, R = e * Math.hypot(W, H);
  g.drawImage(A, 0, 0); g.save(); g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.clip(); g.drawImage(B, 0, 0); g.restore();
  g.save(); g.strokeStyle = ring; g.lineWidth = 3 + 12 * (1 - e); g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.stroke(); g.restore();
};

const trZoom = rect => (k, A, B, g) => {
  const [rx, ry, rw, rh] = typeof rect === 'function' ? rect() : rect, e = ioExpo(k), s1 = Math.max(W / rw, H / rh), s = Math.pow(s1, e);
  const cx = rx + rw / 2, cy = ry + rh / 2, px = lerp(cx, W / 2, e), py = lerp(cy, H / 2, e);
  g.save(); g.translate(px, py); g.scale(s, s); g.translate(-cx, -cy); g.drawImage(A, 0, 0); g.restore();
  g.save(); g.beginPath(); g.rect(px - rw / 2 * s, py - rh / 2 * s, rw * s, rh * s); g.clip(); g.globalAlpha = clamp(e * 2.2 - .2); g.drawImage(B, 0, 0); g.restore();
  FX.split = Math.max(FX.split, .008 * Math.sin(Math.PI * e));
};

const trWipe = (col = K.gold) => (k, A, B, g) => {
  const x = easeInOut(k) * (W + 40);
  g.drawImage(A, 0, 0); g.save(); g.beginPath(); g.rect(0, 0, x, H); g.clip(); g.drawImage(B, 0, 0); g.restore();
  g.fillStyle = col; g.fillRect(x - 4, 0, 8, H);
};

const trPush = (dx, dy) => (k, A, B, g) => {
  const e = ioExpo(k);
  g.drawImage(A, -dx * W * e, -dy * H * e);
  g.drawImage(B, dx * W * (1 - e), dy * H * (1 - e));
  FX.split = Math.max(FX.split, .012 * Math.sin(Math.PI * e));
};

const TR = {
  native: [0.6, trIris(W / 2, H / 2, K.gold)],
  speed: [0.6, trZoom(() => RECT.nativeBox || [140, 310, 790, 520])],
  security: [0.55, trPush(0, 1)],
  modules: [0.55, trWipe(K.gold)],
  aggregator: [0.55, trPush(1, 0)],
  aiUpsell: [0.6, trIris(W / 2, H / 2, K.gold)],
  pricing: [0.6, trPush(0, -1)],
  vipSuite: [0.6, trZoom(() => [140, 310, 510, 520])],
  end: [0.65, trIris(W / 2, H / 2, K.gold)]
};

const SCENES = [
  [S.open, sOpen, 'open'],
  [S.native, sNative, 'native'],
  [S.speed, sSpeed, 'speed'],
  [S.security, sSecurity, 'security'],
  [S.modules, sModules, 'modules'],
  [S.aggregator, sAggregator, 'aggregator'],
  [S.aiUpsell, sAI, 'aiUpsell'],
  [S.pricing, sPricing, 'pricing'],
  [S.vipSuite, sVIP, 'vipSuite'],
  [S.end, sEnd, 'end']
];

function renderInto(i, t, buf) {
  ctx = buf.getContext('2d'); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.shadowBlur = 0; ctx.clearRect(0, 0, W, H);
  SCENES[i][1](t); ctx = mainCtx;
}

function frame(t) {
  FX = { split: 0, slice: 0, seed: 0, grain: .04, vign: .3, flash: 0, flashCol: K.gold };
  let i = 0; while (i + 1 < SCENES.length && t >= SCENES[i + 1][0]) i++;
  const [s0, fn, key] = SCENES[i], tr = TR[key];
  ctx = mainCtx; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  if (tr && i > 0 && t < s0 + tr[0]) {
    TRANS = true;
    const keep = FX; FX = { ...keep };
    renderInto(i - 1, s0 - 1 / FPS, bufA);
    FX = keep;
    renderInto(i, t, bufB);
    TRANS = false;
    tr[1](seg(t, s0, s0 + tr[0]), bufA, bufB, mainCtx);
  } else {
    fn(t);
    if (!tr && s0 > 0 && t < s0 + 1 / FPS) FX.flash = Math.max(FX.flash, .08);
  }
  post(t, FX);
}

// Fonts and Render contract
const fontsReady = Promise.all([
  document.fonts.load('100px "Anton"'),
  document.fonts.load('100px "Archivo Black"'),
  document.fonts.load('italic 100px "Instrument Serif"'),
  document.fonts.load('700 20px "JetBrains Mono"'),
  document.fonts.load('500 20px "JetBrains Mono"')
]);

window.renderAt = async (t, type = 'image/png', q = .92) => { frame(t); return out.toDataURL(type, q); };
window.renderSheet = async (times, cols = 5, w = 480, crop = null) => {
  const [, , cw, ch] = crop || [0, 0, W, H], h = Math.round(w * ch / cw), rows = Math.ceil(times.length / cols), sc = document.createElement('canvas');
  sc.width = cols * w; sc.height = rows * h; const c = sc.getContext('2d'), ms = [];
  for (let i = 0; i < times.length; i++) {
    const t0 = performance.now(); frame(times[i]); ms.push(Math.round(performance.now() - t0));
    const x = (i % cols) * w, y = Math.floor(i / cols) * h, [cx, cy] = crop || [0, 0];
    c.drawImage(out, cx, cy, cw, ch, x, y, w, h); c.fillStyle = 'rgba(0,0,0,.65)'; c.fillRect(x, y, 84, 24); c.fillStyle = '#fff'; c.font = '15px sans-serif'; c.fillText(times[i].toFixed(2) + 's', x + 6, y + 17);
  }
  return { url: sc.toDataURL('image/jpeg', .9), ms };
};

window.gpuInfo = () => {
  const gl = RA.getContext(), e = gl.getExtension('WEBGL_debug_renderer_info');
  return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
};

fontsReady.then(() => {
  window.ready = true;
  if (!location.search.includes('render')) {
    const s = document.getElementById('scrub'), lab = document.getElementById('tt');
    const go = () => { const t0 = performance.now(); frame(+s.value); lab.textContent = `${(+s.value).toFixed(2)}s · ${Math.round(performance.now() - t0)} ms`; };
    s.addEventListener('input', go); s.value = new URLSearchParams(location.search).get('t') || 0; go();
  }
});
