/**
 * Procedurally synthesizes the full Tickketo soundtrack (music bed + SFX) as a
 * single, frame-synced stereo WAV. No external audio assets are downloaded —
 * everything here is generated from oscillators + filtered noise, which is the
 * only option behind the restricted-egress sandbox.
 *
 * Timeline is keyed to the video at 30fps / 484 frames (~16.13s). Cue times are
 * derived from the scene/beat boundaries in src/Tickketo.tsx + Scene03Flow.tsx.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SR = 44100;
const DUR = 16.3;
const N = Math.floor(SR * DUR);
const L = new Float32Array(N);
const R = new Float32Array(N);

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const idx = (t) => Math.floor(t * SR);

// quick env: linear attack, exponential-ish decay to release
function ampEnv(p, dur, attack, release) {
  if (p < attack) return p / attack;
  const tail = dur - release;
  if (p > tail) return clamp(1 - (p - tail) / release, 0, 1);
  return 1;
}

function add(ch, i, v) {
  if (i < 0 || i >= N) return;
  ch[i] += v;
}

// generic oscillator voice with optional linear freq glide + vibrato
function voice({ f0, f1 = f0, t0, dur, gain = 0.2, type = "sine", attack = 0.005, release = 0.08, pan = 0, vibR = 0, vibF = 5, decayCurve = 1 }) {
  const i0 = idx(t0);
  const n = Math.floor(dur * SR);
  let phase = 0;
  const gl = clamp((1 + pan) / 2, 0, 1);
  const gr = clamp((1 - pan) / 2, 0, 1);
  for (let k = 0; k < n; k++) {
    const p = k / SR;
    const frac = k / n;
    const f = f0 + (f1 - f0) * frac + (vibR ? Math.sin(2 * Math.PI * vibF * p) * vibR : 0);
    phase += (2 * Math.PI * f) / SR;
    let s;
    switch (type) {
      case "square": s = Math.sign(Math.sin(phase)); break;
      case "saw": s = 2 * ((phase / (2 * Math.PI)) % 1) - 1; break;
      case "tri": s = 2 * Math.abs(2 * ((phase / (2 * Math.PI)) % 1) - 1) - 1; break;
      default: s = Math.sin(phase);
    }
    let e = ampEnv(p, dur, attack, release);
    if (decayCurve !== 1) e = Math.pow(e, decayCurve);
    const v = s * e * gain;
    add(L, i0 + k, v * (0.5 + gl));
    add(R, i0 + k, v * (0.5 + gr));
  }
}

// filtered noise burst — whooshes, cheers, hats, confetti
function noise({ t0, dur, gain = 0.2, hp = 0, lp = 1, hpEnd = null, lpEnd = null, attack = 0.01, release = 0.1, pan = 0, curve = 1 }) {
  const i0 = idx(t0);
  const n = Math.floor(dur * SR);
  let lpState = 0;
  let lpState2 = 0;
  const gl = clamp((1 + pan) / 2, 0, 1);
  const gr = clamp((1 - pan) / 2, 0, 1);
  for (let k = 0; k < n; k++) {
    const p = k / SR;
    const frac = k / n;
    const x = Math.random() * 2 - 1;
    const lpC = clamp((lpEnd == null ? lp : lp + (lpEnd - lp) * frac), 0.0005, 1);
    const hpC = clamp((hpEnd == null ? hp : hp + (hpEnd - hp) * frac), 0, 1);
    lpState += lpC * (x - lpState); // lowpass
    lpState2 += hpC * (lpState - lpState2); // for highpass subtraction
    const bp = lpState - lpState2; // band-ish
    let e = ampEnv(p, dur, attack, release);
    if (curve !== 1) e = Math.pow(e, curve);
    const v = bp * e * gain;
    add(L, i0 + k, v * (0.5 + gl));
    add(R, i0 + k, v * (0.5 + gr));
  }
}

function kick({ t0, gain = 0.6, f0 = 130, f1 = 45, dur = 0.16 }) {
  voice({ f0, f1, t0, dur, gain, type: "sine", attack: 0.002, release: 0.09, decayCurve: 2 });
  noise({ t0, dur: 0.02, gain: gain * 0.4, hp: 0.2, lp: 0.9, attack: 0.001, release: 0.018 }); // click
}

function bell({ t0, freq, gain = 0.25, dur = 0.7, pan = 0 }) {
  // inharmonic partials = bell/chime
  const parts = [1, 2.01, 2.99, 4.21];
  const gains = [1, 0.5, 0.3, 0.18];
  parts.forEach((m, i) => voice({ f0: freq * m, t0, dur, gain: gain * gains[i], type: "sine", attack: 0.003, release: dur * 0.8, decayCurve: 2.2, pan }));
}

function chord({ freqs, t0, dur, gain = 0.08, type = "tri", attack = 0.3, release = 0.6, pan = 0 }) {
  freqs.forEach((f, i) => voice({ f0: f, t0, dur, gain, type, attack, release, pan: pan + (i - 1) * 0.18 }));
}

/* ============ NOTE FREQUENCIES ============ */
const Hz = {
  A2: 110, F2: 87.31, C3: 130.81, G2: 98, E3: 164.81,
  A3: 220, C4: 261.63, E4: 329.63, F3: 174.61, G3: 196,
  B3: 246.94, D4: 293.66, G4: 392, A4: 440, C5: 523.25,
  E5: 659.25, G5: 783.99, C6: 1046.5, E6: 1318.5, G6: 1568,
};

