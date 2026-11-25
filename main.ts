// Ember & Thyme — the build step for this entry (Node 22+, standard library
// only). The game is plain static files under game/ (index.html plus ES
// modules, no library, no network request), and the screenshots are real
// renders of it under screenshots/. This script copies both into the output
// directory and writes dossier.json, the summary the judge reads, using the
// vendored make.fun library (vendor/makefun-game.ts, shipped unchanged).
//
// Serve the game locally first with `node serve.ts`, then open
// http://localhost:8080. To build an output bundle outside the grader's
// container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// The script is deterministic: run it twice and the bytes are identical.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repo = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(name) {
  const src = join(repo, name);
  const dst = join(out, name);
  mkdirSync(dst, { recursive: true });
  if (existsSync(src)) cpSync(src, dst, { recursive: true });
}

mkdirSync(out, { recursive: true });
copyTree('game');
copyTree('screenshots');

// The scorer's own caps: only text_max_bytes shapes the bytes; the rest
// refuse an entry the scorer would refuse (more than 4 screenshots, or one
// over 256 KiB; more than 993 files in game/, or 48 MiB of game files in
// all, or a path under game/ over 1000 bytes).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
