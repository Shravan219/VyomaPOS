// music/score.mjs: 120-second (2 minute) pure synthesized electronic soundtrack for Vyoma POS
// Beat-locked @ 120 BPM across 60 bars. Rich dynamic progression, ZERO voiceover.
import { createRequire } from 'module';
import { writeFileSync } from 'fs';
const require = createRequire(import.meta.url);
const C = require('../reel/cues.js'), S = C.S, Hh = C.hits;
const SR = 44100, DUR = C.dur + 0.5, N = Math.ceil(SR * DUR), BEAT = 0.5, TAU = Math.PI * 2;
const L = new Float32Array(N), R = new Float32Array(N), sendL = new Float32Array(N), sendR = new Float32Array(N);
const duck = new Float32Array(N).fill(1);
const musL = new Float32Array(N), musR = new Float32Array(N);
let seed = 42;
const rnd = () => {
  seed |= 0; seed = seed + 0x6D2B79F5 | 0;
  let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
};
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

function put(t0, len, gen, { gain = 1, pan = 0, rev = 0, bus = 'drum' } = {}) {
  const i0 = Math.max(0, Math.floor(t0 * SR)), i1 = Math.min(N, Math.floor((t0 + len) * SR));
  const gl = gain * Math.cos((pan + 1) * Math.PI / 4), gr = gain * Math.sin((pan + 1) * Math.PI / 4);
  const BL = bus === 'mus' ? musL : L, BR = bus === 'mus' ? musR : R;
  for (let i = i0; i < i1; i++) {
    const v = gen(Math.max(0, (i - t0 * SR) / SR));
    BL[i] += v * gl; BR[i] += v * gr;
    sendL[i] += v * gl * rev; sendR[i] += v * gr * rev;
  }
}

function noise(t0, len, env, filt, o = {}) {
  let lp = 0, bp = 0;
  put(t0, len, tt => {
    const n = rnd() * 2 - 1, [fc, q0] = filt(tt), q = Math.max(q0, 0.45);
    const f = Math.min(0.85, 2 * Math.sin(Math.PI * Math.min(fc, SR / 7) / SR));
    lp += f * bp; const hp = n - lp - q * bp; bp += f * hp;
    return env(tt) * (o.hp ? hp : o.lp ? lp : bp);
  }, o);
}

// Drums & Percussion
const kick = (t, v = 1) => {
  put(t, 0.55, tt => v * Math.sin(TAU * (50 * tt + 120 * (1 - Math.exp(-tt * 32)) / 32)) * Math.exp(-tt * 7) * (tt < 0.003 ? tt / 0.003 : 1), { gain: 0.95 });
  noise(t, 0.02, tt => v * 0.4 * Math.exp(-tt * 300), () => [3000, 0.5], { gain: 0.45 });
  const i0 = Math.floor(t * SR);
  for (let i = 0; i < SR * 0.3 && i0 + i < N; i++) duck[i0 + i] = Math.min(duck[i0 + i], 1 - 0.75 * Math.exp(-i / SR * 12));
};

const clap = (t, v = 1) => {
  for (let k = 0; k < 3; k++) {
    noise(t + k * 0.012, 0.25, tt => v * (k === 2 ? 0.8 * Math.exp(-tt * 14) : 0.5 * Math.exp(-tt * 70)), () => [1500, 0.5], { gain: 0.75, rev: 0.3 });
  }
  put(t, 0.12, tt => v * 0.25 * Math.sin(TAU * 200 * tt) * Math.exp(-tt * 30), { gain: 0.55 });
};

const hat = (t, v = 1, open = false) => noise(t, open ? 0.3 : 0.05, tt => v * 0.45 * Math.exp(-tt * (open ? 12 : 75)), () => [9500, 0.6], { gain: 0.5, pan: 0.2, hp: true });
const tick = (t, v = 1) => put(t, 0.03, tt => v * 0.3 * Math.sin(TAU * 2800 * tt) * Math.exp(-tt * 190), { gain: 0.45, pan: -0.2 });

// FX & Textures
const impact = (t, v = 1) => {
  kick(t, v);
  noise(t, 1.5, tt => v * 0.8 * Math.exp(-tt * 3), tt => [1800 * Math.exp(-tt * 2) + 200, 0.7], { gain: 0.7, rev: 0.6, lp: true });
  put(t, 1.8, tt => v * 0.5 * Math.sin(TAU * (36 * tt + 28 * (1 - Math.exp(-tt * 8)) / 8)) * Math.exp(-tt * 2), { gain: 0.8 });
};

const riser = (t, len, v = 1) => {
  noise(t, len, tt => v * 0.35 * Math.pow(tt / len, 2.2), tt => [350 * Math.pow(14, tt / len), 0.6], { gain: 0.55, rev: 0.5, lp: true });
  put(t, len, tt => v * 0.12 * Math.sin(TAU * (200 * tt + 420 * tt * tt / len)) * Math.pow(tt / len, 2), { gain: 0.55, rev: 0.4, bus: 'mus' });
};