/* ============ MUSIC BED ============ */
// progression Am - F - C - G, 2s per chord, from concert start (~2.0s)
const prog = [
  { root: Hz.A2, pad: [Hz.A3, Hz.C4, Hz.E4] },
  { root: Hz.F2, pad: [Hz.F3, Hz.A3, Hz.C4] },
  { root: Hz.C3, pad: [Hz.C4, Hz.E4, Hz.G4] },
  { root: Hz.G2, pad: [Hz.G3, Hz.B3, Hz.D4] },
];
const beat = 0.5; // 120 bpm
const musicStart = 2.0;
const musicEnd = 16.0;

// soft intro drone for the loader (0 - 2s)
chord({ freqs: [Hz.A3, Hz.E4], t0: 0.0, dur: 2.4, gain: 0.05, type: "tri", attack: 0.4, release: 1.0 });

for (let bar = 0; bar < 8; bar++) {
  const t = musicStart + bar * 2;
  if (t >= musicEnd) break;
  const c = prog[bar % 4];
  // pad
  chord({ freqs: c.pad, t0: t, dur: 2.05, gain: 0.06, type: "tri", attack: 0.25, release: 0.8 });
  // bass + kick groove
  for (let b = 0; b < 4; b++) {
    const tb = t + b * beat;
    if (tb >= musicEnd) break;
    const groove = bar >= 1 ? 1 : 0.6; // ease the groove in
    kick({ t0: tb, gain: 0.5 * groove });
    voice({ f0: c.root, t0: tb + 0.02, dur: beat * 0.9, gain: 0.16 * groove, type: "saw", attack: 0.01, release: 0.18, decayCurve: 1.4 });
    // offbeat hat
    noise({ t0: tb + beat / 2, dur: 0.05, gain: 0.05 * groove, hp: 0.6, lp: 0.95, attack: 0.002, release: 0.045 });
  }
  // sparse arp (enters from bar 2 / ~4s)
  if (bar >= 1) {
    const arp = c.pad.concat([c.pad[1] * 2]);
    for (let s = 0; s < 8; s++) {
      const ts = t + s * (beat / 2);
      if (ts >= musicEnd) break;
      const f = arp[s % arp.length] * 2;
      voice({ f0: f, t0: ts, dur: 0.22, gain: 0.05, type: "tri", attack: 0.004, release: 0.18, pan: s % 2 ? 0.4 : -0.4, decayCurve: 1.6 });
    }
  }
}

