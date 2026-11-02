#!/usr/bin/env node
// Étape 3 : visuels. Une image (ou vidéo) par étape + une image "héros" (hook, miniature),
// mises en cache dans public/assets/<id>/images/, manifeste build/<id>/images.json.
//   node scripts/images.mjs                   # Pixabay (PIXABAY_API_KEY), fournisseur par défaut
//   node scripts/images.mjs --provider pexels # Pexels (PEXELS_API_KEY, nouvelles clés suspendues)
//   node scripts/images.mjs --mock            # PNG de substitution aux couleurs de la charte
//   node scripts/images.mjs --provider gemini # (squelette) génération via providers/gemini.mjs, repli Pixabay
//   options : --episode <id> --force
import fs from "node:fs";
import path from "node:path";
import { DIRS, parseArgs, readJson, writeJson, log, ensureDir, exists, requireEnv } from "./lib/common.mjs";
import * as pexels from "./providers/pexels.mjs";
import * as pixabay from "./providers/pixabay.mjs";
import * as gemini from "./providers/gemini.mjs";
import { placeholderPng } from "./lib/png.mjs";
import { subjectTokens, queryVariants, rank } from "./lib/relevance.mjs";

const SHOTS_PER_STEP = Number(process.env.SHOTS_PER_STEP ?? 3); // visuels par étape (dont 1 clip vidéo si trouvé)
const MANIFEST_VERSION = 2;

const args = parseArgs();
const mock = Boolean(args.mock);
const providerName = args.provider ?? process.env.IMAGE_PROVIDER ?? "pixabay";
// Fournisseur de photos/vidéos libres (Gemini retombe sur Pixabay).
const stockName = providerName === "pexels" ? "pexels" : "pixabay";
const stock = stockName === "pexels" ? pexels : pixabay;
const stockLabel = stockName === "pexels" ? "Pexels" : "Pixabay";
const current = readJson(path.join(DIRS.build, "current.json"));
const episodeId = args.episode ?? current.episodeId;
const buildDir = path.join(DIRS.build, episodeId);
const episode = readJson(path.join(buildDir, "episode.json"));
const imgDir = ensureDir(path.join(DIRS.assets, episodeId, "images"));
const manifestFile = path.join(buildDir, "images.json");
let previous = exists(manifestFile) && !args.force ? readJson(manifestFile) : null;
if (previous && previous.version !== MANIFEST_VERSION) previous = null;
const subject = subjectTokens(episode.heroImageQuery, episode.steps.map((s) => s.imageQuery));
const multi = stockName === "pixabay" && !mock && typeof pixabay.searchPhotoList === "function";

const targets = [
  { key: "hero", query: episode.heroImageQuery, prompt: episode.heroImagePrompt, media: "photo", seed: 0 },
  ...episode.steps.map((s, i) => ({ key: `step-${i + 1}`, query: s.imageQuery, prompt: s.imagePrompt, media: s.media ?? "photo", seed: i + 1 })),
];

const apiKey = mock ? null : requireEnv(stockName === "pexels" ? "PEXELS_API_KEY" : "PIXABAY_API_KEY");
const used = new Set();
const results = {};

for (const t of targets) {
  const prev = previous?.all?.[t.key];
  if (prev && exists(path.join(DIRS.public, prev.file)) && prev.query === t.query && Boolean(prev.mock) === mock) {
    results[t.key] = prev;
    if (prev.id) used.add(prev.id);
    for (const sh of prev.shots ?? []) if (sh.id) used.add(sh.id);
    log.info(`↷ ${t.key} (cache)`);
    continue;
  }
  if (mock) {
    const file = path.join(imgDir, `${t.key}.png`);
    fs.writeFileSync(file, placeholderPng(1920, 1080, t.seed));
    results[t.key] = entry(t, { kind: "photo", width: 1920, height: 1080, mock: true, credit: "placeholder" }, file);
    log.info(`✔ ${t.key} (mock placeholder)`);
    continue;
  }
  let got = null;
  if (providerName === "gemini" && gemini.isConfigured()) {
    try {
      const file = path.join(imgDir, `${t.key}.png`);
      const g = await gemini.generate({ prompt: t.prompt, aspect: "16:9", dest: file });
      if (g) got = entry(t, { kind: "photo", width: null, height: null, provider: "gemini" }, file);
    } catch (e) {
      log.warn(`gemini ${t.key} : ${e.message} → repli ${stockLabel}`);
    }
  }
  if (!got && multi) {
    got = await fromPixabayRanked(t);
  }
  if (!got) {
    got = await fromStock(t);
  }
  if (!got) {
    // Dernier repli : requête simplifiée (2 premiers mots) puis placeholder.
    const simple = t.query.split(/\s+/).slice(0, 2).join(" ");
    log.warn(`${stockLabel} : rien pour « ${t.query} », essai « ${simple} »`);
    got = await fromStock({ ...t, query: simple });
  }
  if (!got) {
    log.warn(`Aucun visuel pour ${t.key} → placeholder`);
    const file = path.join(imgDir, `${t.key}.png`);
    fs.writeFileSync(file, placeholderPng(1920, 1080, t.seed));
    got = entry(t, { kind: "photo", width: 1920, height: 1080, mock: true, credit: "placeholder" }, file);
  }
  results[t.key] = got;
}

