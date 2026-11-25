// Every pixel of Ember & Thyme is drawn here, on one canvas, in the game's
// logical 1280x768 space. No image files: ingredients, the chef, the
// counters and the plates are all small vector drawings, so the game ships
// nothing but code and runs with zero network requests.

import { FIELD, TILE, HUD_H, COLS, ROWS, PALETTE, FONT, INGREDIENTS, DISHES, STARS } from './config.js';
import { STATIONS, tileToPx } from './kitchen.js';
import { centerOf } from './chef.js';

const TAU = Math.PI * 2;

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
}

function text(ctx, str, x, y, size, color, weight = '600', align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function mmss(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** One ingredient icon, drawn at (x, y) with radius r. */
export function drawIngredient(ctx, key, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  const s = r / 18;
  ctx.scale(s, s);
  ctx.lineWidth = 2;
  switch (key) {
    case 'tomato': {
      circle(ctx, 0, 1, 14); ctx.fillStyle = '#e23b2e'; ctx.fill();
      ctx.strokeStyle = '#b3271d'; ctx.stroke();
      ctx.fillStyle = '#3f9e4d';
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(-8, -4); ctx.lineTo(-2, -6); ctx.lineTo(0, -1);
      ctx.lineTo(3, -6); ctx.lineTo(9, -4); ctx.closePath(); ctx.fill();
      break;
    }
    case 'mushroom': {
      ctx.fillStyle = '#f3e2c2';
      rr(ctx, -5, -2, 10, 12, 4); ctx.fill();
      ctx.fillStyle = '#c98d5f';
      ctx.beginPath(); ctx.arc(0, -2, 13, Math.PI, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#a86f45';
      circle(ctx, -5, -8, 2.4); ctx.fill();
      circle(ctx, 4, -10, 2); ctx.fill();
      break;
    }
    case 'onion': {
      circle(ctx, 0, 1, 13); ctx.fillStyle = '#efe3f2'; ctx.fill();
      ctx.strokeStyle = '#b678c4'; ctx.stroke();
      ctx.strokeStyle = '#c99bd6';
      circle(ctx, 0, 1, 8); ctx.stroke();
      circle(ctx, 0, 1, 3.5); ctx.stroke();
      ctx.strokeStyle = '#3f9e4d'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(0, -11); ctx.lineTo(0, -16); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -11); ctx.lineTo(-5, -15); ctx.stroke();
      break;
    }
    case 'lettuce': {
      ctx.fillStyle = '#5fae4e';
      circle(ctx, -6, 2, 8); ctx.fill();
      circle(ctx, 6, 2, 8); ctx.fill();
      circle(ctx, 0, -5, 9); ctx.fill();
      ctx.fillStyle = '#7ec850';
      circle(ctx, -3, 0, 6); ctx.fill();
      circle(ctx, 4, -2, 5); ctx.fill();
      ctx.strokeStyle = '#4a8f3d'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, 6); ctx.stroke();
      break;
    }
    case 'bread': {
      ctx.fillStyle = '#e8b96a';
      rr(ctx, -12, -8, 24, 18, 7); ctx.fill();
      ctx.strokeStyle = '#b07f3a'; ctx.stroke();
      ctx.fillStyle = '#f6d9a0';
      rr(ctx, -9, -5, 18, 12, 5); ctx.fill();
      break;
    }
    case 'cheese': {
      ctx.fillStyle = '#f2c94c';
      ctx.beginPath(); ctx.moveTo(-12, 8); ctx.lineTo(12, 8); ctx.lineTo(12, -6); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#d9a62e'; ctx.stroke();
      ctx.fillStyle = '#d9a62e';
      circle(ctx, -4, 2, 2); ctx.fill();
      circle(ctx, 4, -1, 1.6); ctx.fill();
      circle(ctx, 7, 4, 1.4); ctx.fill();
      break;
    }
    case 'pasta': {
      ctx.strokeStyle = '#f2c94c'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath();
        ctx.moveTo(-11, i * 6);
        ctx.quadraticCurveTo(0, i * 6 - 6, 11, i * 6);
        ctx.stroke();
      }
      break;
    }
    case 'chopped-tomato': {
      ctx.fillStyle = '#e23b2e';
      ctx.beginPath(); ctx.moveTo(-11, 8); ctx.lineTo(-2, -9); ctx.lineTo(3, 8); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(2, 8); ctx.lineTo(11, -6); ctx.lineTo(12, 8); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#3f9e4d';
      circle(ctx, -6, -9, 2.4); ctx.fill();
      break;
    }
    case 'chopped-mushroom': {
      ctx.fillStyle = '#f3e2c2';
      ctx.beginPath(); ctx.arc(-5, 2, 8, Math.PI, 0); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(6, 4, 7, Math.PI, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#c98d5f';
      ctx.beginPath(); ctx.arc(-5, -1, 8, Math.PI, 0); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(6, 1, 7, Math.PI, 0); ctx.closePath(); ctx.fill();
      break;
    }
    case 'chopped-onion': {
      ctx.strokeStyle = '#efe3f2'; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.arc(0, 0, 10, 0.4, 2.6); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, 6, 3.6, 5.8); ctx.stroke();
      ctx.strokeStyle = '#b678c4'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0, 0, 10, 0.4, 2.6); ctx.stroke();
      break;
    }
    case 'chopped-lettuce': {
      ctx.strokeStyle = '#7ec850'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-11, -6); ctx.lineTo(-2, -2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-8, 4); ctx.lineTo(2, 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(3, -8); ctx.lineTo(11, -3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(10, 5); ctx.stroke();
      break;
    }
    case 'tomato-sauce': {
      ctx.fillStyle = '#f3e2c2';
      ctx.beginPath(); ctx.arc(0, 2, 13, 0, Math.PI); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#c0392b';
      ctx.beginPath(); ctx.arc(0, -1, 11, 0, Math.PI); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#e23b2e';
      circle(ctx, -4, -3, 3); ctx.fill();
      circle(ctx, 4, -2, 2.4); ctx.fill();
      break;
    }
    case 'sauteed-mushroom': {
      ctx.fillStyle = '#3a3a3a';
      circle(ctx, 0, 3, 13); ctx.fill();
      ctx.fillStyle = '#8a5a2e';
      ctx.beginPath(); ctx.arc(-4, 0, 6, Math.PI, 0); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(5, 2, 5, Math.PI, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#c98d5f';
      circle(ctx, -5, -4, 1.8); ctx.fill();
      circle(ctx, 4, -2, 1.6); ctx.fill();
      break;
    }
    case 'caramelized-onion': {
      ctx.fillStyle = '#3a3a3a';
      circle(ctx, 0, 3, 13); ctx.fill();
      ctx.strokeStyle = '#d9a05b'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 1, 8, 0.5, 2.8); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 1, 4.5, 3.8, 6); ctx.stroke();
      break;
    }
    case 'toasted-bread': {
      ctx.fillStyle = '#a86f2e';
      rr(ctx, -12, -8, 24, 18, 7); ctx.fill();
      ctx.fillStyle = '#d9a05b';
      rr(ctx, -9, -5, 18, 12, 5); ctx.fill();
      ctx.strokeStyle = '#8a5a2e'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-4, -2); ctx.lineTo(4, 3); ctx.stroke();
      break;
    }
    case 'boiled-pasta': {
      ctx.fillStyle = '#f3e2c2';
      ctx.beginPath(); ctx.arc(0, 2, 13, 0, Math.PI); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#f2c94c'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-9, -2); ctx.quadraticCurveTo(0, -8, 9, -2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-8, 2); ctx.quadraticCurveTo(0, -3, 8, 2); ctx.stroke();
      break;
    }
    case 'burnt': {
      ctx.fillStyle = '#222222';
      circle(ctx, -4, 2, 7); ctx.fill();
      circle(ctx, 4, 3, 6); ctx.fill();
      circle(ctx, 0, -4, 6); ctx.fill();
      ctx.fillStyle = '#777777';
      circle(ctx, -5, -1, 2); ctx.fill();
      circle(ctx, 3, -5, 1.6); ctx.fill();
      break;
    }
    default:
      break;
  }
  ctx.restore();
}

