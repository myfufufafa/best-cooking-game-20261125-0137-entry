// Screenshot scenes. Each shot builds a real, reachable game state through
// the world's own data (orders, boards, stoves, the plate, the chef) and the
// renderer draws that state — nothing is faked at the pixel level. A fixed
// seed makes the same shot stage the same frame every time. The list of
// shots is what shots.json asks the browser to capture.

import { mulberry32 } from './random.js';
import { centerOf } from './chef.js';

export const SHOTS = [
  { name: 'cover', desc: 'A busy mid-shift: three orders, a dish mid-assembly, a plate ready to serve.' },
  { name: 'chop', desc: 'The chef at a chopping board, mid-chop, with an order waiting.' },
  { name: 'serve', desc: 'The moment just after a dish is served: sparkles, a score floater, a fresh gap on the board.' },
  { name: 'rush', desc: 'Rush hour: low timers, both stoves going, the chef hurrying with a chopped onion.' },
];

function placeChef(chef, col, row, facing, carrying = null) {
  chef.col = col;
  chef.row = row;
  chef.toCol = col;
  chef.toRow = row;
  const c = centerOf(col, row);
  chef.x = c.x;
  chef.y = c.y;
  chef.facing = facing;
  chef.carrying = carrying;
  chef.carryingPlate = false;
  chef.plateItems = [];
  chef.path = [];
  chef.pendingStation = null;
  chef.moving = false;
}

function setOrder(shift, id, dishId, remaining, total) {
  shift.orders.push({ id, dishId, remaining, total });
  shift.nextId = Math.max(shift.nextId, id + 1);
}

function setShift(shift, elapsed, score, combo, served, strikes) {
  shift.elapsed = elapsed;
  shift.timeLeft = Math.max(0, 180 - elapsed);
  shift.score = score;
  shift.combo = combo;
  shift.served = served;
  shift.strikes = strikes;
  shift.spawnTimer = 6;
}

function steamAt(world, x, y, rng) {
  world.particles.push({
    x: x + (rng() - 0.5) * 16, y: y - rng() * 18,
    vx: (rng() - 0.5) * 6, vy: -30 - rng() * 14,
    life: 0.7, max: 0.9, size: 5 + rng() * 3, color: 'rgba(255,255,255,0.7)',
  });
}

/** Build the named scene into `world`. Unknown names fall back to the cover. */
export function stageShot(name, world, seed = 1) {
  const rng = mulberry32(seed);
  world.reset();
  const shift = world.shift;
  switch (name) {
    case 'chop': {
      setShift(shift, 30, 120, 1, 1, 0);
      setOrder(shift, 1, 'garden-salad', 40, 65);
      setOrder(shift, 2, 'tomato-pasta', 55, 65);
      world.boards['board-1'] = { item: 'tomato', progress: 0.55, done: false };
      world.plate = ['chopped-tomato'];
      placeChef(world.chef, 1, 2, [-1, 0]);
      for (let i = 0; i < 5; i += 1) {
        world.particles.push({
          x: 44 + rng() * 24, y: 300 + rng() * 12,
          vx: (rng() - 0.5) * 60, vy: -20 - rng() * 40,
          life: 0.5, max: 0.9, size: 3 + rng() * 3, color: '#ffffff',
        });
      }
      break;
    }
    case 'serve': {
      setShift(shift, 95, 522, 5, 4, 0);
      setOrder(shift, 1, 'garden-salad', 30, 65);
      setOrder(shift, 2, 'tomato-pasta', 45, 65);
      world.stoves['stove-1'] = { item: 'toasted-bread', progress: 1, done: true, sinceDone: 2 };
      placeChef(world.chef, 12, 6, [0, 1]);
      world.floaters.push({ x: 1000, y: 430, text: '+182', color: '#ffd94d', life: 1.0, max: 1.4 });
      for (let i = 0; i < 8; i += 1) {
        world.particles.push({
          x: 960 + (rng() - 0.5) * 120, y: 620 + (rng() - 0.5) * 30,
          vx: (rng() - 0.5) * 80, vy: (rng() - 0.5) * 80,
          life: 0.7, max: 1.2, size: 2 + rng() * 3, color: '#ffd94d',
        });
      }
      break;
    }
    case 'rush': {
      setShift(shift, 156, 890, 8, 7, 1);
      setOrder(shift, 1, 'garden-salad', 8, 45);
      setOrder(shift, 2, 'tomato-pasta', 15, 45);
      setOrder(shift, 3, 'onion-soup', 30, 45);
      world.boards['board-1'] = { item: 'onion', progress: 0.7, done: false };
      world.boards['board-2'] = { item: 'mushroom', progress: 0.3, done: false };
      world.stoves['stove-1'] = { item: 'chopped-tomato', progress: 0.85, done: false, sinceDone: 0 };
      world.stoves['stove-2'] = { item: 'pasta', progress: 0.5, done: false, sinceDone: 0 };
      world.plate = ['caramelized-onion'];
      world.prep = 'chopped-tomato';
      placeChef(world.chef, 9, 4, [1, 0], 'chopped-onion');
      steamAt(world, 1240, 250, rng);
      steamAt(world, 1240, 410, rng);
      steamAt(world, 1240, 250, rng);
      break;
    }
    case 'cover':
    default: {
      setShift(shift, 70, 340, 3, 3, 0);
      setOrder(shift, 1, 'garden-salad', 35, 65);
      setOrder(shift, 2, 'tomato-pasta', 22, 65);
      setOrder(shift, 3, 'mushroom-melt', 48, 65);
      world.boards['board-1'] = { item: 'chopped-tomato', progress: 1, done: true };
      world.boards['board-2'] = { item: 'onion', progress: 0.55, done: false };
      world.stoves['stove-1'] = { item: 'sauteed-mushroom', progress: 1, done: true, sinceDone: 1 };
      world.stoves['stove-2'] = { item: 'chopped-onion', progress: 0.6, done: false, sinceDone: 0 };
      world.plate = ['tomato-sauce', 'boiled-pasta'];
      world.prep = 'chopped-lettuce';
      placeChef(world.chef, 3, 6, [0, 1]);
      steamAt(world, 1240, 250, rng);
      steamAt(world, 1240, 410, rng);
      break;
    }
  }
  return name;
}