const blip = (t, m = 93, v = 1, pan = 0) => put(t, 0.15, tt => v * 0.28 * Math.sin(TAU * mtof(m) * tt) * Math.exp(-tt * 26), { gain: 0.7, pan, rev: 0.35, bus: 'mus' });

const stab = (t, notes, v = 1) => notes.forEach((m, i) => {
  put(t, 0.7, tt => v * 0.12 * (Math.sin(TAU * mtof(m) * tt) + 0.5 * Math.sin(TAU * mtof(m) * 2.001 * tt)) * Math.exp(-tt * 5), { gain: 0.8, pan: (i - 1) * 0.3, rev: 0.45, bus: 'mus' });
});

const odo = (t, len, v = 1) => {
  for (let k = 0; k < len / 0.045; k++) tick(t + k * 0.045 * (1 + k * 0.02), v * (0.5 + 0.5 * rnd()));
};

// Synths & Pads
const bass = (t, m, len, v = 1) => {
  let ph = 0;
  put(t, len + 0.05, tt => {
    ph += mtof(m) / SR;
    const saw = 2 * (ph % 1) - 1, sq = (ph % 1) < 0.5 ? 1 : -1;
    const env = Math.min(1, tt / 0.005) * (tt < len ? 1 : Math.exp(-(tt - len) * 55));
    return v * 0.34 * env * (Math.tanh(1.8 * (saw * 0.6 + sq * 0.25 + Math.sin(TAU * ph * 0.5) * 0.8)));
  }, { gain: 0.8, bus: 'mus' });
};

const pluck = (t, m, v = 1, pan = 0) => put(t, 0.5, tt => v * 0.16 * (Math.sin(TAU * mtof(m) * tt) + 0.3 * Math.sin(TAU * mtof(m) * 2 * tt) * Math.exp(-tt * 12)) * Math.exp(-tt * 9), { gain: 0.8, pan, rev: 0.3, bus: 'mus' });

const pad = (t, notes, len, v = 1) => notes.forEach((m, i) => {
  const d = [1, 1.004, 0.996];
  put(t, len + 0.8, tt => {
    let s = 0;
    for (const k of d) for (let h = 1; h <= 4; h++) s += Math.sin(TAU * mtof(m) * k * h * tt + h) / (h * h);
    return v * 0.025 * s * Math.min(1, tt / 0.4) * (tt > len ? Math.exp(-(tt - len) * 4) : 1);
  }, { gain: 0.8, pan: (i - 1) * 0.4, rev: 0.6, bus: 'mus' });
});

const bloom = (t, notes, v = 1) => notes.forEach((m, i) => {
  put(t + i * 0.03, 1.6, tt => v * 0.07 * (Math.sin(TAU * mtof(m) * tt) + 0.3 * Math.sin(TAU * mtof(m) * 2.01 * tt)) * Math.min(1, tt / 0.08) * Math.exp(-tt * 2.4), { gain: 0.85, pan: (i - 1) * 0.4, rev: 0.6, bus: 'mus' });
});

const swell = (tEnd, notes, len = 1.6, v = 1) => notes.forEach((m, i) => {
  put(tEnd - len, len + 0.06, tt => {
    const q = tt / len, env = q < 1 ? Math.pow(q, 2.6) : Math.max(0, 1 - (tt - len) / 0.06);
    let s = 0;
    for (let h = 1; h <= 3; h++) s += Math.sin(TAU * mtof(m) * h * tt + h) / (h * h);
    return v * 0.07 * s * env;
  }, { gain: 0.8, pan: (i / Math.max(1, notes.length - 1) - 0.5) * 0.6, rev: 0.35, bus: 'mus' });
});

// Chord Progression: Am -> F -> C -> G (Gold / Luxury electronic feel)
const CH_HARMONY = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
const ROOT = [33, 29, 36, 31];
const barOf = t => Math.floor(t / 2);

// Intro build (0 - 8s)
pad(0, [57, 64, 69], 7.5, 0.85);
riser(1.0, 5.0, 0.7);
blip(Hh.introDot, 88, 0.8);
impact(Hh.introCrest, 1.0);
stab(6.0, [57, 60, 64, 69], 0.9);

// Main groove through 118s (120 BPM: cuts on beats, chapter changes on bars)
for (let t = S.native; t < Hh.glitch; t += BEAT) {
  const b = Math.round(t / BEAT), beatIn = b % 4, ch = barOf(t) % 4;
  // Dynamic intensity variations by chapter
  const isBreak = (t >= 32 && t < 34) || (t >= 74 && t < 76) || (t >= 112 && t < 114);
  const isHeavy = (t >= 22 && t < 32) || (t >= 48 && t < 64) || (t >= 76 && t < 90);

  if (!isBreak) {
    kick(t, beatIn === 0 ? 1.0 : (isHeavy ? 0.8 : 0.7));
    if (beatIn === 1 || beatIn === 3) clap(t, 0.75);
    for (let e = 0; e < 2; e++) hat(t + e * BEAT / 2, e ? 0.85 : 0.45, e === 1 && beatIn === 3);
    bass(t, ROOT[ch] + 12, BEAT * 0.45, 0.9);
    bass(t + BEAT / 2, ROOT[ch] + (beatIn === 3 ? 19 : 12), BEAT * 0.4, 0.75);
    for (let s2 = 0; s2 < 4; s2++) {
      pluck(t + s2 * BEAT / 4, CH_HARMONY[ch][(b * 4 + s2) % 3] + 12 + (s2 === 3 ? 12 : 0), 0.4, s2 % 2 ? 0.35 : -0.35);
    }
  } else {
    // Breakdown bars with atmospheric pads and riser
    if (beatIn === 0) riser(t, 2.0, 0.7);
  }
  if (beatIn === 0) pad(t, CH_HARMONY[ch].map(m => m + 12), 1.9, 0.65);
}

