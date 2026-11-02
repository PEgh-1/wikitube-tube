#!/usr/bin/env node
// Valide un ou plusieurs épisodes JSON et (ré)génère data/episode.schema.json.
//   node scripts/validate.mjs data/episodes/*.json
//   node scripts/validate.mjs --write-schema
import fs from "node:fs";
import path from "node:path";
import { DIRS, parseArgs, readJson, writeJson, log, wordCount } from "./lib/common.mjs";
import { validateEpisode, episodeJsonSchema, totalLongWords, LOCALES } from "./lib/episode.mjs";

const args = parseArgs();

if (args["write-schema"] || args._.length === 0) {
  const file = path.join(DIRS.data, "episode.schema.json");
  writeJson(file, { $id: "https://wikitube.local/episode.schema.json", title: "WikiTube episode", ...episodeJsonSchema() });
  log.info("Schéma écrit :", path.relative(DIRS.root, file));
}

let files = args._;
if (files.length === 0) {
  files = [DIRS.episodes, DIRS.queue]
    .filter(fs.existsSync)
    .flatMap((d) => fs.readdirSync(d).filter((f) => f.endsWith(".json")).map((f) => path.join(d, f)));
}

let failed = 0;
for (const f of files) {
  try {
    const ep = validateEpisode(readJson(f));
    const words = totalLongWords(ep);
    const shortWords = wordCount(ep.short.hook) + ep.short.steps.reduce((a, s) => a + wordCount(s.narration), 0) + wordCount(ep.short.cta);
    log.info(
      `✔ ${path.relative(DIRS.root, f)} — ${ep.steps.length} étapes, ${words} mots (≈ ${(words / 2.6 / 60).toFixed(1)} min), short ${shortWords} mots, ${LOCALES.length} langues`,
    );
  } catch (e) {
    failed++;
    log.error(`${path.relative(DIRS.root, f)}\n${e.message}`);
  }
}
if (failed) process.exit(1);
