// A tiny deterministic random generator (mulberry32). The live game uses
// Math.random; the screenshot scenes use this one with a fixed seed, so the
// same seed always stages the same frame.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pick one entry of `items` (each with a `weight`) with the given rng. */
export function pickWeighted(items, rng) {
  let total = 0;
  for (const item of items) total += item.weight || 1;
  let roll = rng() * total;
  for (const item of items) {
    roll -= item.weight || 1;
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}