function progressRing(ctx, x, y, r, frac, color) {
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 5;
  circle(ctx, x, y, r); ctx.stroke();
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + TAU * Math.max(0, Math.min(1, frac)));
  ctx.stroke();
}

function stationLabel(ctx, label, cx, y, color = PALETTE.text) {
  ctx.font = `700 11px ${FONT}`;
  const w = ctx.measureText(label).width + 14;
  ctx.fillStyle = 'rgba(36,26,19,0.85)';
  rr(ctx, cx - w / 2, y - 9, w, 18, 9); ctx.fill();
  text(ctx, label, cx, y + 1, 11, color, '700', 'center');
}

function drawCounter(ctx, x, y, w, h) {
  ctx.fillStyle = PALETTE.counterTop;
  rr(ctx, x, y, w, h, 6); ctx.fill();
  ctx.fillStyle = PALETTE.counterFront;
  ctx.fillRect(x + 3, y + h - 16, w - 6, 13);
  ctx.strokeStyle = PALETTE.counterEdge;
  ctx.lineWidth = 2;
  rr(ctx, x, y, w, h, 6); ctx.stroke();
}

function drawFloor(ctx) {
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const p = tileToPx(col, row);
      ctx.fillStyle = (col + row) % 2 === 0 ? PALETTE.floorA : PALETTE.floorB;
      ctx.fillRect(p.x, p.y, TILE, TILE);
    }
  }
  ctx.strokeStyle = PALETTE.floorLine;
  ctx.lineWidth = 2;
  for (let row = 0; row <= ROWS; row += 1) {
    ctx.beginPath();
    ctx.moveTo(0, HUD_H + row * TILE);
    ctx.lineTo(FIELD.width, HUD_H + row * TILE);
    ctx.stroke();
  }
  for (let col = 0; col <= COLS; col += 1) {
    ctx.beginPath();
    ctx.moveTo(col * TILE, HUD_H);
    ctx.lineTo(col * TILE, HUD_H + ROWS * TILE);
    ctx.stroke();
  }
  // Warm light pooling in the middle of the room.
  const g = ctx.createRadialGradient(640, 420, 80, 640, 420, 560);
  g.addColorStop(0, 'rgba(255,220,150,0.10)');
  g.addColorStop(1, 'rgba(0,0,0,0.12)');
  ctx.fillStyle = g;
  ctx.fillRect(0, HUD_H, FIELD.width, ROWS * TILE);
}

