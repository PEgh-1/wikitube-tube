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
const previous = exists(manifestFile) && !args.force ? readJson(manifestFile) : null;

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
  mock,
  provider: mock ? "mock" : providerName,
  generatedAt: new Date().toISOString(),
  hero: results.hero,
  steps: episode.steps.map((_, i) => results[`step-${i + 1}`]),
  all: results,
  credits: Object.values(results)
    .filter((r) => r.credit && r.pageUrl)
    .map((r) => `${r.credit} — ${r.pageUrl}`),
};
writeJson(manifestFile, manifest);
log.info(`${Object.keys(results).length} visuels → ${path.relative(DIRS.root, manifestFile)}`);
