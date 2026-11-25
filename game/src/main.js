// Ember & Thyme — the game loop and the screen state machine.
// One fixed simulation step (60 Hz) whatever the display's rate; the
// renderer draws the world in the logical 1280x768 space, scaled to the
// window with a device-pixel-ratio transform for crisp lines.
// A `?shot=<name>&seed=<n>` URL stages a scene and draws exactly one frame,
// which is how the screenshots are taken: the same seed, the same frame.

import { FIELD, STEP, BEST_KEY } from './config.js';
import { Input } from './input.js';
import { World } from './world.js';
import { render } from './render.js';
import { stageShot } from './shots.js';
import { sfx, musicStart, musicStop, setMuted, isMuted } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

function resize() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(FIELD.width * dpr);
  canvas.height = Math.round(FIELD.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resize();
window.addEventListener('resize', resize);

const params = new URLSearchParams(location.search);
const shotName = params.get('shot');
const seed = parseInt(params.get('seed') || '1', 10) || 1;

const world = new World();
const input = new Input(canvas);

// A small debug handle for automated playtests (and for the curious): the
// live world and the current screen mode. Harmless in the shipped game.
window.__ember = {
  world,
  get mode() { return mode; },
  get best() { return best; },
};

let mode = 'title';
let best = 0;
try { best = parseInt(localStorage.getItem(BEST_KEY) || '0', 10) || 0; } catch (err) { best = 0; }
let newBest = false;
let time = 0;
let last = performance.now();
let acc = 0;
let statusTimer = 0;

function startShift() {
  world.reset();
  mode = 'playing';
  newBest = false;
  input.takeAction();
  input.takeClick();
  sfx.unlock();
  sfx.click();
  musicStart();
  announce(`New shift started. ${world.shift.orders.length} orders on the board.`);
}

function endShift() {
  mode = 'over';
  if (world.shift.score > best) {
    best = world.shift.score;
    newBest = true;
    try { localStorage.setItem(BEST_KEY, String(best)); } catch (err) { /* private mode */ }
  }
  musicStop();
  if (newBest) sfx.win();
  announce(`Shift over. Score ${world.shift.score}. ${world.shift.served} dishes served.`);
}

function announce(message) {
  if (statusEl) statusEl.textContent = message;
}

function update(dt) {
  time += dt;
  if (input.takeMute()) {
    const muted = setMuted(!isMuted());
    world.hint(muted ? 'Sound off' : 'Sound on');
  }
  if (mode === 'title') {
    if (input.takeEnter() || input.takeClick()) startShift();
    return;
  }
  if (mode === 'over') {
    if (input.takeRestart() || input.takeEnter() || input.takeClick()) startShift();
    return;
  }
  if (mode === 'paused') {
    if (input.takePause() || input.takeEnter()) {
      mode = 'playing';
      sfx.click();
    }
    return;
  }
  if (input.takePause()) {
    mode = 'paused';
    sfx.click();
    return;
  }
  world.update(dt, input);
  if (world.shift.over) endShift();
}

function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  acc += dt;
  while (acc >= STEP) {
    update(STEP);
    acc -= STEP;
  }
  render(ctx, world, { mode, best, newBest, time });
  statusTimer += dt;
  if (statusTimer > 1 && mode === 'playing') {
    statusTimer = 0;
    const s = world.shift;
    announce(`Score ${s.score}. ${Math.ceil(s.timeLeft)} seconds left. ${s.orders.length} orders. Combo times ${s.multiplier.toFixed(1)}.`);
  }
  requestAnimationFrame(frame);
}

if (shotName) {
  // Screenshot mode: stage the scene, draw one frame, stop. The simulation
  // never advances, so the same seed always gives the same frame.
  stageShot(shotName, world, seed);
  mode = 'playing';
  time = 1.2;
  render(ctx, world, { mode, best, newBest, time });
  document.title = `Ember & Thyme — shot: ${shotName}`;
} else {
  requestAnimationFrame(frame);
}