function drawStations(ctx, world, time) {
  const chefCarriesPlate = world.chef.carryingPlate;
  const plateReady = world.plateOrder() !== null;
  for (const st of STATIONS) {
    const [col, row] = st.tiles[0];
    const p = tileToPx(col, row);
    const w = TILE * st.tiles.length > TILE ? TILE * (st.tiles[st.tiles.length - 1][0] - col + 1) : TILE;
    const h = TILE * (st.tiles[st.tiles.length - 1][1] - row + 1);
    switch (st.kind) {
      case 'crate': {
        drawCounter(ctx, p.x + 4, p.y + 4, TILE - 8, TILE - 8);
        drawIngredient(ctx, INGREDIENTS[st.gives].draw, p.x + TILE / 2, p.y + TILE / 2 - 8, 20);
        ctx.fillStyle = 'rgba(36,26,19,0.85)';
        rr(ctx, p.x + 8, p.y + TILE - 24, TILE - 16, 18, 9); ctx.fill();
        text(ctx, st.label, p.x + TILE / 2, p.y + TILE - 15, 11, PALETTE.text, '600', 'center');
        break;
      }
      case 'board': {
        drawCounter(ctx, p.x + 4, p.y + 4, TILE - 8, TILE - 8);
        ctx.fillStyle = '#f6e8c8';
        rr(ctx, p.x + 12, p.y + 10, TILE - 24, TILE - 38, 8); ctx.fill();
        ctx.strokeStyle = '#c9a86a'; ctx.lineWidth = 2;
        rr(ctx, p.x + 12, p.y + 10, TILE - 24, TILE - 38, 8); ctx.stroke();
        const board = world.boards[st.id];
        if (board.item) {
          drawIngredient(ctx, INGREDIENTS[board.item].draw, p.x + TILE / 2, p.y + 30, 16);
          if (!board.done) progressRing(ctx, p.x + TILE / 2, p.y + 30, 22, board.progress, PALETTE.yellow);
          else {
            ctx.fillStyle = PALETTE.green;
            circle(ctx, p.x + TILE - 16, p.y + 16, 10); ctx.fill();
            text(ctx, '✓', p.x + TILE - 16, p.y + 17, 13, '#fff', '700', 'center');
          }
        }
        stationLabel(ctx, 'CHOP', p.x + TILE / 2, p.y + TILE - 14);
        break;
      }
      case 'stove': {
        drawCounter(ctx, p.x + 4, p.y + 4, TILE - 8, TILE - 8);
        ctx.fillStyle = '#2b2b2b';
        rr(ctx, p.x + 10, p.y + 10, TILE - 20, TILE - 38, 6); ctx.fill();
        const stove = world.stoves[st.id];
        const flame = stove.item && !stove.done ? 1 : 0;
        if (flame) {
          const flick = Math.sin(time * 9 + col) * 2;
          ctx.fillStyle = '#ff8c2e';
          ctx.beginPath();
          ctx.moveTo(p.x + TILE / 2 - 12, p.y + TILE - 28);
          ctx.quadraticCurveTo(p.x + TILE / 2, p.y + TILE - 44 - flick, p.x + TILE / 2 + 12, p.y + TILE - 28);
          ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#ffd94d';
          ctx.beginPath();
          ctx.moveTo(p.x + TILE / 2 - 6, p.y + TILE - 28);
          ctx.quadraticCurveTo(p.x + TILE / 2, p.y + TILE - 38 - flick, p.x + TILE / 2 + 6, p.y + TILE - 28);
          ctx.closePath(); ctx.fill();
        }
        if (stove.item) {
          ctx.fillStyle = '#1c1c1c';
          circle(ctx, p.x + TILE / 2, p.y + 30, 19); ctx.fill();
          drawIngredient(ctx, INGREDIENTS[stove.item].draw, p.x + TILE / 2, p.y + 30, 14);
          if (!stove.done) progressRing(ctx, p.x + TILE / 2, p.y + 30, 24, stove.progress, '#ff8c2e');
          else if (stove.item === 'burnt') {
            text(ctx, '!', p.x + TILE / 2, p.y + 8, 20, PALETTE.red, '800', 'center');
          } else {
            ctx.fillStyle = PALETTE.green;
            circle(ctx, p.x + TILE - 16, p.y + 16, 10); ctx.fill();
            text(ctx, '✓', p.x + TILE - 16, p.y + 17, 13, '#fff', '700', 'center');
          }
        }
        stationLabel(ctx, 'STOVE', p.x + TILE / 2, p.y + TILE - 14);
        break;
      }
      case 'plate': {
        drawCounter(ctx, p.x + 4, p.y + 4, w - 8, TILE - 8);
        const cx = p.x + w / 2;
        const cy = p.y + 30;
        if (plateReady) {
          ctx.strokeStyle = PALETTE.green;
          ctx.lineWidth = 4;
          circle(ctx, cx, cy, 30 + Math.sin(time * 5) * 2);
          ctx.stroke();
        }
        ctx.fillStyle = '#ffffff';
        circle(ctx, cx, cy, 26); ctx.fill();
        ctx.strokeStyle = '#d8c3a5'; ctx.lineWidth = 2;
        circle(ctx, cx, cy, 26); ctx.stroke();
        circle(ctx, cx, cy, 18); ctx.stroke();
        world.plate.forEach((item, i) => {
          const n = world.plate.length;
          const ox = (i - (n - 1) / 2) * 18;
          drawIngredient(ctx, INGREDIENTS[item].draw, cx + ox, cy, 11);
        });
        stationLabel(ctx, plateReady ? 'READY!' : 'PLATE', cx, p.y + TILE - 14, plateReady ? PALETTE.green : PALETTE.text);
        break;
      }
      case 'serve': {
        const glow = chefCarriesPlate && world.chef.plateItems.length > 0 && world.shift.matchOrder(world.chef.plateItems);
        ctx.fillStyle = '#1c1410';
        rr(ctx, p.x + 4, p.y + 4, w - 8, TILE - 8, 6); ctx.fill();
        if (glow) {
          ctx.strokeStyle = PALETTE.green;
          ctx.lineWidth = 4;
          rr(ctx, p.x + 4, p.y + 4, w - 8, TILE - 8, 6); ctx.stroke();
        }
        drawCounter(ctx, p.x + 4, p.y + TILE - 22, w - 8, 18);
        // Service bell.
        ctx.fillStyle = '#f2c94c';
        ctx.beginPath(); ctx.arc(p.x + w / 2, p.y + 34, 12, Math.PI, 0); ctx.closePath(); ctx.fill();
        ctx.fillRect(p.x + w / 2 - 14, p.y + 34, 28, 4);
        text(ctx, 'SERVE', p.x + w / 2, p.y + 58, 13, glow ? PALETTE.green : PALETTE.text, '800', 'center');
        break;
      }
      case 'trash': {
        drawCounter(ctx, p.x + 4, p.y + 4, TILE - 8, TILE - 8);
        ctx.fillStyle = '#5a5a5a';
        rr(ctx, p.x + 22, p.y + 14, TILE - 44, TILE - 40, 6); ctx.fill();
        ctx.fillStyle = '#777';
        rr(ctx, p.x + 18, p.y + 10, TILE - 36, 10, 5); ctx.fill();
        stationLabel(ctx, 'TRASH', p.x + TILE / 2, p.y + TILE - 14);
        break;
      }
      case 'prep': {
        drawCounter(ctx, p.x + 4, p.y + 4, w - 8, h - 8);
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(p.x + w / 2, p.y + 6); ctx.lineTo(p.x + w / 2, p.y + h - 6); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(p.x + 6, p.y + h / 2); ctx.lineTo(p.x + w - 6, p.y + h / 2); ctx.stroke();
        if (world.prep) {
          drawIngredient(ctx, INGREDIENTS[world.prep].draw, p.x + w / 2, p.y + h / 2, 18);
        } else {
          text(ctx, 'PREP', p.x + w / 2, p.y + h / 2, 12, PALETTE.muted, '700', 'center');
        }
        break;
      }
      default:
        break;
    }
  }
  // Plain wall counters on the outer ring where no station sits.
  for (let col = 0; col < COLS; col += 1) {
    for (const row of [0, ROWS - 1]) {
      const p = tileToPx(col, row);
      const has = STATIONS.some((st) => st.tiles.some(([c, r]) => c === col && r === row));
      if (!has) drawCounter(ctx, p.x + 4, p.y + 4, TILE - 8, TILE - 8);
    }
  }
  for (let row = 1; row < ROWS - 1; row += 1) {
    for (const col of [0, COLS - 1]) {
      const p = tileToPx(col, row);
      const has = STATIONS.some((st) => st.tiles.some(([c, r]) => c === col && r === row));
      if (!has) drawCounter(ctx, p.x + 4, p.y + 4, TILE - 8, TILE - 8);
    }
  }
}

