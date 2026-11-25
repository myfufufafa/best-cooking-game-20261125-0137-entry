// The world: everything that changes while a shift runs. It owns the shift
// (orders, score, combo), the station state (boards, stoves, the plate, the
// prep table), the chef, particles and the hint line — and the one verb the
// whole game hangs on: interact with the station you face.

import { CHOP_SECONDS, COOK_SECONDS, BURN_SECONDS } from './config.js';
import { INGREDIENTS, DISHES } from './config.js';
import { STATIONS, stationAt, pxToTile, tileToPx } from './kitchen.js';
import { Chef, pathToStation, pathToTile, centerOf } from './chef.js';
import { Shift } from './orders.js';
import { sfx } from './audio.js';
import { TILE } from './config.js';

function isPlateable(item) {
  for (const dish of Object.values(DISHES)) {
    if (dish.needs.includes(item)) return true;
  }
  return false;
}

export class World {
  constructor(rng) {
    this.rng = rng || Math.random;
    this.shift = new Shift(this.rng);
    this.chef = new Chef();
    this.reset();
  }

  reset() {
    this.shift.reset();
    this.chef.reset();
    this.boards = {};
    this.stoves = {};
    for (const st of STATIONS) {
      if (st.kind === 'board') this.boards[st.id] = { item: null, progress: 0, done: false };
      if (st.kind === 'stove') this.stoves[st.id] = { item: null, progress: 0, done: false, sinceDone: 0 };
    }
    this.plate = [];
    this.prep = null;
    this.particles = [];
    this.floaters = [];
    this.hintText = '';
    this.hintT = 0;
    this.rushFlashed = false;
  }

  /** The order the plate currently completes, or null. */
  plateOrder() {
    return this.plate.length > 0 ? this.shift.matchOrder(this.plate) : null;
  }

  hint(text) {
    this.hintText = text;
    this.hintT = 2.2;
  }

  floater(x, y, text, color) {
    this.floaters.push({ x, y, text, color, life: 1.4, max: 1.4 });
  }

