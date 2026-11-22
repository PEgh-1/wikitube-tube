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
// 1 bis. Remplacement d'un épisode entier déjà programmé ({ id, publishAt, short2At, replaceAll: { long: "<ancien videoId>" } }) :
//    les anciennes vidéos sortent du journal (gardées dans `replaced`), les étapes 2 et 2 bis envoient les nouvelles,
//    et les anciennes ne sont supprimées (étape 4) qu'une fois les trois nouvelles en ligne.
for (const { id, replaceAll } of queue) {
  if (!replaceAll || args["dry-run"]) continue;
  const all = published();
  const e = all.find((x) => x.episodeId === id);
  if (e?.long?.videoId === replaceAll.long && !e.replaced) {
    e.replaced = { long: e.long, short: e.short ?? null, short2: e.short2 ?? null };
    delete e.long; delete e.short; delete e.short2;
    writeJson(logFile, all);
    log.info(`${id} : remplacement demandé, anciennes vidéos mises de côté`);
  }
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
// 2 bis. Second Short ({ id, publishAt, short2At }) : envoyé seul à l'heure short2At, une seule fois.
for (const { id, short2At } of queue) {
  if (!short2At || failed) continue;
  const e = published().find((x) => x.episodeId === id);
  if (!e?.long?.videoId) continue;
  if (e.short2?.videoId) { log.info(`${id} : second Short déjà en ligne, ignoré`); continue; }
  if (!exists(path.join(DIRS.root, "out", id, "short2.mp4"))) { log.warn(`${id} : short2.mp4 absent`); failed = true; break; }
  if (!run(id, ["--publish-at", short2At, "--skip-long", "--long-url", e.long.url, "--short2"])) { failed = true; log.warn(`${id} : échec du second Short`); break; }
}
// 3. Remplacement d'un Short déjà programmé ({ id, publishAt, replaceShort: "<ancien videoId>" }) :
//    le nouveau est envoyé d'abord, l'ancien n'est supprimé qu'une fois le nouveau en ligne.
const requireEnv = (k) => { if (!process.env[k]) throw new Error(`Variable ${k} manquante`); return process.env[k]; };
async function deleteVideo(videoId) {
  const body = new URLSearchParams({ client_id: requireEnv("YT_CLIENT_ID"), client_secret: requireEnv("YT_CLIENT_SECRET"), refresh_token: requireEnv("YT_REFRESH_TOKEN"), grant_type: "refresh_token" });
  const tok = await (await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body })).json();
  const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}`, { method: "DELETE", headers: { authorization: `Bearer ${tok.access_token}` } });
  if (!res.ok && res.status !== 404) throw new Error(`Suppression ${videoId} → ${res.status} : ${(await res.text()).slice(0, 300)}`);
}
for (const { id, publishAt, replaceShort } of queue) {
  if (!replaceShort || failed) continue;
  let all = published();
  let e = all.find((x) => x.episodeId === id);
  if (!e?.long?.videoId) continue;
  if (e.short?.videoId === replaceShort) {
    e.replacedShort = e.short;
    delete e.short;
    writeJson(logFile, all);
    if (!run(id, ["--publish-at", publishAt, "--skip-long", "--long-url", e.long.url])) {
      // Échec : on remet l'ancien Short dans le journal, il reste programmé.
      all = published(); e = all.find((x) => x.episodeId === id);
      if (!e.short?.videoId) { e.short = e.replacedShort; delete e.replacedShort; writeJson(logFile, all); }
      failed = true; log.warn(`${id} : échec du nouveau Short, l'ancien est conservé`); break;
    }
    all = published(); e = all.find((x) => x.episodeId === id);
    if (!e.replacedShort) { e.replacedShort = { videoId: replaceShort }; }
  }
  if (e.replacedShort?.videoId === replaceShort && e.short?.videoId && e.short.videoId !== replaceShort && !e.replacedShort.deleted) {
    if (args["dry-run"]) continue;
    try { await deleteVideo(replaceShort); e.replacedShort.deleted = true; writeJson(logFile, all); log.info(`${id} : ancien Short ${replaceShort} supprimé`); }
    catch (err) { failed = true; log.warn(String(err.message)); }
  }
}
// 4. Fin du remplacement d'un épisode entier : suppression des anciennes vidéos, seulement si les nouvelles sont toutes là.
for (const { id, short2At, replaceAll } of queue) {
  if (!replaceAll || args["dry-run"]) continue;
  const all = published();
  const e = all.find((x) => x.episodeId === id);
  if (!e?.replaced || e.replaced.deleted) continue;
  if (!(e.long?.videoId && e.short?.videoId && (!short2At || e.short2?.videoId))) { failed = true; log.warn(`${id} : remplacement incomplet, les anciennes vidéos restent programmées`); continue; }
  let ok = true;
  for (const k of ["long", "short", "short2"]) {
    const old = e.replaced[k]?.videoId;
    if (!old || old === e[k]?.videoId || e.replaced[k].deleted) continue;
    try { await deleteVideo(old); e.replaced[k].deleted = true; log.info(`${id} : ancien ${k} ${old} supprimé`); }
    catch (err) { ok = false; failed = true; log.warn(String(err.message)); }
  }
  if (ok) e.replaced.deleted = true;
  writeJson(logFile, all);
}
process.exit(failed ? 1 : 0);