function drawChef(ctx, chef, time) {
  const bob = Math.sin(time * 2) * 1.5;
  const { x, y } = chef;
  // Shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath(); ctx.ellipse(x, y + 26, 22, 8, 0, 0, TAU); ctx.fill();
  // Feet.
  ctx.fillStyle = '#3a2c22';
  ctx.beginPath(); ctx.ellipse(x - 10, y + 22, 8, 5, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + 10, y + 22, 8, 5, 0, 0, TAU); ctx.fill();
  // Body (white coat).
  ctx.fillStyle = '#fdf6ec';
  rr(ctx, x - 20, y - 8, 40, 34, 14); ctx.fill();
  ctx.strokeStyle = '#d8c3a5'; ctx.lineWidth = 2;
  rr(ctx, x - 20, y - 8, 40, 34, 14); ctx.stroke();
  // Red scarf.
  ctx.fillStyle = '#e23b2e';
  rr(ctx, x - 14, y - 10, 28, 8, 4); ctx.fill();
  // Head.
  ctx.fillStyle = '#f6c89f';
  circle(ctx, x, y - 20, 15); ctx.fill();
  // Chef hat.
  ctx.fillStyle = '#ffffff';
  circle(ctx, x - 10, y - 34, 9); ctx.fill();
  circle(ctx, x, y - 38, 10); ctx.fill();
  circle(ctx, x + 10, y - 34, 9); ctx.fill();
  ctx.fillRect(x - 13, y - 34, 26, 8);
  // Face, turned toward the facing direction.
  const [fx, fy] = chef.facing;
  ctx.fillStyle = '#2b2b2b';
  circle(ctx, x - 5 + fx * 2, y - 22 + fy * 1.5, 1.8); ctx.fill();
  circle(ctx, x + 5 + fx * 2, y - 22 + fy * 1.5, 1.8); ctx.fill();
  ctx.strokeStyle = '#2b2b2b'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(x + fx * 2, y - 17 + fy * 1.5, 4, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  // Carried item floats over the head; a plate is held up on a tray.
  if (chef.carryingPlate) {
    const py = y - 62 + bob;
    ctx.fillStyle = '#ffffff';
    circle(ctx, x, py, 24); ctx.fill();
    ctx.strokeStyle = '#d8c3a5'; ctx.lineWidth = 2;
    circle(ctx, x, py, 24); ctx.stroke();
    circle(ctx, x, py, 16); ctx.stroke();
    chef.plateItems.forEach((item, i) => {
      const n = chef.plateItems.length;
      const ox = (i - (n - 1) / 2) * 16;
      drawIngredient(ctx, INGREDIENTS[item].draw, x + ox, py, 10);
    });
  } else if (chef.carrying) {
    const py = y - 58 + bob;
    drawIngredient(ctx, INGREDIENTS[chef.carrying].draw, x, py, 16);
  }
}

function drawOrderCard(ctx, order, x, y, w, h, plate, highlighted) {
  const dish = DISHES[order.dishId];
  const urgent = order.remaining <= 12;
  ctx.fillStyle = highlighted ? '#2f4a22' : PALETTE.hudPanel;
  rr(ctx, x, y, w, h, 10); ctx.fill();
  ctx.strokeStyle = highlighted ? PALETTE.green : urgent ? PALETTE.red : 'rgba(255,255,255,0.15)';
  ctx.lineWidth = highlighted ? 3 : 2;
  rr(ctx, x, y, w, h, 10); ctx.stroke();
  text(ctx, dish.name.toUpperCase(), x + 10, y + 14, 13, PALETTE.text, '800');
  text(ctx, `#${order.id}`, x + w - 10, y + 14, 11, PALETTE.muted, '600', 'right');
  dish.needs.forEach((item, i) => {
    const ix = x + 24 + i * 34;
    const iy = y + 38;
    const onPlate = plate.includes(item);
    if (onPlate) {
      ctx.fillStyle = 'rgba(126,200,80,0.35)';
      circle(ctx, ix, iy, 15); ctx.fill();
    }
    drawIngredient(ctx, INGREDIENTS[item].draw, ix, iy, 13);
    if (onPlate) {
      ctx.fillStyle = PALETTE.green;
      circle(ctx, ix + 10, iy - 10, 7); ctx.fill();
      text(ctx, '✓', ix + 10, iy - 9, 9, '#fff', '800', 'center');
    }
  });
  const frac = Math.max(0, order.remaining / order.total);
  const barColor = frac > 0.5 ? PALETTE.green : frac > 0.25 ? PALETTE.yellow : PALETTE.red;
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  rr(ctx, x + 10, y + h - 14, w - 20, 7, 3.5); ctx.fill();
  ctx.fillStyle = barColor;
  rr(ctx, x + 10, y + h - 14, (w - 20) * frac, 7, 3.5); ctx.fill();
  text(ctx, mmss(order.remaining), x + w - 10, y + h - 26, 12, urgent ? PALETTE.red : PALETTE.muted, '700', 'right');
}

function drawHUD(ctx, world, time) {
  ctx.fillStyle = PALETTE.hud;
  ctx.fillRect(0, 0, FIELD.width, HUD_H);
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillRect(0, HUD_H - 2, FIELD.width, 2);
  const plateOrder = world.plateOrder();
  const cardW = 226;
  const cardH = 72;
  for (let i = 0; i < 3; i += 1) {
    const x = 16 + i * (cardW + 8);
    const order = world.shift.orders[i];
    if (order) {
      drawOrderCard(ctx, order, x, 8, cardW, cardH, world.plate, plateOrder === order);
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2;
      rr(ctx, x, 8, cardW, cardH, 10); ctx.stroke();
      ctx.setLineDash([]);
      text(ctx, 'Waiting for orders…', x + cardW / 2, 44, 12, PALETTE.muted, '600', 'center');
    }
  }
  // Shift timer.
  const shift = world.shift;
  const rush = shift.isRush && !shift.over;
  ctx.fillStyle = PALETTE.hudPanel;
  rr(ctx, 730, 8, 170, 72, 10); ctx.fill();
  text(ctx, 'SHIFT', 745, 22, 11, PALETTE.muted, '700');
  text(ctx, mmss(shift.timeLeft), 885, 34, 30, rush ? PALETTE.red : PALETTE.text, '800', 'right');
  const frac = shift.timeLeft / 180;
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  rr(ctx, 745, 62, 140, 7, 3.5); ctx.fill();
  ctx.fillStyle = rush ? PALETTE.red : PALETTE.accent;
  rr(ctx, 745, 62, 140 * frac, 7, 3.5); ctx.fill();
  // Score and combo.
  ctx.fillStyle = PALETTE.hudPanel;
  rr(ctx, 912, 8, 180, 72, 10); ctx.fill();
  text(ctx, 'SCORE', 927, 22, 11, PALETTE.muted, '700');
  text(ctx, String(shift.score), 1077, 34, 28, PALETTE.text, '800', 'right');
  const mult = shift.multiplier;
  text(ctx, mult > 1 ? `COMBO ×${mult.toFixed(1)}` : 'COMBO ×1.0', 927, 62, 12, mult > 1 ? PALETTE.accent : PALETTE.muted, '700');
  // Strikes.
  ctx.fillStyle = PALETTE.hudPanel;
  rr(ctx, 1104, 8, 160, 72, 10); ctx.fill();
  text(ctx, 'STRIKES', 1119, 22, 11, PALETTE.muted, '700');
  for (let i = 0; i < 3; i += 1) {
    const cx = 1132 + i * 34;
    ctx.fillStyle = i < shift.strikes ? PALETTE.red : 'rgba(255,255,255,0.15)';
    circle(ctx, cx, 52, 11); ctx.fill();
    if (i < shift.strikes) text(ctx, '✕', cx, 53, 12, '#fff', '800', 'center');
  }
  // Rush banner.
  if (rush) {
    const pulse = 0.5 + 0.5 * Math.sin(time * 6);
    ctx.fillStyle = `rgba(229,83,75,${0.75 + pulse * 0.25})`;
    rr(ctx, 540, HUD_H + 8, 200, 30, 15); ctx.fill();
    text(ctx, '⚡ RUSH HOUR ⚡', 640, HUD_H + 24, 15, '#fff', '800', 'center');
  }
}

function drawBottomBar(ctx, world) {
  ctx.fillStyle = PALETTE.hud;
  ctx.fillRect(0, HUD_H + ROWS * TILE, FIELD.width, FIELD.height - HUD_H - ROWS * TILE);
  const chef = world.chef;
  const carrying = chef.carryingPlate
    ? `Plate: ${chef.plateItems.map((i) => INGREDIENTS[i].name).join(' + ') || 'empty'}`
    : chef.carrying
      ? `Carrying: ${INGREDIENTS[chef.carrying].name}`
      : 'Hands empty';
  text(ctx, carrying, 16, FIELD.height - 20, 13, PALETTE.muted, '600');
  const hint = world.hintT > 0 ? world.hintText : 'WASD / arrows to move · E to use · click a station to walk there';
  text(ctx, hint, 640, FIELD.height - 20, 13, world.hintT > 0 ? PALETTE.accent : PALETTE.muted, '600', 'center');
  text(ctx, 'M mute · P pause', 1264, FIELD.height - 20, 13, PALETTE.muted, '600', 'right');
}

function drawParticles(ctx, world) {
  for (const p of world.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.color;
    circle(ctx, p.x, p.y, p.size); ctx.fill();
  }
  ctx.globalAlpha = 1;
  for (const f of world.floaters) {
    ctx.globalAlpha = Math.max(0, f.life / f.max);
    text(ctx, f.text, f.x, f.y, 24, f.color, '800', 'center');
  }
  ctx.globalAlpha = 1;
}

function overlay(ctx, alpha) {
  ctx.fillStyle = `rgba(20,12,8,${alpha})`;
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
}

function drawTitle(ctx, best) {
  overlay(ctx, 0.55);
  text(ctx, 'EMBER & THYME', 640, 170, 64, '#ffd9a0', '800', 'center');
  text(ctx, 'a cozy kitchen rush', 640, 215, 22, PALETTE.text, '600', 'center');
  ctx.fillStyle = 'rgba(61,44,31,0.9)';
  rr(ctx, 340, 260, 600, 230, 14); ctx.fill();
  ctx.strokeStyle = 'rgba(255,179,71,0.5)';
  ctx.lineWidth = 2;
  rr(ctx, 340, 260, 600, 230, 14); ctx.stroke();
  text(ctx, 'HOW TO PLAY', 640, 290, 16, PALETTE.accent, '800', 'center');
  const lines = [
    'Orders arrive on the board — cook them before the timer runs out.',
    'Grab ingredients from the top crates.',
    'Chop on a board, cook on a stove, then build the dish on the plate.',
    'Carry the finished plate to the SERVE window. Chain serves for a combo!',
    'One shift: 3 minutes. An expired order is a strike — three strikes and',
    'the kitchen closes.',
  ];
  lines.forEach((line, i) => text(ctx, line, 640, 322 + i * 24, 15, PALETTE.text, '500', 'center'));
  text(ctx, 'Move: WASD / arrows / click   ·   Use: E or Space   ·   Pause: P', 640, 528, 15, PALETTE.muted, '600', 'center');
  if (best > 0) text(ctx, `Best score: ${best}`, 640, 560, 16, PALETTE.accent, '700', 'center');
  const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 350);
  ctx.globalAlpha = pulse;
  text(ctx, 'Press ENTER or click to start', 640, 620, 20, '#fff', '800', 'center');
  ctx.globalAlpha = 1;
}