  puff(x, y, color, n = 6, speed = 60) {
    for (let i = 0; i < n; i += 1) {
      const a = Math.random() * Math.PI * 2;
      const v = speed * (0.4 + Math.random() * 0.8);
      this.particles.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 30,
        life: 0.5 + Math.random() * 0.4, max: 0.9, size: 3 + Math.random() * 4, color,
      });
    }
  }

  steam(x, y) {
    this.particles.push({
      x: x + (Math.random() - 0.5) * 20, y, vx: (Math.random() - 0.5) * 8,
      vy: -34 - Math.random() * 18, life: 0.9, max: 0.9, size: 5 + Math.random() * 4,
      color: 'rgba(255,255,255,0.7)',
    });
  }

  sparkle(x, y) {
    for (let i = 0; i < 14; i += 1) {
      const a = Math.random() * Math.PI * 2;
      const v = 40 + Math.random() * 90;
      this.particles.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        life: 0.7 + Math.random() * 0.5, max: 1.2, size: 2 + Math.random() * 3, color: '#ffd94d',
      });
    }
  }

  /** The station the chef faces right now, or null. */
  facedStation() {
    const tile = this.chef.faceTile();
    return stationAt(tile.col, tile.row);
  }

  interact(station) {
    if (!station) return;
    const chef = this.chef;
    switch (station.kind) {
      case 'crate': {
        if (chef.carrying || chef.carryingPlate) { this.hint('Hands full!'); sfx.error(); return; }
        chef.carrying = station.gives;
        sfx.pickup();
        break;
      }
      case 'board': {
        const board = this.boards[station.id];
        if (board.item && board.done) {
          if (chef.carrying || chef.carryingPlate) { this.hint('Hands full!'); sfx.error(); return; }
          chef.carrying = board.item;
          board.item = null; board.progress = 0; board.done = false;
          sfx.pickup();
        } else if (board.item) {
          this.hint('Still chopping…');
        } else if (chef.carrying && INGREDIENTS[chef.carrying].chop) {
          board.item = chef.carrying;
          board.progress = 0; board.done = false;
          chef.carrying = null;
          sfx.putdown();
        } else if (chef.carrying) {
          this.hint("Can't chop that.");
          sfx.error();
        }
        break;
      }
      case 'stove': {
        const stove = this.stoves[station.id];
        if (stove.item && stove.done) {
          if (chef.carrying || chef.carryingPlate) { this.hint('Hands full!'); sfx.error(); return; }
          chef.carrying = stove.item;
          stove.item = null; stove.progress = 0; stove.done = false; stove.sinceDone = 0;
          sfx.pickup();
        } else if (stove.item) {
          this.hint('Still cooking…');
        } else if (chef.carrying && INGREDIENTS[chef.carrying].cook) {
          stove.item = chef.carrying;
          stove.progress = 0; stove.done = false; stove.sinceDone = 0;
          chef.carrying = null;
          sfx.putdown();
          sfx.sizzle();
        } else if (chef.carrying) {
          this.hint("Can't cook that.");
          sfx.error();
        }
        break;
      }
      case 'plate': {
        if (chef.carryingPlate) { this.hint('Already holding the plate.'); return; }
        if (chef.carrying) {
          if (!isPlateable(chef.carrying)) { this.hint('That needs preparing first.'); sfx.error(); return; }
          if (this.plate.length >= 3) { this.hint('The plate is full.'); sfx.error(); return; }
          this.plate.push(chef.carrying);
          chef.carrying = null;
          sfx.putdown();
          const order = this.plateOrder();
          if (order) sfx.chopDone();
        } else if (this.plate.length > 0) {
          chef.carryingPlate = true;
          chef.plateItems = [...this.plate];
          this.plate = [];
          sfx.pickup();
        } else {
          this.hint('The plate is empty.');
        }
        break;
      }
      case 'serve': {
        if (!chef.carryingPlate) {
          this.hint(chef.carrying ? 'Serve a finished plate here.' : 'Bring a finished plate.');
          sfx.error();
          return;
        }
        const result = this.shift.serve(chef.plateItems);
        if (!result) {
          this.hint("That plate isn't an order yet.");
          sfx.error();
          return;
        }
        const p = tileToPx(station.tiles[1][0], station.tiles[1][1]);
        chef.carryingPlate = false;
        chef.plateItems = [];
        this.sparkle(p.x + TILE / 2, p.y + TILE / 2 - 10);
        this.floater(chef.x, chef.y - 60, `+${result.points}`, '#ffd94d');
        sfx.serve();
        break;
      }
      case 'trash': {
        if (chef.carryingPlate) {
          chef.carryingPlate = false;
          chef.plateItems = [];
          this.hint('Plate cleared.');
          sfx.putdown();
        } else if (chef.carrying) {
          chef.carrying = null;
          sfx.putdown();
        }
        break;
      }
      case 'prep': {
        if (this.prep && !chef.carrying && !chef.carryingPlate) {
          chef.carrying = this.prep;
          this.prep = null;
          sfx.pickup();
        } else if (!this.prep && chef.carrying) {
          this.prep = chef.carrying;
          chef.carrying = null;
          sfx.putdown();
        } else if (this.prep) {
          this.hint('Hands full!');
          sfx.error();
        }
        break;
      }
      default:
        break;
    }
  }

  /** A click on the kitchen: walk to a floor tile, or to a station and use it. */
  handleClick(x, y) {
    const tile = pxToTile(x, y);
    const station = stationAt(tile.col, tile.row);
    if (station) {
      const path = pathToStation(this.chef, station);
      if (path) this.chef.setPath(path, station);
      return;
    }
    const path = pathToTile(this.chef, tile.col, tile.row);
    if (path) this.chef.setPath(path);
  }

  update(dt, input) {
    const chef = this.chef;
    // Movement: a held key walks continuously; a quick tap steps once.
    let dir = input.moveDir();
    if (dir) input.clearStepQueue();
    else dir = input.takeStepDir();
    const arrived = chef.update(dt, dir);
    if (arrived) this.interact(arrived);
    if (input.takeAction()) {
      const station = this.facedStation();
      if (station) this.interact(station);
    }
    const click = input.takeClick();
    if (click) this.handleClick(click.x, click.y);

    // Boards and stoves work on their own once an item is on them.
    for (const st of STATIONS) {
      if (st.kind === 'board') {
        const board = this.boards[st.id];
        if (board.item && !board.done) {
          board.progress += dt / CHOP_SECONDS;
          if (board.progress >= 1) {
            board.progress = 1;
            board.done = true;
            board.item = INGREDIENTS[board.item].chop;
            const p = centerOf(st.tiles[0][0], st.tiles[0][1]);
            this.puff(p.x, p.y, '#ffffff', 8, 70);
            sfx.chopDone();
          }
        }
      }
      if (st.kind === 'stove') {
        const stove = this.stoves[st.id];
        if (stove.item && !stove.done) {
          stove.progress += dt / COOK_SECONDS;
          const p = centerOf(st.tiles[0][0], st.tiles[0][1]);
          if (Math.random() < dt * 6) this.steam(p.x, p.y - 14);
          if (stove.progress >= 1) {
            stove.progress = 1;
            stove.done = true;
            stove.sinceDone = 0;
            stove.item = INGREDIENTS[stove.item].cook;
            sfx.cookDone();
          }
        } else if (stove.item && stove.done) {
          stove.sinceDone += dt;
          const p = centerOf(st.tiles[0][0], st.tiles[0][1]);
          if (Math.random() < dt * 2) this.steam(p.x, p.y - 14);
          if (stove.item !== 'burnt' && stove.sinceDone > BURN_SECONDS) {
            stove.item = 'burnt';
            this.hint('It burned! Bin it.');
            sfx.burn();
            this.puff(p.x, p.y - 10, '#666666', 10, 50);
          }
        }
      }
    }

    // The shift clock: spawns, expiries, rush, and the end of the shift.
    for (const event of this.shift.update(dt)) {
      if (event.type === 'expire') {
        sfx.expire();
        this.hint(`Order #${event.order.id} expired!`);
      } else if (event.type === 'rush') {
        sfx.cookDone();
        this.hint('RUSH HOUR — orders are coming fast!');
      }
    }

    // Particles, floaters and the hint line age out.
    for (const p of this.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy -= 20 * dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const f of this.floaters) {
      f.life -= dt;
      f.y -= 34 * dt;
    }
    this.floaters = this.floaters.filter((f) => f.life > 0);
    if (this.hintT > 0) this.hintT -= dt;
  }
}
