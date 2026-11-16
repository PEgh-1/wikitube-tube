#!/usr/bin/env node
// Étape 4 : rendu Remotion (API @remotion/renderer) : long 1920×1080, Short 1080×1920, miniature 1280×720.
// Calcule les timelines depuis les durées audio, les chapitres, et écrit build/<id>/metadata.json.
//   node scripts/render.mjs                  # tout
//   node scripts/render.mjs --only long|short|thumb
//   options : --episode <id> --fps 24 (test) --no-subtitles --concurrency 2 --crf 20
//   aperçu  : --excerpt step-2 [--excerpt-sec 45] → out/<id>/excerpt.mp4 (long uniquement, à partir de 1 s avant la scène)
import path from "node:path";
import fs from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition, ensureBrowser } from "@remotion/renderer";
import { creditsLine } from "./lib/credits.mjs";
import { DIRS, FPS, parseArgs, readJson, writeJson, log, ensureDir, mediaDuration, run } from "./lib/common.mjs";
import { buildLongTimeline, buildShortTimeline, chaptersText } from "./lib/timeline.mjs";
import { LOCALES } from "./lib/episode.mjs";

const args = parseArgs();
const current = readJson(path.join(DIRS.build, "current.json"));
const episodeId = args.episode ?? current.episodeId;
const buildDir = path.join(DIRS.build, episodeId);
const outDir = ensureDir(path.join(DIRS.out, episodeId));
const episode = readJson(path.join(buildDir, "episode.json"));
const tts = readJson(path.join(buildDir, "tts.json"));
const images = readJson(path.join(buildDir, "images.json"));

const fps = Number(args.fps ?? FPS);
const concurrency = Number(args.concurrency ?? process.env.REMOTION_CONCURRENCY ?? 2);
const crf = Number(args.crf ?? 20);
const only = args.only ?? "all";
const burnSubtitles = Boolean(args["subtitles"]) || process.env.BURN_SUBTITLES === "1";
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || null;
const chromiumOptions = { gl: "angle", enableMultiProcessOnLinux: true };

// ---------- Timelines ----------
const longTl = buildLongTimeline(episode, tts, images, { fps });
const shortTl = buildShortTimeline(episode, tts, images, { fps });
writeJson(path.join(buildDir, "timeline-long.json"), longTl);
writeJson(path.join(buildDir, "timeline-short.json"), shortTl);
log.info(`Long : ${(longTl.totalSec / 60).toFixed(2)} min (${longTl.durationInFrames} frames @${fps}) — Short : ${shortTl.totalSec.toFixed(1)} s`);

// ---------- Métadonnées YouTube (description + chapitres + crédits) ----------
const creditText = creditsLine(Object.values(images.all ?? {}));
const credits = creditText ? `\n\n${creditText}` : "";
const description = `${episode.metadata.description}\n\nChapters:\n${chaptersText(longTl.chapters)}${credits}`;
const metadata = {
  episodeId,
  long: {
    title: episode.metadata.title,
    description,
    tags: episode.metadata.tags,
    chapters: longTl.chapters,
    localizations: Object.fromEntries(
      LOCALES.map((l) => [l, { title: episode.metadata.localizations[l].title, description: `${episode.metadata.localizations[l].description}\n\n${chaptersText(longTl.chapters)}` }]),
    ),
    durationSec: longTl.totalSec,
    file: path.relative(DIRS.root, path.join(outDir, "long.mp4")),
    thumbnail: path.relative(DIRS.root, path.join(outDir, "thumbnail.png")),
    srt: path.relative(DIRS.root, path.join(outDir, "long.en.srt")),
  },
  short: {
    title: episode.short.title.includes("#shorts") ? episode.short.title : `${episode.short.title} #shorts`,
    description: episode.short.description,
    tags: episode.metadata.tags.slice(0, 10),
    durationSec: shortTl.totalSec,
    file: path.relative(DIRS.root, path.join(outDir, "short.mp4")),
  },
  playlistId: episode.metadata.playlistId ?? process.env.YT_PLAYLIST_ID ?? null,
  renderedAt: new Date().toISOString(),
  fps,
  burnSubtitles,
};
writeJson(path.join(buildDir, "metadata.json"), metadata);
fs.writeFileSync(path.join(buildDir, "chapters.txt"), chaptersText(longTl.chapters) + "\n");

