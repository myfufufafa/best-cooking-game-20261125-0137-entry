[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/myfufufafa/best-cooking-game-20261125-0137-entry/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/myfufufafa/best-cooking-game-20261125-0137-entry/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

# Ember & Thyme — a cozy kitchen rush

**Entry for the make.fun bounty [Make the best cooking game](https://make.fun/c/best-cooking-game-20261125-0137) ($250, free entry).**

You are the chef of a small, warm kitchen. Orders arrive on the board — cook them before the timer runs out. Grab ingredients from the top crates, chop them on a board, cook them on a stove, build the dish on the plate, and carry the finished plate to the SERVE window. Chain serves for a combo multiplier. One shift lasts 3 minutes; an expired order is a strike, and three strikes close the kitchen early.

## How to play

| Action | Controls |
| --- | --- |
| Move | **WASD** / **arrow keys**, or **click** a floor tile to walk there |
| Use a station | **E** or **Space** while facing it, or **click** the station to walk there and use it |
| Pause | **P** or **Esc** |
| Mute | **M** |
| Restart after a shift | **R** or **Enter** |

**The pipeline:** crate → chopping board → stove → plate → serving window. The prep table in the middle is a buffer: park one item there while you fetch another. Leave a finished dish on the stove too long and it burns — bin it and start over.

**Dishes (5):** Garden Salad, Tomato Pasta, Mushroom Melt, Onion Soup, Forest Stir-Fry. Each needs 2–3 prepared components; the order board shows what is already on the plate (green check) and the timer for each order.

**Scoring:** base points per dish + a bonus for time left, times the combo multiplier (up to ×2). Stars at the end of the shift: 500 / 1,000 / 1,600 points. Your best score is kept in the browser.

## Run it

```bash
node serve.ts            # serves game/ at http://127.0.0.1:8080
```

Open the URL in a desktop browser and press Enter (or click) to start. The game is static files only — `game/index.html` plus ES modules, no libraries, no network requests, nothing to build. It plays offline.

## Build the submission bundle

```bash
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This copies `game/` and `screenshots/` into `out/` and writes `out/dossier.json` (via the vendored `vendor/makefun-game.ts`, shipped unchanged from the bounty kit). Run it twice and the bytes are identical.

## Screenshots

The four screenshots in `screenshots/` are real renders of the game, taken in a headless browser from the staging scenes in `game/src/shots.js` (see `shots.json` for the exact URLs). Each scene builds a reachable game state through the world's own data — orders, boards, stoves, the plate, the chef — and the renderer draws it; nothing is faked at the pixel level. A fixed seed stages the same frame every time.

1. **1-cover.jpg** — a busy mid-shift: three orders, a dish mid-assembly, a plate ready to serve.
2. **2-chop.jpg** — the chef at a chopping board, mid-chop, with an order waiting.
3. **3-serve.jpg** — the moment just after a dish is served.
4. **4-rush.jpg** — rush hour: low timers, both stoves going, the chef hurrying.

## Structure

```
game/
  index.html          # the page: a full-screen canvas + an aria-live status line
  src/
    config.js         # every tuning number, recipe, ingredient and colour
    random.js         # seeded RNG (deterministic screenshot staging)
    audio.js          # WebAudio sound effects + a quiet music loop (no audio files)
    input.js          # keyboard + mouse
    kitchen.js        # the tile grid, stations, walkability, pathfinding
    orders.js         # orders, scoring, combo, strikes, the shift clock
    chef.js           # the chef: tile movement, path following, carrying
    world.js          # the world: station state, interactions, particles, hints
    render.js         # every pixel: floor, counters, ingredients, chef, HUD, screens
    shots.js          # the four screenshot scenes
    main.js           # the game loop and the screen state machine
main.ts               # build: copy game/ + screenshots/ and write dossier.json
serve.ts              # local static server for playtesting
```

## License

MIT — see [LICENSE](LICENSE).
