// Orders, scoring, combo, strikes and the shift clock. The shift is a
// three-minute service: orders arrive faster and give less time as it goes
// on, and the last thirty seconds are a rush. Serving a dish pays its base
// plus a bonus for time left, times the combo multiplier; an expired order
// breaks the combo and is a strike — three strikes close the kitchen early.

import {
  SHIFT_SECONDS, MAX_ORDERS, MAX_STRIKES, SPAWN_EVERY, ORDER_TIME,
  TIME_BONUS, COMBO_STEP, COMBO_MAX, EXPIRE_PENALTY, STARS,
} from './config.js';
import { DISHES } from './config.js';
import { pickWeighted } from './random.js';

function lerp(a, b, t) { return a + (b - a) * t; }

function sameSet(a, b) {
  if (a.length !== b.length) return false;
  const count = new Map();
  for (const x of a) count.set(x, (count.get(x) || 0) + 1);
  for (const x of b) {
    const n = count.get(x) || 0;
    if (n === 0) return false;
    count.set(x, n - 1);
  }
  return true;
}

export class Shift {
  constructor(rng) {
    this.rng = rng || Math.random;
    this.reset();
  }

  reset() {
    this.elapsed = 0;
    this.timeLeft = SHIFT_SECONDS;
    this.orders = [];
    this.nextId = 1;
    this.spawnTimer = 2.5;
    this.score = 0;
    this.combo = 0;
    this.served = 0;
    this.expired = 0;
    this.strikes = 0;
    this.rushAnnounced = false;
    this.over = false;
  }

  get progress() { return Math.min(1, this.elapsed / SHIFT_SECONDS); }
  get isRush() { return this.timeLeft <= 30; }
  get multiplier() { return Math.min(COMBO_MAX, 1 + COMBO_STEP * this.combo); }

  /** Dishes that can appear right now: the two-component ones first, then all. */
  availableDishes() {
    const all = Object.entries(DISHES).map(([id, dish]) => ({ id, ...dish }));
    if (this.elapsed < 60) return all.filter((d) => d.needs.length === 2);
    return all;
  }

  spawnOrder() {
    const dish = pickWeighted(this.availableDishes(), this.rng);
    const total = lerp(ORDER_TIME.start, ORDER_TIME.end, this.progress);
    const order = { id: this.nextId, dishId: dish.id, remaining: total, total };
    this.nextId += 1;
    this.orders.push(order);
    return order;
  }

  /** The first order whose dish exactly matches the plate's components. */
  matchOrder(plateItems) {
    const sorted = [...this.orders].sort((a, b) => a.remaining - b.remaining);
    for (const order of sorted) {
      if (sameSet(DISHES[order.dishId].needs, plateItems)) return order;
    }
    return null;
  }

  /** Serve the plate: remove the matching order and pay out. Returns null when nothing matches. */
  serve(plateItems) {
    const order = this.matchOrder(plateItems);
    if (!order) return null;
    this.orders = this.orders.filter((o) => o !== order);
    const dish = DISHES[order.dishId];
    const timeBonus = Math.round(TIME_BONUS * Math.max(0, order.remaining / order.total));
    const points = Math.round((dish.base + timeBonus) * this.multiplier);
    this.score += points;
    this.combo += 1;
    this.served += 1;
    return { order, points, combo: this.combo, multiplier: this.multiplier };
  }

  stars() {
    let n = 0;
    for (const bar of STARS) if (this.score >= bar) n += 1;
    return n;
  }

  /**
   * Advance the clock one step. Returns the events that happened, so the
   * caller can play sounds and particles: spawn, expire, rush, end.
   */
  update(dt) {
    const events = [];
    if (this.over) return events;
    this.elapsed += dt;
    this.timeLeft = Math.max(0, SHIFT_SECONDS - this.elapsed);
    if (this.isRush && !this.rushAnnounced) {
      this.rushAnnounced = true;
      events.push({ type: 'rush' });
    }
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.orders.length < MAX_ORDERS) {
      const order = this.spawnOrder();
      events.push({ type: 'spawn', order });
      this.spawnTimer = lerp(SPAWN_EVERY.start, SPAWN_EVERY.end, this.progress);
    }
    for (const order of [...this.orders]) {
      order.remaining -= dt;
      if (order.remaining <= 0) {
        this.orders = this.orders.filter((o) => o !== order);
        this.combo = 0;
        this.expired += 1;
        this.strikes += 1;
        this.score = Math.max(0, this.score - EXPIRE_PENALTY);
        events.push({ type: 'expire', order });
      }
    }
    if (this.timeLeft <= 0 || this.strikes >= MAX_STRIKES) {
      this.over = true;
      events.push({ type: 'end', reason: this.strikes >= MAX_STRIKES ? 'strikes' : 'time' });
    }
    return events;
  }
}