/* ============ SFX CUES (seconds) ============ */
// loader riser (0.4 -> 2.0) building anticipation
noise({ t0: 0.4, dur: 1.65, gain: 0.16, hp: 0.05, lp: 0.04, lpEnd: 0.5, attack: 1.2, release: 0.3, curve: 1.4 });
voice({ f0: 110, f1: 440, t0: 0.5, dur: 1.5, gain: 0.05, type: "tri", attack: 0.8, release: 0.4 });

// doors-open chime @ ~2.0 (bar fills)
bell({ t0: 1.98, freq: Hz.C6, gain: 0.28, dur: 0.9 });
bell({ t0: 2.06, freq: Hz.G5, gain: 0.20, dur: 1.0, pan: 0.3 });

// loader lifts -> concert reveal whoosh @ ~2.07
noise({ t0: 2.05, dur: 0.4, gain: 0.32, hp: 0.25, lp: 0.5, lpEnd: 0.06, attack: 0.02, release: 0.34, curve: 1.2 });
// crowd swell / cheer (fake, band-passed noise) as concert appears
noise({ t0: 2.1, dur: 1.4, gain: 0.14, hp: 0.18, lp: 0.5, attack: 0.5, release: 0.7, curve: 1.3, pan: 0.2 });
noise({ t0: 2.1, dur: 1.4, gain: 0.12, hp: 0.22, lp: 0.45, attack: 0.6, release: 0.6, pan: -0.2 });

// flow reveal whoosh @ 5.93 (slide to phone flow)
noise({ t0: 5.85, dur: 0.32, gain: 0.26, hp: 0.2, lp: 0.6, lpEnd: 0.08, attack: 0.02, release: 0.28 });

// SWIPE: card flick @ ~6.47 + heart pop @ ~6.7
noise({ t0: 6.45, dur: 0.18, gain: 0.3, hp: 0.5, lp: 0.95, lpEnd: 0.4, attack: 0.005, release: 0.16, pan: 0.5 });
voice({ f0: 700, f1: 1300, t0: 6.7, dur: 0.12, gain: 0.16, type: "sine", attack: 0.004, release: 0.1 });

// BOOK: tap @ ~8.07 + ka-ching @ ~8.47
noise({ t0: 8.05, dur: 0.05, gain: 0.2, hp: 0.5, lp: 0.95, attack: 0.002, release: 0.045 });
voice({ f0: 1200, t0: 8.06, dur: 0.05, gain: 0.12, type: "sine", attack: 0.002, release: 0.04 });
bell({ t0: 8.45, freq: Hz.C6, gain: 0.18, dur: 0.45 });
bell({ t0: 8.55, freq: Hz.E6, gain: 0.2, dur: 0.5, pan: 0.2 });

// HOLD: ticket drop whoosh @ ~9.27 + wallet chime @ ~9.87
noise({ t0: 9.25, dur: 0.3, gain: 0.24, hp: 0.4, lp: 0.7, lpEnd: 0.1, attack: 0.01, release: 0.26 });
voice({ f0: 220, f1: 120, t0: 9.27, dur: 0.18, gain: 0.18, type: "sine", attack: 0.003, release: 0.16, decayCurve: 2 }); // soft thud
bell({ t0: 9.85, freq: Hz.G5, gain: 0.16, dur: 0.4 });
bell({ t0: 9.95, freq: Hz.C6, gain: 0.18, dur: 0.45 });
bell({ t0: 10.05, freq: Hz.E6, gain: 0.2, dur: 0.5, pan: 0.25 });