// Pixabay classé par pertinence : plusieurs requêtes (précise → large), tags notés, sujet obligatoire.
async function fromPixabayRanked(t) {
  const variants = queryVariants(t.query, subject);
  const cands = [];
  for (const q of variants) {
    try {
      cands.push(...(await pixabay.searchPhotoList(q, { apiKey })));
    } catch (e) {
      log.warn(`Pixabay « ${q} » : ${e.message}`);
    }
    if (rank(cands, t.query, subject, used).length >= SHOTS_PER_STEP + 2) break;
  }
  const ranked = rank(cands, t.query, subject, used);
  // Avec le nom principal du sujet (score ≥ 7) en priorité ; les autres seulement en dernier recours.
  const strong = ranked.filter((p) => p.score >= 7);
  const photos = strong.length ? strong : ranked;
  let video = null;
  if (t.key !== "hero") {
    const vc = [];
    for (const q of variants.slice(1, 4)) {
      try {
        vc.push(...(await pixabay.searchVideoList(q, { apiKey })));
      } catch (e) {
        log.warn(`Pixabay vidéo « ${q} » : ${e.message}`);
      }
      if (rank(vc, t.query, subject, used).length) break;
    }
    // Un clip n'est retenu que s'il montre le sujet principal (score ≥ 8 ≈ sujet + nom principal + 1 action).
    video = rank(vc, t.query, subject, used).find((v) => v.score >= 8) ?? null;
  }
  const picks = [];
  if (video) picks.push(video);
  for (const p of photos) {
    if (picks.length >= (t.key === "hero" ? 1 : SHOTS_PER_STEP)) break;
    picks.push(p);
  }
  if (!picks.length) return null;
  const shots = [];
  for (const [j, p] of picks.entries()) {
    used.add(p.id);
    const ext = p.kind === "video" ? "mp4" : "jpg";
    const file = path.join(imgDir, `${t.key}${j ? `-${j + 1}` : ""}.${ext}`);
    try {
      await stock.download(p.downloadUrl, file);
    } catch (e) {
      log.warn(`téléchargement ${p.id} : ${e.message}`);
      continue;
    }
    const { tags, ratio, wide, score, ...meta } = p;
    shots.push(entry(t, { ...meta, score, source: "pixabay", credit: `Pixabay / ${p.photographer}` }, file));
    log.info(`✔ ${t.key} #${j + 1} ${p.kind} Pixabay ${p.id} (score ${score}) « ${tags.slice(0, 60)} »`);
  }
  if (!shots.length) return null;
  const firstPhoto = shots.find((x) => x.kind !== "video") ?? shots[0];
  return { ...firstPhoto, shots };
}

async function fromStock(t) {
  if (t.media === "video") {
    const v = await stock.searchVideo(t.query, { apiKey });
    if (v) {
      const file = path.join(imgDir, `${t.key}.mp4`);
      await stock.download(v.downloadUrl, file);
      log.info(`✔ ${t.key} vidéo ${stockLabel} #${v.id} (${v.width}×${v.height}, ${v.duration}s)`);
      return entry(t, { ...v, source: stockName, credit: `${stockLabel} / ${v.photographer}` }, file);
    }
    log.warn(`Pas de vidéo pour « ${t.query} », repli photo`);
  }
  const p = await stock.searchPhoto(t.query, { apiKey, exclude: used });
  if (!p) return null;
  used.add(p.id);
  const file = path.join(imgDir, `${t.key}.jpg`);
  await stock.download(p.downloadUrl, file);
  log.info(`✔ ${t.key} photo ${stockLabel} #${p.id} (${p.width}×${p.height}) par ${p.photographer}`);
  return entry(t, { ...p, source: stockName, credit: `${stockLabel} / ${p.photographer}` }, file);
}

function entry(t, meta, file) {
  const { downloadUrl, url, ...rest } = meta; // pas d'URL distante conservée : fichiers servis depuis le cache local
  return { key: t.key, query: t.query, prompt: t.prompt, file: path.relative(DIRS.public, file).split(path.sep).join("/"), ...rest };
}

const manifest = {
  episodeId,
  version: MANIFEST_VERSION,
  subject,
  mock,
  provider: mock ? "mock" : providerName,
  generatedAt: new Date().toISOString(),
  hero: stripShots(results.hero),
  steps: episode.steps.map((_, i) => stripShots(results[`step-${i + 1}`])),
  stepShots: episode.steps.map((_, i) => results[`step-${i + 1}`]?.shots ?? [stripShots(results[`step-${i + 1}`])]),
  all: results,
  credits: Object.values(results)
    .flatMap((r) => r.shots ?? [r])
    .filter((r) => r.credit && r.pageUrl)
    .map((r) => `${r.credit} — ${r.pageUrl}`),
};
writeJson(manifestFile, manifest);

function stripShots(r) {
  if (!r) return r;
  const { shots, ...rest } = r;
  return rest;
}
log.info(`${Object.keys(results).length} visuels → ${path.relative(DIRS.root, manifestFile)}`);