// ---------- Bundle ----------
log.step("Bundle Remotion");
if (!browserExecutable) await ensureBrowser();
const bundleDir = path.join(DIRS.build, ".bundle");
const serveUrl = await bundle({
  entryPoint: path.join(DIRS.root, "src", "index.ts"),
  publicDir: DIRS.public,
  outDir: bundleDir,
  onProgress: throttle((p) => log.info(`bundle ${p}%`), 2000),
});

const common = { serveUrl, browserExecutable, chromiumOptions, logLevel: "warn" };

async function renderVideo(id, timeline, outFile, frameRange = null) {
  log.step(`Rendu ${id} → ${path.relative(DIRS.root, outFile)}`);
  const inputProps = { timeline, options: { burnSubtitles, audio: true } };
  const composition = await selectComposition({ ...common, id, inputProps });
  const started = Date.now();
  await renderMedia({
    ...common,
    composition,
    codec: "h264",
    crf,
    imageFormat: "jpeg",
    jpegQuality: 85,
    concurrency,
    inputProps,
    outputLocation: outFile,
    ...(frameRange ? { frameRange } : {}),
    audioCodec: "aac",
    audioBitrate: "192k",
    x264Preset: "medium",
    onProgress: throttle(({ renderedFrames, encodedFrames }) => {
      const total = frameRange ? frameRange[1] - frameRange[0] + 1 : composition.durationInFrames;
      const pct = ((encodedFrames / total) * 100).toFixed(0);
      const fpsNow = renderedFrames / ((Date.now() - started) / 1000);
      log.info(`${id} ${pct}% — ${renderedFrames}/${composition.durationInFrames} frames (${fpsNow.toFixed(1)} fps)`);
    }, 15000),
  });
  const d = mediaDuration(outFile);
  log.info(`✔ ${id} ${d.toFixed(1)} s en ${((Date.now() - started) / 1000 / 60).toFixed(1)} min`);
  return d;
}

if (args.excerpt) {
  const [type, n] = String(args.excerpt).split("-");
  const sc = longTl.scenes.find((x) => x.type === type && (n === undefined || String(x.index) === n));
  if (!sc) throw new Error(`Scène introuvable pour --excerpt ${args.excerpt}`);
  const start = Math.max(0, Math.round((sc.start - 1) * fps));
  const end = Math.min(longTl.durationInFrames - 1, start + Math.round(Number(args["excerpt-sec"] ?? process.env.EXCERPT_SEC ?? 62) * fps));
  await renderVideo("Long", longTl, path.join(outDir, "excerpt.mp4"), [start, end]);
  log.info(`Extrait ${args.excerpt} : ${(start / fps).toFixed(1)} → ${(end / fps).toFixed(1)} s`);
  process.exit(0);
}

if (only === "all" || only === "thumb") {
  log.step("Miniature");
  const inputProps = { title: episode.metadata.thumbnailTitle, stepCount: episode.steps.length, category: episode.category, image: images.hero };
  const composition = await selectComposition({ ...common, id: "Thumbnail", inputProps });
  const outFile = path.join(outDir, "thumbnail.png");
  await renderStill({ ...common, composition, inputProps, output: outFile, imageFormat: "png" });
  // YouTube : miniature ≤ 2 Mo → version JPEG de secours.
  await run("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", outFile, "-q:v", "3", path.join(outDir, "thumbnail.jpg")], { quiet: true });
  log.info(`✔ thumbnail.png (${(fs.statSync(outFile).size / 1024).toFixed(0)} Ko)`);
}
if (only === "all" || only === "short") {
  await renderVideo("Short", shortTl, path.join(outDir, "short.mp4"));
}
if (only === "all" || only === "long") {
  await renderVideo("Long", longTl, path.join(outDir, "long.mp4"));
}

writeJson(path.join(buildDir, "render.json"), { episodeId, fps, concurrency, crf, finishedAt: new Date().toISOString(), outDir: path.relative(DIRS.root, outDir) });
log.info("Rendu terminé.");

function throttle(fn, ms) {
  let last = 0;
  return (...a) => {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn(...a);
    }
  };
}