// LIVE: scanner beeps @ ~10.8 then SUCCESS @ ~11.1 (green/you're in + confetti)
voice({ f0: 880, t0: 10.78, dur: 0.08, gain: 0.16, type: "square", attack: 0.003, release: 0.06 });
voice({ f0: 880, t0: 10.92, dur: 0.08, gain: 0.16, type: "square", attack: 0.003, release: 0.06 });
// success arpeggio (C-E-G-C major)
[Hz.C5, Hz.E5, Hz.G5, Hz.C6].forEach((f, i) => bell({ t0: 11.08 + i * 0.06, freq: f, gain: 0.22, dur: 0.7, pan: (i - 1.5) * 0.2 }));
// confetti pop + cheer
noise({ t0: 11.1, dur: 0.5, gain: 0.18, hp: 0.4, lp: 0.95, lpEnd: 0.5, attack: 0.005, release: 0.45, curve: 1.2 });
noise({ t0: 11.12, dur: 1.0, gain: 0.12, hp: 0.2, lp: 0.5, attack: 0.06, release: 0.7, pan: 0.1 });

// COMING SOON: impact boom @ ~12.13 + letter ticks + sparkle @ ~13.2
voice({ f0: 90, f1: 40, t0: 12.1, dur: 0.5, gain: 0.5, type: "sine", attack: 0.004, release: 0.45, decayCurve: 2 });
noise({ t0: 12.08, dur: 0.5, gain: 0.18, hp: 0.1, lp: 0.6, lpEnd: 0.08, attack: 0.01, release: 0.45 });
for (let i = 0; i < 6; i++) {
  voice({ f0: 1400 + i * 90, t0: 12.45 + i * 0.05, dur: 0.04, gain: 0.07, type: "sine", attack: 0.002, release: 0.035 });
}
[Hz.C6, Hz.E6, Hz.G6].forEach((f, i) => bell({ t0: 13.15 + i * 0.05, freq: f, gain: 0.14, dur: 0.6, pan: (i - 1) * 0.3 }));

// closing swell @ ~15.4 resolving on Am
chord({ freqs: [Hz.A3, Hz.C4, Hz.E4, Hz.A4], t0: 15.0, dur: 1.3, gain: 0.07, type: "tri", attack: 0.2, release: 1.0 });
noise({ t0: 15.0, dur: 1.0, gain: 0.08, hp: 0.5, lp: 0.95, attack: 0.05, release: 0.9 }); // soft cymbal

/* ============ MASTER: soft limiter + fades, write WAV ============ */
// master fade in/out
const fadeIn = idx(0.08);
const fadeOutStart = idx(DUR - 0.35);
for (let i = 0; i < N; i++) {
  let g = 1;
  if (i < fadeIn) g = i / fadeIn;
  if (i > fadeOutStart) g = clamp(1 - (i - fadeOutStart) / (N - fadeOutStart), 0, 1);
  L[i] *= g;
  R[i] *= g;
}
// soft tanh limiter to tame peaks
const drive = 1.1;
for (let i = 0; i < N; i++) {
  L[i] = Math.tanh(L[i] * drive);
  R[i] = Math.tanh(R[i] * drive);
}

// 16-bit PCM stereo WAV
const bytesPerSample = 2;
const dataSize = N * 2 * bytesPerSample;
const buf = Buffer.alloc(44 + dataSize);
buf.write("RIFF", 0);
buf.writeUInt32LE(36 + dataSize, 4);
buf.write("WAVE", 8);
buf.write("fmt ", 12);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20); // PCM
buf.writeUInt16LE(2, 22); // stereo
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 2 * bytesPerSample, 28);
buf.writeUInt16LE(2 * bytesPerSample, 32);
buf.writeUInt16LE(16, 34);
buf.write("data", 36);
buf.writeUInt32LE(dataSize, 40);
let off = 44;
for (let i = 0; i < N; i++) {
  const l = clamp(L[i], -1, 1);
  const r = clamp(R[i], -1, 1);
  buf.writeInt16LE((l * 32767) | 0, off); off += 2;
  buf.writeInt16LE((r * 32767) | 0, off); off += 2;
}
const outDir = path.join(__dirname, "..", "public", "audio");
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "soundtrack.wav");
fs.writeFileSync(outPath, buf);
console.log("wrote", outPath, (dataSize / 1e6).toFixed(2), "MB", DUR + "s");
