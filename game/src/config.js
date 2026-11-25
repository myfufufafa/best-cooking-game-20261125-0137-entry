// Ember & Thyme — every tuning number, recipe and colour in one place.
// The playfield is a fixed 1280x768 logical area; the renderer scales it to
// the window, so no rule below depends on the screen size.

export const TILE = 80;
export const COLS = 16;
export const ROWS = 8;
export const HUD_H = 88;
export const FIELD = { width: 1280, height: 768 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

/** How long one shift (a full game) lasts, in seconds. */
export const SHIFT_SECONDS = 180;
/** An expired order is a strike; this many strikes ends the shift early. */
export const MAX_STRIKES = 3;

/** Chef movement: tiles crossed per second (smooth interpolation between tiles). */
export const CHEF_SPEED = 6.5;
/** Seconds to chop one item on a board. */
export const CHOP_SECONDS = 2.0;
/** Seconds to cook one item on a stove. */
export const COOK_SECONDS = 3.0;
/** Seconds after a cooked item is done before it burns on the stove. */
export const BURN_SECONDS = 10;

/** Orders: at most this many on the board at once. */
export const MAX_ORDERS = 3;
/** Seconds between order spawns at the start of the shift / at the end (rush). */
export const SPAWN_EVERY = { start: 9, end: 4.5 };
/** Seconds an order gives you at the start of the shift / at the end. */
export const ORDER_TIME = { start: 65, end: 45 };

/** Score: serving a dish pays its base plus a time bonus (0..TIME_BONUS) for
 *  how much of its countdown is left, times the combo multiplier. */
export const TIME_BONUS = 100;
/** Each consecutive serve without an expired order adds this to the multiplier. */
export const COMBO_STEP = 0.1;
export const COMBO_MAX = 2.0;
/** Points lost when an order expires (score never drops below zero). */
export const EXPIRE_PENALTY = 50;
/** Stars at the end of the shift. */
export const STARS = [500, 1000, 1600];

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

export const PALETTE = {
  wall: '#3a2c22',
  wallTop: '#54382a',
  floorA: '#b98a5a',
  floorB: '#a87a4e',
  floorLine: '#8f6741',
  counterTop: '#e8c99a',
  counterFront: '#7a4a2b',
  counterEdge: '#5d3620',
  hud: '#241a13',
  hudPanel: '#3d2c1f',
  text: '#fff6e8',
  muted: '#d8c3a5',
  accent: '#ffb347',
  green: '#7ec850',
  red: '#e5534b',
  yellow: '#f2c94c',
  blue: '#6ec6e8',
};

/**
 * Ingredients. `chop` names what a board turns it into, `cook` names what a
 * stove turns it into; a missing one means that station cannot take it.
 * `draw` is the icon key render.js draws (see drawIngredient).
 */
export const INGREDIENTS = {
  tomato:   { name: 'Tomato',   draw: 'tomato',   chop: 'chopped-tomato', cook: null },
  mushroom: { name: 'Mushroom', draw: 'mushroom', chop: 'chopped-mushroom', cook: null },
  onion:    { name: 'Onion',    draw: 'onion',    chop: 'chopped-onion', cook: null },
  lettuce:  { name: 'Lettuce',  draw: 'lettuce',  chop: 'chopped-lettuce', cook: null },
  bread:    { name: 'Bread',    draw: 'bread',    chop: null, cook: 'toasted-bread' },
  cheese:   { name: 'Cheese',   draw: 'cheese',   chop: null, cook: null },
  pasta:    { name: 'Pasta',    draw: 'pasta',    chop: null, cook: 'boiled-pasta' },
  'chopped-tomato':   { name: 'Chopped Tomato', draw: 'chopped-tomato', chop: null, cook: 'tomato-sauce' },
  'chopped-mushroom': { name: 'Chopped Mushroom', draw: 'chopped-mushroom', chop: null, cook: 'sauteed-mushroom' },
  'chopped-onion':    { name: 'Chopped Onion', draw: 'chopped-onion', chop: null, cook: 'caramelized-onion' },
  'chopped-lettuce':  { name: 'Chopped Lettuce', draw: 'chopped-lettuce', chop: null, cook: null },
  'tomato-sauce':      { name: 'Tomato Sauce', draw: 'tomato-sauce', chop: null, cook: null },
  'sauteed-mushroom':  { name: 'Sauteed Mushroom', draw: 'sauteed-mushroom', chop: null, cook: null },
  'caramelized-onion': { name: 'Caramelized Onion', draw: 'caramelized-onion', chop: null, cook: null },
  'toasted-bread':     { name: 'Toasted Bread', draw: 'toasted-bread', chop: null, cook: null },
  'boiled-pasta':      { name: 'Boiled Pasta', draw: 'boiled-pasta', chop: null, cook: null },
  burnt: { name: 'Burnt!', draw: 'burnt', chop: null, cook: null },
};

/**
 * Dishes. `needs` lists the processed components, in the order the plate
 * shows them. `weight` is how likely the dish is picked for a new order.
 */
export const DISHES = {
  'garden-salad': {
    name: 'Garden Salad',
    needs: ['chopped-tomato', 'chopped-lettuce'],
    base: 100, weight: 3,
  },
  'tomato-pasta': {
    name: 'Tomato Pasta',
    needs: ['tomato-sauce', 'boiled-pasta'],
    base: 120, weight: 3,
  },
  'mushroom-melt': {
    name: 'Mushroom Melt',
    needs: ['sauteed-mushroom', 'cheese', 'toasted-bread'],
    base: 150, weight: 2,
  },
  'onion-soup': {
    name: 'Onion Soup',
    needs: ['caramelized-onion', 'toasted-bread', 'cheese'],
    base: 150, weight: 2,
  },
  'forest-stirfry': {
    name: 'Forest Stir-Fry',
    needs: ['sauteed-mushroom', 'chopped-tomato', 'chopped-lettuce'],
    base: 160, weight: 2,
  },
};

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'ember-and-thyme.best';
