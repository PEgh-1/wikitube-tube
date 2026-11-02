#!/usr/bin/env node
// Étape 6 : contrôle qualité des rendus (ffprobe + loudnorm).
//   - long : 5 ≤ durée ≤ 12 min, 1920×1080, piste audio présente, loudness ≈ -14 LUFS (±2)
//   - short : durée ≤ 60 s, 1080×1920, piste audio présente
//   - miniature : présente, ≤ 2 Mo
//   node scripts/qc.mjs [--episode <id>] [--mock]   (--mock : la loudness des silences n'est qu'un avertissement)
// Écrit build/<id>/qc.json ; code de sortie 1 si un contrôle bloquant échoue.
import path from "node:path";
import fs from "node:fs";
import { DIRS, parseArgs, readJson, writeJson, log, exists, ffprobe, measureLoudness } from "./lib/common.mjs";

const args = parseArgs();
const mock = Boolean(args.mock);
const current = readJson(path.join(DIRS.build, "current.json"));
const episodeId = args.episode ?? current.episodeId;
const buildDir = path.join(DIRS.build, episodeId);
const outDir = path.join(DIRS.out, episodeId);

const checks = [];
const check = (name, ok, detail, { blocking = true } = {}) => {
  checks.push({ name, ok, detail, blocking });
  (ok ? log.info : blocking ? log.error : log.warn)(`${ok ? "✔" : "✖"} ${name} — ${detail}`);
};

async function checkVideo(label, file, { minSec, maxSec, width, height, loudness }) {
  if (!exists(file)) return check(`${label} présent`, false, `fichier manquant : ${path.relative(DIRS.root, file)}`);
  const info = ffprobe(file);
  const dur = Number(info.format.duration);
  const v = info.streams.find((s) => s.codec_type === "video");
  const a = info.streams.find((s) => s.codec_type === "audio");
  check(`${label} durée`, dur >= minSec && dur <= maxSec, `${dur.toFixed(1)} s (attendu ${minSec}–${maxSec} s)`);
  check(`${label} résolution`, v && v.width === width && v.height === height, v ? `${v.width}×${v.height} ${v.codec_name} ${v.r_frame_rate}` : "pas de piste vidéo");
  check(`${label} audio`, Boolean(a), a ? `${a.codec_name} ${a.sample_rate} Hz ${a.channels} ch` : "pas de piste audio");
  if (a && loudness) {
    const l = await measureLoudness(file);
    if (!l || !Number.isFinite(l.integrated) || l.integrated < -60) {
      check(`${label} loudness`, mock, `${l?.integrated ?? "?"} LUFS (silence${mock ? ", normal en mode mock" : ""})`, { blocking: !mock });
    } else {
      const ok = Math.abs(l.integrated - -14) <= 2 && l.truePeak <= -0.5;
      check(`${label} loudness`, ok, `${l.integrated.toFixed(1)} LUFS, pic ${l.truePeak.toFixed(1)} dBTP (cible -14 ±2)`, { blocking: !mock });
    }
  }
  const mb = fs.statSync(file).size / 1e6;
  check(`${label} taille`, mb > 0.5, `${mb.toFixed(1)} Mo`);
  return dur;
}

log.step(`QC ${episodeId}`);
await checkVideo("long", path.join(outDir, "long.mp4"), { minSec: 5 * 60, maxSec: 12 * 60, width: 1920, height: 1080, loudness: true });
await checkVideo("short", path.join(outDir, "short.mp4"), { minSec: 10, maxSec: 60, width: 1080, height: 1920, loudness: true });

const thumb = path.join(outDir, "thumbnail.png");
if (exists(thumb)) {
  const mb = fs.statSync(thumb).size / 1e6;
  const jpg = path.join(outDir, "thumbnail.jpg");
  check("miniature", mb <= 2 || exists(jpg), `${mb.toFixed(2)} Mo png${exists(jpg) ? " (+ jpg de secours)" : ""}`);
} else check("miniature", false, "thumbnail.png manquante");

for (const f of ["long.en.srt", "short.en.srt"]) {
  const p = path.join(outDir, f);
  check(`SRT ${f}`, exists(p) && fs.statSync(p).size > 50, exists(p) ? `${fs.statSync(p).size} octets` : "manquant", { blocking: f === "long.en.srt" });
}

const meta = path.join(buildDir, "metadata.json");
if (exists(meta)) {
  const m = readJson(meta);
  check("titre ≤ 100", m.long.title.length <= 100, `${m.long.title.length} caractères`);
  check("description ≤ 5000", m.long.description.length <= 5000, `${m.long.description.length} caractères`);
  check("chapitres ≥ 3", m.long.chapters.length >= 3 && m.long.chapters[0].seconds === 0, `${m.long.chapters.length} chapitres, 1er à ${m.long.chapters[0]?.time}`);
  const tagChars = m.long.tags.join(",").length;
  check("tags ≤ 500 car.", tagChars <= 500, `${tagChars} caractères`);
} else check("metadata.json", false, "manquant");

const failed = checks.filter((c) => !c.ok && c.blocking);
const warned = checks.filter((c) => !c.ok && !c.blocking);
writeJson(path.join(buildDir, "qc.json"), { episodeId, mock, passed: failed.length === 0, checks, checkedAt: new Date().toISOString() });
log.info(`QC : ${checks.length - failed.length - warned.length} OK, ${warned.length} avertissement(s), ${failed.length} échec(s)`);
if (failed.length) process.exit(1);
