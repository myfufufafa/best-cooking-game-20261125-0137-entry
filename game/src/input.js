// Keyboard and mouse input. Movement is held keys (WASD or arrows); the
// action key (E or Space) is edge-triggered. A mouse click on a floor tile
// walks the chef there; a click on a station walks to it and interacts.
// All coordinates are in the game's logical 1280x768 space; the canvas
// element scales them back with its bounding rect.

import { FIELD } from './config.js';

const KEY_DIRS = {
  ArrowUp: [0, -1], KeyW: [0, -1],
  ArrowDown: [0, 1], KeyS: [0, 1],
  ArrowLeft: [-1, 0], KeyA: [-1, 0],
  ArrowRight: [1, 0], KeyD: [1, 0],
};

export class Input {
  constructor(canvas) {
    this.keys = new Set();
    // A quick tap on a movement key queues one step, so a tap always moves
    // the chef one tile even when the key is released before the next frame.
    this.dirQueue = [];
    this.actionQueued = false;
    this.clickQueued = null;
    this.anyKeyQueued = false;
    canvas.addEventListener('pointerdown', (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * FIELD.width;
      const y = ((event.clientY - rect.top) / rect.height) * FIELD.height;
      this.clickQueued = { x, y };
      this.anyKeyQueued = true;
    });
    window.addEventListener('keydown', (event) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
        event.preventDefault();
      }
      if (!event.repeat) {
        this.anyKeyQueued = true;
        if (KEY_DIRS[event.code]) this.dirQueue.push(KEY_DIRS[event.code]);
        if (event.code === 'KeyE' || event.code === 'Space') this.actionQueued = true;
        if (event.code === 'Enter') this.enterQueued = true;
        if (event.code === 'KeyP' || event.code === 'Escape') this.pauseQueued = true;
        if (event.code === 'KeyM') this.muteQueued = true;
        if (event.code === 'KeyR') this.restartQueued = true;
      }
      this.keys.add(event.code);
    });
    window.addEventListener('keyup', (event) => {
      this.keys.delete(event.code);
    });
    window.addEventListener('blur', () => this.keys.clear());
    this.enterQueued = false;
    this.pauseQueued = false;
    this.muteQueued = false;
    this.restartQueued = false;
  }

  /** The movement direction the player currently holds, or null. */
  moveDir() {
    // Vertical first, then horizontal: holding two keys walks one axis.
    for (const code of ['ArrowUp', 'KeyW', 'ArrowDown', 'KeyS']) {
      if (this.keys.has(code)) return KEY_DIRS[code];
    }
    for (const code of ['ArrowLeft', 'KeyA', 'ArrowRight', 'KeyD']) {
      if (this.keys.has(code)) return KEY_DIRS[code];
    }
    return null;
  }

  /** One queued step from a quick tap on a movement key, or null. */
  takeStepDir() {
    return this.dirQueue.length > 0 ? this.dirQueue.shift() : null;
  }

  /** A held key supersedes queued taps: drop them. */
  clearStepQueue() {
    this.dirQueue.length = 0;
  }

  takeAction() {
    const queued = this.actionQueued;
    this.actionQueued = false;
    return queued;
  }

  takeClick() {
    const click = this.clickQueued;
    this.clickQueued = null;
    return click;
  }

  takeEnter() {
    const queued = this.enterQueued;
    this.enterQueued = false;
    return queued;
  }

  takePause() {
    const queued = this.pauseQueued;
    this.pauseQueued = false;
    return queued;
  }

  takeMute() {
    const queued = this.muteQueued;
    this.muteQueued = false;
    return queued;
  }

  takeRestart() {
    const queued = this.restartQueued;
    this.restartQueued = false;
    return queued;
  }

  takeAnyKey() {
    const queued = this.anyKeyQueued;
    this.anyKeyQueued = false;
    return queued;
  }
}
