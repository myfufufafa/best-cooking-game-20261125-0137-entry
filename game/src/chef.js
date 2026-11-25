// The chef: a cook on the floor grid. Movement is tile by tile with smooth
// interpolation, so the chef glides instead of hopping. Keyboard steps walk
// one tile at a time; a mouse click sets a path (breadth-first through the
// floor) and the chef follows it, optionally interacting with a station at
// the end. The chef carries one thing at a time, held over their head.

import { TILE, HUD_H, CHEF_SPEED } from './config.js';
import { walkable, findPath, tileToPx } from './kitchen.js';

export const DIRS = {
  up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0],
};

export function centerOf(col, row) {
  const p = tileToPx(col, row);
  return { x: p.x + TILE / 2, y: p.y + TILE / 2 };
}

export class Chef {
  constructor() {
    this.reset();
  }

  reset() {
    // Spawn on open floor below the prep island (the island itself is
    // cols 7-8, rows 3-4, so (8,4) would strand the chef on top of it).
    this.col = 8;
    this.row = 5;
    const c = centerOf(this.col, this.row);
    this.x = c.x;
    this.y = c.y;
    this.toCol = this.col;
    this.toRow = this.row;
    this.facing = [0, 1];
    this.carrying = null;
    this.path = [];
    this.pendingStation = null;
    this.moving = false;
  }

  /** Pixel centre of the tile the chef is heading to. */
  get target() { return centerOf(this.toCol, this.toRow); }

  /** The tile directly in front of the chef, by facing. */
  faceTile() {
    return { col: this.col + this.facing[0], row: this.row + this.facing[1] };
  }

  /** Walk to an adjacent tile (keyboard step). Returns false when blocked. */
  step(dx, dy) {
    if (this.moving) return false;
    const nc = this.col + dx;
    const nr = this.row + dy;
    if (!walkable(nc, nr)) return false;
    this.path = [];
    this.pendingStation = null;
    this.facing = [dx, dy];
    this.toCol = nc;
    this.toRow = nr;
    this.moving = true;
    return true;
  }

  /** Set a path to follow (mouse click), and optionally interact at the end. */
  setPath(path, station = null) {
    this.path = path || [];
    this.pendingStation = station;
  }

  /** Stop following a path (the player took over with the keyboard). */
  cancelPath() {
    this.path = [];
    this.pendingStation = null;
  }

  get idle() { return !this.moving && this.path.length === 0; }

  /**
   * Advance one step. Returns the station to interact with when a path
   * finished at one, or null.
   */
  update(dt, moveDir) {
    if (moveDir) {
      this.cancelPath();
      // Turning is instant: pressing toward a counter turns the chef to
      // face it even when the step itself is blocked, so E can use it.
      this.facing = moveDir;
      if (!this.moving) this.step(moveDir[0], moveDir[1]);
    }
    if (this.moving) {
      const t = this.target;
      const speed = CHEF_SPEED * TILE * dt;
      const dx = t.x - this.x;
      const dy = t.y - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= speed) {
        this.x = t.x;
        this.y = t.y;
        this.col = this.toCol;
        this.row = this.toRow;
        this.moving = false;
        if (this.path.length > 0) {
          const [nc, nr] = this.path.shift();
          this.facing = [Math.sign(nc - this.col), Math.sign(nr - this.row)];
          this.toCol = nc;
          this.toRow = nr;
          this.moving = true;
        } else if (this.pendingStation) {
          const st = this.pendingStation;
          this.pendingStation = null;
          // Face the station before interacting with it.
          const [sc, sr] = st.tiles[0];
          this.facing = [Math.sign(sc - this.col), Math.sign(sr - this.row)];
          if (this.facing[0] === 0 && this.facing[1] === 0) this.facing = [0, 1];
          return st;
        }
      } else {
        this.x += (dx / dist) * speed;
        this.y += (dy / dist) * speed;
      }
    } else if (this.path.length > 0) {
      const [nc, nr] = this.path.shift();
      this.facing = [Math.sign(nc - this.col), Math.sign(nr - this.row)];
      this.toCol = nc;
      this.toRow = nr;
      this.moving = true;
    } else if (this.pendingStation) {
      // Already standing next to the station (an empty path): use it at
      // once instead of waiting for a move that never comes.
      const st = this.pendingStation;
      this.pendingStation = null;
      const [sc, sr] = st.tiles[0];
      this.facing = [Math.sign(sc - this.col), Math.sign(sr - this.row)];
      if (this.facing[0] === 0 && this.facing[1] === 0) this.facing = [0, 1];
      return st;
    }
    return null;
  }
}

/** A path to the floor tile next to a station (for click-to-interact). */
export function pathToStation(chef, station) {
  return findPath(chef.col, chef.row, { station });
}

/** A path to a walkable floor tile (for click-to-move). */
export function pathToTile(chef, col, row) {
  if (!walkable(col, row)) return null;
  if (col === chef.col && row === chef.row) return [];
  return findPath(chef.col, chef.row, { col, row });
}
