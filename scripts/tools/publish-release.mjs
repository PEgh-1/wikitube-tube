#!/usr/bin/env node
// Met en ligne des épisodes déjà rendus et vérifiés (branche release-assets), sans nouveau rendu.
//   node scripts/tools/publish-release.mjs --assets _rel
// Lit publish/queue.json : [{ id, publishAt }]. Reprise sans doublon grâce à data/published.json.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { DIRS, parseArgs, readJson, writeJson, exists, log } from "../lib/common.mjs";
const args = parseArgs();
const assets = path.resolve(String(args.assets ?? "_rel"));
const queue = readJson(path.join(DIRS.root, "publish", "queue.json"));
const logFile = path.join(DIRS.data, "published.json");
const published = () => (exists(logFile) ? readJson(logFile) : []);
const run = (id, extra) => {
  writeJson(path.join(DIRS.build, "current.json"), { episodeId: id });
  const r = spawnSync("node", ["scripts/upload.mjs", "--episode", id, ...extra, ...(args["dry-run"] ? ["--dry-run"] : [])], { cwd: DIRS.root, stdio: "inherit" });
  return r.status === 0;
};
// 1. Mise en place des fichiers
for (const { id } of queue) {
  const src = path.join(assets, id);
  const outDir = path.join(DIRS.root, "out", id);
  const buildDir = path.join(DIRS.build, id);
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(buildDir, { recursive: true });
  for (const f of fs.readdirSync(path.join(src, "build"))) fs.copyFileSync(path.join(src, "build", f), path.join(buildDir, f));
  const parts = fs.readdirSync(path.join(src, "out")).filter((f) => f.startsWith("long.mp4.part-")).sort();
  const fd = fs.openSync(path.join(outDir, "long.mp4"), "w");
  for (const p of parts) fs.writeSync(fd, fs.readFileSync(path.join(src, "out", p)));
  fs.closeSync(fd);
  for (const f of fs.readdirSync(path.join(src, "out"))) if (!f.startsWith("long.mp4.part-")) fs.copyFileSync(path.join(src, "out", f), path.join(outDir, f));
  log.info(`${id} : long ${(fs.statSync(path.join(outDir, "long.mp4")).size / 1e6).toFixed(1)} Mo`);
}
// 2. Les longs d'abord (miniature, sous-titres), puis les Shorts : si le quota YouTube s'arrête, les longs sont passés.
let failed = false;
for (const { id, publishAt } of queue) {
  if (published().some((e) => e.episodeId === id && e.long?.videoId)) { log.info(`${id} : long déjà en ligne, ignoré`); continue; }
  if (!run(id, ["--publish-at", publishAt, "--skip-short"])) { failed = true; log.warn(`${id} : échec du long`); break; }
}
for (const { id, publishAt } of queue) {
  const e = published().find((x) => x.episodeId === id);
  if (!e?.long?.videoId) continue;
  if (e.short?.videoId) { log.info(`${id} : Short déjà en ligne, ignoré`); continue; }
  if (!run(id, ["--publish-at", publishAt, "--skip-long", "--long-url", e.long.url])) { failed = true; log.warn(`${id} : échec du Short`); break; }
}
process.exit(failed ? 1 : 0);
