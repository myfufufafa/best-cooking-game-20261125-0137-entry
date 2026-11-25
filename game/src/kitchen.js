// The kitchen: a tile grid of counters and floor, and the stations on it.
// Tiles are (col, row) with col 0..15 left to right, row 0..7 top to bottom.
// The outer ring is counters; the middle is floor, cut by a prep island the
// chef walks around — planning the route through it is half the game.

import { COLS, ROWS, TILE, HUD_H } from './config.js';

export function tileToPx(col, row) {
  return { x: col * TILE, y: HUD_H + row * TILE };
}

export function pxToTile(x, y) {
  return {
    col: Math.floor(x / TILE),
    row: Math.floor((y - HUD_H) / TILE),
  };
}

export function inGrid(col, row) {
  return col >= 0 && col < COLS && row >= 0 && row < ROWS;
}

function station(id, kind, tiles, label, extra = {}) {
  return { id, kind, tiles, label, ...extra };
}

/** Every station in the kitchen, in a fixed order. */
export const STATIONS = [
  station('crate-tomato', 'crate', [[1, 0]], 'Tomato', { gives: 'tomato' }),
  station('crate-mushroom', 'crate', [[3, 0]], 'Mushroom', { gives: 'mushroom' }),
  station('crate-onion', 'crate', [[5, 0]], 'Onion', { gives: 'onion' }),
  station('crate-lettuce', 'crate', [[7, 0]], 'Lettuce', { gives: 'lettuce' }),
  station('crate-bread', 'crate', [[9, 0]], 'Bread', { gives: 'bread' }),
  station('crate-cheese', 'crate', [[11, 0]], 'Cheese', { gives: 'cheese' }),
  station('crate-pasta', 'crate', [[13, 0]], 'Pasta', { gives: 'pasta' }),
  station('board-1', 'board', [[0, 2]], 'Chopping Board'),
  station('board-2', 'board', [[0, 4]], 'Chopping Board'),
  station('stove-1', 'stove', [[15, 2]], 'Stove'),
  station('stove-2', 'stove', [[15, 4]], 'Stove'),
  station('plate', 'plate', [[2, 7], [3, 7], [4, 7]], 'Plating Counter'),
  station('serve', 'serve', [[11, 7], [12, 7], [13, 7]], 'Serving Window'),
  station('trash', 'trash', [[14, 7]], 'Trash'),
  station('prep', 'prep', [[7, 3], [8, 3], [7, 4], [8, 4]], 'Prep Table'),
];

const byTile = new Map();
for (const st of STATIONS) {
  for (const [col, row] of st.tiles) byTile.set(`${col},${row}`, st);
}

/** The station owning a tile, or null when the tile is floor or wall. */
export function stationAt(col, row) {
  return byTile.get(`${col},${row}`) || null;
}

/** A tile is walkable when it is interior floor: not a station, not a wall. */
export function walkable(col, row) {
  if (!inGrid(col, row)) return false;
  if (col === 0 || col === COLS - 1 || row === 0 || row === ROWS - 1) return false;
  return !byTile.has(`${col},${row}`);
}

/** The four neighbours of a tile, in a fixed order (for pathfinding). */
export function neighbours(col, row) {
  const out = [];
  for (const [dc, dr] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
    if (walkable(col + dc, row + dr)) out.push([col + dc, row + dr]);
  }
  return out;
}

/**
 * Breadth-first path from (fromCol, fromRow) to the nearest walkable tile
 * next to a station, or to a walkable target tile. Returns a list of tiles
 * (without the start), or null when nothing is reachable.
 */
export function findPath(fromCol, fromRow, target) {
  const isGoal = target.station
    ? (col, row) => target.station.tiles.some(([sc, sr]) => Math.abs(sc - col) + Math.abs(sr - row) === 1)
    : (col, row) => col === target.col && row === target.row;
  if (isGoal(fromCol, fromRow)) return [];
  const prev = new Map([[`${fromCol},${fromRow}`, null]]);
  const queue = [[fromCol, fromRow]];
  while (queue.length > 0) {
    const [col, row] = queue.shift();
    for (const [nc, nr] of neighbours(col, row)) {
      const key = `${nc},${nr}`;
      if (prev.has(key)) continue;
      prev.set(key, [col, row]);
      if (isGoal(nc, nr)) {
        const path = [[nc, nr]];
        let cur = [col, row];
        while (cur) {
          path.unshift(cur);
          cur = prev.get(`${cur[0]},${cur[1]}`);
        }
        return path.slice(1);
      }
      queue.push([nc, nr]);
    }
  }
  return null;
}
