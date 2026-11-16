#!/usr/bin/env node
// Étape 2 : voix off. Un mp3 par segment (hook, intro, youneed, step-N, mistakes, recap, outro
// + les 5 segments du Short) dans public/assets/<id>/audio/, et build/<id>/tts.json + words.json.
//   node scripts/tts.mjs            # ElevenLabs (ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID)
//   node scripts/tts.mjs --mock     # silences de la bonne durée + timestamps synthétiques (ffmpeg)
//   options : --episode <id> --force (re-synthétise même si le mp3 existe) --only long|short
import fs from "node:fs";
import path from "node:path";
import { DIRS, parseArgs, readJson, writeJson, log, ensureDir, exists, run, mediaDuration, requireEnv, wordCount, parseLoudnorm } from "./lib/common.mjs";
import { synthesize, DEFAULT_MODEL, getSubscription } from "./providers/elevenlabs.mjs";

const args = parseArgs();
const mock = Boolean(args.mock);
const current = readJson(path.join(DIRS.build, "current.json"));
const episodeId = args.episode ?? current.episodeId;
const buildDir = path.join(DIRS.build, episodeId);
const episode = readJson(path.join(buildDir, "episode.json"));
const segments = readJson(path.join(buildDir, "segments.json"));
const audioDir = ensureDir(path.join(DIRS.assets, episodeId, "audio"));

const round3 = (n) => Math.round(n * 1000) / 1000;
const MOCK_WPS = Number(process.env.MOCK_WORDS_PER_SEC ?? 2.5); // ≈ 150 mots/min
const list = [...(args.only === "short" ? [] : segments.long), ...(args.only === "long" ? [] : segments.short)];

const manifestFile = path.join(buildDir, "tts.json");
const manifest = exists(manifestFile) && !args.force ? readJson(manifestFile) : { episodeId, segments: {} };
manifest.mock = mock;
manifest.model = mock ? "mock" : process.env.ELEVENLABS_MODEL_ID ?? DEFAULT_MODEL;
manifest.voiceId = mock ? "mock" : process.env.ELEVENLABS_VOICE_ID ?? null;

let apiKey, voiceId;
if (!mock) {
  apiKey = requireEnv("ELEVENLABS_API_KEY");
  voiceId = requireEnv("ELEVENLABS_VOICE_ID");
  const sub = await getSubscription(apiKey).catch(() => null);
  if (sub) log.info(`ElevenLabs : ${sub.used}/${sub.limit} caractères utilisés sur la période`);
}

let totalChars = 0;
for (const seg of list) {
  const file = path.join(audioDir, `${seg.id}.mp3`);
  const rel = path.relative(DIRS.public, file).split(path.sep).join("/");
  const prev = manifest.segments[seg.id];
  if (prev && exists(file) && prev.text === seg.text && !args.force && prev.mock === mock) {
    log.info(`↷ ${seg.id} (cache)`);
    continue;
  }
  if (mock) {
    const words = mockWords(seg.text, MOCK_WPS);
    const duration = words.length ? Math.max(words[words.length - 1].e, 0.15 + wordCount(seg.text) / MOCK_WPS) + 0.35 : 1;
    await run("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", duration.toFixed(3), "-c:a", "libmp3lame", "-q:a", "6", file], { quiet: true });
    manifest.segments[seg.id] = { file: rel, text: seg.text, duration: mediaDuration(file), words, mock: true };
    log.info(`✔ ${seg.id} (mock) ${duration.toFixed(1)} s, ${words.length} mots`);
  } else {
    const { audio, words } = await synthesize(seg.text, { apiKey, voiceId, modelId: manifest.model });
    const rawFile = path.join(audioDir, `${seg.id}.raw.mp3`);
    fs.writeFileSync(rawFile, audio);
    await normalize(rawFile, file);
    fs.unlinkSync(rawFile);
    totalChars += seg.text.length;
    manifest.segments[seg.id] = { file: rel, text: seg.text, duration: mediaDuration(file), words, mock: false };
    log.info(`✔ ${seg.id} ${manifest.segments[seg.id].duration.toFixed(1)} s, ${words.length} mots`);
  }
}

manifest.generatedAt = new Date().toISOString();
manifest.totalChars = (manifest.totalChars ?? 0) + totalChars;
writeJson(manifestFile, manifest);
writeJson(
  path.join(buildDir, "words.json"),
  Object.fromEntries(Object.entries(manifest.segments).map(([id, s]) => [id, s.words])),
);
const longSec = segments.long.reduce((a, s) => a + (manifest.segments[s.id]?.duration ?? 0), 0);
const shortSec = segments.short.reduce((a, s) => a + (manifest.segments[s.id]?.duration ?? 0), 0);
log.info(`Narration long ≈ ${(longSec / 60).toFixed(1)} min, short ≈ ${shortSec.toFixed(0)} s${mock ? " (mock)" : ` — ${totalChars} caractères facturés`}`);

/** Normalisation loudness à -14 LUFS (deux passes) pour que le mix final soit déjà au bon niveau. */
async function normalize(input, output) {
  const first = await run("ffmpeg", ["-hide_banner", "-nostats", "-i", input, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], { quiet: true, allowFail: true });
  const j = parseLoudnorm(first.stderr);
  if (!j) {
    fs.copyFileSync(input, output);
    return;
  }
  const af = `loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true,aresample=44100`;
  await run("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", input, "-af", af, "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "128k", output], { quiet: true });
}

/** Timestamps synthétiques : durée ∝ longueur du mot, pause après ponctuation. */
export function mockWords(text, wps = 2.5) {
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  const n = tokens.length;
  if (!n) return [];
  const totalSec = n / wps;
  const weights = tokens.map((t) => {
    const letters = t.replace(/[^\p{L}\p{N}]/gu, "").length || 1;
    return 0.6 + letters * 0.12 + (/[.!?]$/.test(t) ? 1.1 : /[,;:]$/.test(t) ? 0.5 : 0);
  });
  const sum = weights.reduce((a, b) => a + b, 0);
  const words = [];
  let t = 0.15;
  tokens.forEach((w, i) => {
    const d = (weights[i] / sum) * totalSec;
    const speak = Math.min(d, 0.6 + w.length * 0.09);
    words.push({ w, s: round3(t), e: round3(t + speak) });
    t += d;
  });
  return words;
}
