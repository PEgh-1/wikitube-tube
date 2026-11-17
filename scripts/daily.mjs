#!/usr/bin/env node
// Orchestrateur quotidien : generate → tts → images → render → srt → qc → upload.
//   npm run daily                         # production (secrets requis)
//   npm run daily -- --mock --skip-upload # test complet sans aucune clé (silences + placeholders)
//   options : --date YYYY-MM-DD  --episode <fichier json>  --fps 24  --only-render  --from <étape>  --dry-run (upload)
import path from "node:path";
import { DIRS, parseArgs, readJson, writeJson, log, run, exists } from "./lib/common.mjs";

const args = parseArgs();
const mock = Boolean(args.mock);
const skipUpload = Boolean(args["skip-upload"]) || process.env.SKIP_UPLOAD === "1";
const node = process.execPath;
const script = (n) => path.join(DIRS.root, "scripts", n);

const steps = [
  { id: "generate", cmd: [script("generate.mjs"), ...(args.date ? ["--date", args.date] : []), ...(args.episode ? ["--episode", args.episode, "--keep"] : [])] },
  { id: "tts", cmd: [script("tts.mjs"), ...(mock ? ["--mock"] : [])] },
  { id: "images", cmd: [script("images.mjs"), ...(mock ? ["--mock"] : [])] },
  { id: "render", cmd: [script("render.mjs"), ...(args.fps ? ["--fps", String(args.fps)] : []), ...(args["no-subtitles"] ? ["--no-subtitles"] : []), ...(args.excerpt ? ["--excerpt", String(args.excerpt)] : []), ...(args.only ? ["--only", String(args.only)] : [])] },
  { id: "srt", cmd: [script("build-srt.mjs")] },
  { id: "qc", cmd: [script("qc.mjs"), ...(mock ? ["--mock"] : [])] },
  { id: "upload", cmd: [script("upload.mjs"), ...(args["dry-run"] ? ["--dry-run"] : [])], skip: skipUpload },
];

// Mode aperçu : on s'arrête après le rendu de l'extrait (ni SRT, ni QC, ni upload).
// --only short|long : nouveau rendu partiel d'un épisode déjà contrôlé (ni sous-titres, ni QC, ni mise en ligne).
if (args.only) for (const st of steps) if (["srt", "qc", "upload"].includes(st.id)) st.skip = true;
if (args.excerpt) for (const st of steps) if (["srt", "qc", "upload"].includes(st.id)) st.skip = true;

const fromIdx = args.from ? steps.findIndex((s) => s.id === args.from) : 0;
const started = Date.now();
const report = { startedAt: new Date().toISOString(), mock, skipUpload, steps: [] };

for (const [i, step] of steps.entries()) {
  if (i < fromIdx) continue;
  if (step.skip) {
    log.step(`${step.id} — ignoré`);
    report.steps.push({ id: step.id, status: "skipped" });
    continue;
  }
  log.step(step.id);
  const t = Date.now();
  try {
    await run(node, step.cmd, { spawn: { env: process.env } });
    report.steps.push({ id: step.id, status: "ok", seconds: Math.round((Date.now() - t) / 1000) });
  } catch (e) {
    report.steps.push({ id: step.id, status: "failed", seconds: Math.round((Date.now() - t) / 1000), error: String(e.message).slice(0, 2000) });
    finish(false);
    log.error(`Étape ${step.id} en échec`);
    process.exit(1);
  }
}
finish(true);
log.info(`Pipeline terminé en ${((Date.now() - started) / 60000).toFixed(1)} min`);

function finish(ok) {
  report.ok = ok;
  report.finishedAt = new Date().toISOString();
  const cur = exists(path.join(DIRS.build, "current.json")) ? readJson(path.join(DIRS.build, "current.json")) : null;
  report.episodeId = cur?.episodeId ?? null;
  if (cur) writeJson(path.join(DIRS.build, cur.episodeId, "run.json"), report);
  // État commité par le workflow (historique léger des exécutions).
  const stateFile = path.join(DIRS.data, "state.json");
  const state = exists(stateFile) ? readJson(stateFile) : { runs: [] };
  state.lastRun = { episodeId: report.episodeId, ok, mock, finishedAt: report.finishedAt, steps: report.steps.map((s) => `${s.id}:${s.status}`) };
  state.runs = [...(state.runs ?? []), state.lastRun].slice(-60);
  writeJson(stateFile, state);
}
