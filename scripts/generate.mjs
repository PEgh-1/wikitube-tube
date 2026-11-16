#!/usr/bin/env node
// Étape 1 : choisit l'épisode du jour dans data/queue, le valide, prépare build/<id>/
// et déplace le fichier source dans data/done.
//   node scripts/generate.mjs                 # épisode daté d'aujourd'hui, sinon le plus ancien en attente
//   node scripts/generate.mjs --date 2026-11-03
//   node scripts/generate.mjs --episode data/episodes/x.json --keep   # fichier explicite, pas de déplacement
import fs from "node:fs";
import path from "node:path";
import { DIRS, parseArgs, readJson, writeJson, log, ensureDir, todayISO } from "./lib/common.mjs";
import { validateEpisode, longSegments, shortSegments } from "./lib/episode.mjs";

const args = parseArgs();
const today = args.date ?? todayISO();

function pickFromQueue() {
  ensureDir(DIRS.queue);
  const files = fs
    .readdirSync(DIRS.queue)
    .filter((f) => /^\d{4}-\d{2}-\d{2}-.+\.json$/.test(f))
    .sort();
  if (files.length === 0) throw new Error(`Aucun épisode dans ${path.relative(DIRS.root, DIRS.queue)} — ajouter un JSON <date>-<slug>.json`);
  const exact = files.find((f) => f.startsWith(today));
  if (exact) return path.join(DIRS.queue, exact);
  const due = files.filter((f) => f.slice(0, 10) <= today);
  const chosen = due[0] ?? files[0];
  log.warn(`Pas d'épisode daté ${today} : on prend ${chosen}`);
  return path.join(DIRS.queue, chosen);
}

function readBrand() {
  const f = path.join(DIRS.data, "brand.json");
  return fs.existsSync(f) ? readJson(f) : null;
}

const source = args.episode ? path.resolve(args.episode) : pickFromQueue();
const episode = validateEpisode(readJson(source));
const buildDir = ensureDir(path.join(DIRS.build, episode.id));

writeJson(path.join(buildDir, "episode.json"), episode);
writeJson(path.join(buildDir, "segments.json"), { long: longSegments(episode, readBrand()), short: shortSegments(episode) });
writeJson(path.join(DIRS.build, "current.json"), {
  episodeId: episode.id,
  buildDir: path.relative(DIRS.root, buildDir),
  source: path.relative(DIRS.root, source),
  pickedAt: new Date().toISOString(),
  runDate: today,
});

if (!args.keep && !args.episode) {
  ensureDir(DIRS.done);
  const dest = path.join(DIRS.done, path.basename(source));
  fs.renameSync(source, dest);
  log.info(`Déplacé vers ${path.relative(DIRS.root, dest)}`);
}

log.info(`Épisode du jour : ${episode.id} — « ${episode.title} » (${episode.steps.length} étapes)`);
log.info(`Build : ${path.relative(DIRS.root, buildDir)}`);
