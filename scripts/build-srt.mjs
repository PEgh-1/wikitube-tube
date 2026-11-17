#!/usr/bin/env node
// Étape 5 : sous-titres SRT anglais (long + short) depuis words.json et les timelines rendues.
//   node scripts/build-srt.mjs [--episode <id>] [--max-words 8] [--max-dur 4]
import path from "node:path";
import fs from "node:fs";
import { DIRS, parseArgs, readJson, log, exists } from "./lib/common.mjs";
import { absoluteWords } from "./lib/timeline.mjs";

const args = parseArgs();
const current = readJson(path.join(DIRS.build, "current.json"));
const episodeId = args.episode ?? current.episodeId;
const buildDir = path.join(DIRS.build, episodeId);
const outDir = path.join(DIRS.out, episodeId);
const maxWords = Number(args["max-words"] ?? 8);
const maxDur = Number(args["max-dur"] ?? 4);

for (const [kind, name] of [
  ["long", "long.en.srt"],
  ["short", "short.en.srt"],
  ["short2", "short2.en.srt"],
]) {
  const tlFile = path.join(buildDir, `timeline-${kind}.json`);
  if (!exists(tlFile)) {
    log.warn(`Pas de timeline ${kind} (lancer render.mjs d'abord)`);
    continue;
  }
  const tl = readJson(tlFile);
  const words = absoluteWords(tl);
  const cues = toCues(words, maxWords, maxDur);
  const srt = cues.map((c, i) => `${i + 1}\n${ts(c.s)} --> ${ts(c.e)}\n${c.text}\n`).join("\n");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, name), srt);
  log.info(`✔ ${name} — ${cues.length} sous-titres, ${words.length} mots`);
}

export function toCues(words, maxWords, maxDur) {
  const cues = [];
  let cur = [];
  const flush = () => {
    if (!cur.length) return;
    cues.push({ s: cur[0].s, e: cur[cur.length - 1].e + 0.15, text: wrap(cur.map((w) => w.w).join(" ")) });
    cur = [];
  };
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (cur.length && w.s - cur[cur.length - 1].e > 1.2) flush(); // silence entre segments
    cur.push(w);
    const dur = w.e - cur[0].s;
    const nextEnd = words.slice(i + 1, i + 3).findIndex((x) => /[.!?]$/.test(x.w));
    const absorb = nextEnd >= 0 && cur.length < maxWords + 2;
    if (/[.!?]$/.test(w.w) || dur >= maxDur || (cur.length >= maxWords && !absorb)) flush();
  }
  flush();
  for (let i = 0; i < cues.length - 1; i++) cues[i].e = Math.min(cues[i].e, cues[i + 1].s - 0.01);
  return cues;
}

/** Deux lignes max, ~42 caractères par ligne. */
function wrap(text) {
  if (text.length <= 42) return text;
  const words = text.split(" ");
  let line = "";
  const lines = [];
  for (const w of words) {
    if ((line + " " + w).trim().length > 42 && line) {
      lines.push(line);
      line = w;
    } else line = (line + " " + w).trim();
  }
  if (line) lines.push(line);
  return lines.slice(0, 2).join("\n") + (lines.length > 2 ? " " + lines.slice(2).join(" ") : "");
}

function ts(sec) {
  const ms = Math.max(0, Math.round(sec * 1000));
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const r = ms % 1000;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(r).padStart(3, "0")}`;
}