// Scene Transitions & Major Chapter Blooms across 120s
bloom(S.native, [69, 76, 81], 0.9);
swell(S.speed, [53, 57, 60], 1.5, 0.85);
bloom(S.speed, [65, 72, 77], 0.9);
odo(Hh.speedOdo, 1.5, 0.8);

swell(S.security, [57, 60, 64], 1.5, 0.85);
bloom(S.security, [69, 72, 76], 0.9);
blip(Hh.secShield, 93, 0.85);
Hh.secGates.forEach((t, i) => blip(t, 84 + i * 4, 0.75));

swell(S.modules, [48, 52, 55], 1.5, 0.85);
bloom(S.modules, [60, 67, 72], 0.9);
Hh.modGrid.forEach((t, i) => blip(t, 84 + i * 3, 0.8, -0.4 + i * 0.25));

swell(S.aggregator, [55, 59, 62], 1.5, 0.85);
bloom(S.aggregator, [67, 74, 79], 0.9);
Hh.aggTokens.forEach((t, i) => tick(t, 0.8));

swell(S.aiUpsell, [57, 60, 64], 1.5, 0.9);
bloom(S.aiUpsell, [69, 76, 81], 0.95);
odo(Hh.aiRoll, 1.8, 0.9);
stab(Hh.aiRoll + 1.8, [72, 76, 79, 84], 1.0);

swell(S.pricing, [53, 57, 60], 1.5, 0.85);
bloom(S.pricing, [65, 72, 77], 0.9);
Hh.pricePills.forEach((t, i) => blip(t, 86 + i * 4, 0.8));

swell(S.vipSuite, [48, 52, 55], 1.5, 0.9);
bloom(S.vipSuite, [60, 67, 72], 0.95);
Hh.vipHighlights.forEach((t, i) => tick(t, 0.85));

swell(S.end, [57, 64, 69, 72], 1.8, 1.0);
impact(S.end, 1.15);
stab(Hh.finaleLogo, [57, 60, 64, 69], 1.0);
impact(Hh.glitch, 0.9);
blip(Hh.endDot, 93, 0.85);

// Reverb & Master Bus
function verb(inp, spread) {
  const combs = [1116, 1188, 1277, 1356, 1422, 1491].map(d => ({ b: new Float32Array(d + spread), i: 0, s: 0 }));
  const aps = [556, 441, 341].map(d => ({ b: new Float32Array(d + spread), i: 0 }));
  const o = new Float32Array(N);
  for (let n = 0; n < N; n++) {
    const x = inp[n] * 0.02; let y = 0;
    for (const c of combs) {
      const v = c.b[c.i]; c.s = v * 0.7 + c.s * 0.3; c.b[c.i] = x + c.s * 0.82;
      c.i = (c.i + 1) % c.b.length; y += v;
    }
    for (const a of aps) {
      const v = a.b[a.i]; a.b[a.i] = y + v * 0.5; a.i = (a.i + 1) % a.b.length; y = v - y;
    }
    o[n] = y;
  }
  return o;
}

const wl = verb(sendL, 0), wr = verb(sendR, 23);
const oL = new Float32Array(N), oR = new Float32Array(N);
let peak = 0;
for (let n = 0; n < N; n++) {
  let l = L[n] + musL[n] * duck[n] + wl[n] * 3.8;
  let r = R[n] + musR[n] * duck[n] + wr[n] * 3.8;
  l = Math.tanh(l * 1.25) / 1.25 * 1.1;
  r = Math.tanh(r * 1.25) / 1.25 * 1.1;
  oL[n] = l; oR[n] = r;
  peak = Math.max(peak, Math.abs(l), Math.abs(r));
}

const g = 0.92 / (peak || 1), fadeOut = Math.floor((C.dur - 0.4) * SR);
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVE', 8);
buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);

for (let n = 0; n < N; n++) {
  const f = Math.min(1, n / (0.02 * SR)) * (n > fadeOut ? Math.max(0, 1 - (n - fadeOut) / (1.5 * SR)) : 1);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, oL[n] * g * f)) * 32767), 44 + n * 4);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, oR[n] * g * f)) * 32767), 46 + n * 4);
}

writeFileSync(new URL('./score.wav', import.meta.url), buf);
console.log(`score.wav synthesized: ${DUR} s (120s full reel), peak ${peak.toFixed(2)} → normalized`);