function drawPaused(ctx) {
  overlay(ctx, 0.5);
  text(ctx, 'PAUSED', 640, 360, 48, '#fff', '800', 'center');
  text(ctx, 'Press P to keep cooking', 640, 410, 18, PALETTE.muted, '600', 'center');
}

function drawOver(ctx, world, best, newBest) {
  overlay(ctx, 0.6);
  const shift = world.shift;
  text(ctx, 'SHIFT OVER!', 640, 150, 52, '#ffd9a0', '800', 'center');
  text(ctx, shift.strikes >= 3 ? 'Too many orders expired — the kitchen closed.' : 'Service complete — the kitchen is closed for the night.', 640, 195, 17, PALETTE.text, '600', 'center');
  text(ctx, String(shift.score), 640, 280, 72, '#fff', '800', 'center');
  text(ctx, 'POINTS', 640, 325, 14, PALETTE.muted, '700', 'center');
  for (let i = 0; i < 3; i += 1) {
    const sx = 580 + i * 60;
    ctx.fillStyle = i < shift.stars() ? PALETTE.yellow : 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    for (let k = 0; k < 5; k += 1) {
      const a = -Math.PI / 2 + (k * 4 * Math.PI) / 5;
      const r = k % 2 === 0 ? 18 : 8;
      const px = sx + Math.cos(a) * r;
      const py = 370 + Math.sin(a) * r;
      if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
  }
  text(ctx, `Dishes served: ${shift.served}    ·    Best combo: ×${(1 + 0.1 * Math.max(0, shift.combo)).toFixed(1)}    ·    Orders expired: ${shift.expired}`, 640, 430, 16, PALETTE.text, '600', 'center');
  if (newBest) text(ctx, '★ NEW BEST SCORE! ★', 640, 465, 20, PALETTE.yellow, '800', 'center');
  else text(ctx, `Best score: ${best}`, 640, 465, 16, PALETTE.muted, '700', 'center');
  const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 350);
  ctx.globalAlpha = pulse;
  text(ctx, 'Press R to cook another shift', 640, 520, 20, '#fff', '800', 'center');
  ctx.globalAlpha = 1;
}

/** Draw one frame. `ui` carries the screen mode, the best score and the clock. */
export function render(ctx, world, ui) {
  ctx.clearRect(0, 0, FIELD.width, FIELD.height);
  drawFloor(ctx);
  drawStations(ctx, world, ui.time);
  drawChef(ctx, world.chef, ui.time);
  drawParticles(ctx, world);
  drawHUD(ctx, world, ui.time);
  drawBottomBar(ctx, world);
  if (ui.mode === 'title') drawTitle(ctx, ui.best);
  else if (ui.mode === 'paused') drawPaused(ctx);
  else if (ui.mode === 'over') drawOver(ctx, world, ui.best, ui.newBest);
}
