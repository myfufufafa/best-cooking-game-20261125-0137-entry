// All sound is synthesized at run time with WebAudio: no audio files are
// shipped, so the game loads nothing over the network. A tiny music loop
// (a slow chord pad plus a sparse pluck melody) runs under the effects and
// can be muted with M. Everything is best-effort: if the browser blocks
// audio before a first gesture, the game plays on silently.

let ctx = null;
let master = null;
let musicGain = null;
let muted = false;
let musicTimer = null;

const MELODY = [523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 440.0];
const CHORDS = [
  [261.63, 329.63, 392.0],
  [174.61, 220.0, 261.63],
  [196.0, 246.94, 293.66],
  [220.0, 261.63, 329.63],
];

function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.5;
  master.connect(ctx.destination);
  musicGain = ctx.createGain();
  musicGain.gain.value = 0.08;
  musicGain.connect(master);
  return ctx;
}

function tone(freq, dur, type, vol, when = 0, slideTo = null) {
  if (!ensure() || muted) return;
  const t0 = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(gain);
  gain.connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noiseBurst(dur, vol, freq) {
  if (!ensure() || muted) return;
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  const gain = ctx.createGain();
  gain.gain.value = vol;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  src.start();
}

export const sfx = {
  unlock() { ensure(); if (ctx && ctx.state === 'suspended') ctx.resume(); },
  click() { tone(660, 0.06, 'sine', 0.15); },
  pickup() { tone(520, 0.08, 'sine', 0.2, 0, 780); },
  putdown() { tone(300, 0.07, 'triangle', 0.18, 0, 220); },
  chop() { noiseBurst(0.05, 0.25, 1800); tone(180, 0.05, 'square', 0.08); },
  chopDone() { tone(740, 0.09, 'sine', 0.2); tone(988, 0.12, 'sine', 0.18, 0.07); },
  sizzle() { noiseBurst(0.35, 0.12, 4200); },
  cookDone() { tone(880, 0.1, 'sine', 0.2); tone(1174, 0.14, 'sine', 0.18, 0.08); },
  serve() {
    tone(523.25, 0.12, 'sine', 0.22);
    tone(659.25, 0.12, 'sine', 0.22, 0.09);
    tone(783.99, 0.2, 'sine', 0.25, 0.18);
  },
  error() { tone(160, 0.16, 'square', 0.12, 0, 110); },
  expire() { tone(392, 0.2, 'sawtooth', 0.1, 0, 196); },
  burn() { noiseBurst(0.3, 0.2, 900); tone(220, 0.3, 'sawtooth', 0.1, 0, 110); },
  win() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, 0.22, 'sine', 0.22, i * 0.12));
  },
};

export function musicStart() {
  if (!ensure() || musicTimer) return;
  let step = 0;
  musicTimer = setInterval(() => {
    if (muted || !ctx) return;
    const chord = CHORDS[Math.floor(step / 4) % CHORDS.length];
    const note = MELODY[step % MELODY.length];
    for (const f of chord) tone(f, 1.9, 'triangle', 0.05);
    if (step % 2 === 0) tone(note, 0.5, 'sine', 0.07);
    step += 1;
  }, 500);
}

export function musicStop() {
  if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
}

export function setMuted(value) {
  muted = value;
  if (master) master.gain.value = muted ? 0 : 0.5;
  return muted;
}

export function isMuted() { return muted; }
