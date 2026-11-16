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
import { subjectTokens, queryVariants, rank, strictMatch, sentenceTerms } from "./lib/relevance.mjs";
import { groupShots, shotPrompt, illustrate } from "./lib/shots.mjs";

const SHOTS_PER_STEP = Number(process.env.SHOTS_PER_STEP ?? 3); // visuels par étape (dont 1 clip vidéo si trouvé)
const MANIFEST_VERSION = 3;
const queryCache = new Map(); // requêtes Pixabay déjà faites pendant ce run

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
  ...episode.steps.map((s, i) => ({ key: `step-${i + 1}`, query: s.imageQuery, prompt: s.imagePrompt, media: s.media ?? "photo", seed: i + 1, step: s })),
];

const apiKey = mock ? null : requireEnv(stockName === "pexels" ? "PEXELS_API_KEY" : "PIXABAY_API_KEY");
const used = new Set();
const results = {};

// Plans pré-générés (Gemini web via navigateur, sans API) : data/shots/<id>/shots.json + images commitées.
// Format : { shots: { "step-2": [{ text, prompt, file }] } } — les textes mis bout à bout = la narration de l'étape.
const pregenDir = path.join(DIRS.data, "shots", episodeId);
const pregen = exists(path.join(pregenDir, "shots.json")) ? readJson(path.join(pregenDir, "shots.json")) : null;
function fromPregen(t) {
  const list = pregen?.shots?.[t.key];
  if (!list?.length || !t.step) return null;
  const norm = (x) => x.replace(/\s+/g, " ").trim();
  if (norm(list.map((x) => x.text).join(" ")) !== norm(t.step.narration)) {
    log.warn(`plans pré-générés ${t.key} : textes ≠ narration → ignorés`);
    return null;
  }
  const clean = (w) => w.toLowerCase().replace(/[^a-z0-9'-]/g, "");
  const copy = (name, dest) => {
    const src = name ? path.join(pregenDir, name) : null;
    if (!src || !exists(src)) return null;
    const file = path.join(imgDir, `${dest}${path.extname(src)}`);
    fs.copyFileSync(src, file);
    return file;
  };
  let idx = 0;
  const shots = [];
  for (const [j, sh] of list.entries()) {
    const wordStart = idx;
    const words = sh.text.split(/\s+/).filter(Boolean);
    idx += words.length;
    const file = copy(sh.file, `${t.key}-${j + 1}`);
    if (!file) {
      const ill = illustrate(sh.text);
      shots.push({ key: t.key, query: t.query, kind: "illustration", file: "", ...ill, text: sh.text, wordStart, provider: "remotion" });
      log.warn(`${t.key} plan ${j + 1} : image pré-générée absente → illustration Remotion`);
      continue;
    }
    const base = entry(t, { kind: "photo", width: 1920, height: 1080, provider: "gemini-web", credit: null }, file);
    shots.push({ ...base, text: sh.text, wordStart, prompt: sh.prompt, focus: sh.focus ?? null, notes: sh.notes ?? null });
    // Second plan de la même phrase : gros plan dédié (cut.file) ou zoom sur le geste (même image).
    if (sh.cut) {
      const at = Math.max(1, words.findIndex((w) => clean(w) === clean(sh.cut.on ?? "")));
      const file2 = copy(sh.cut.file, `${t.key}-${j + 1}b`) ?? file;
      const b = entry(t, { kind: "photo", width: 1920, height: 1080, provider: "gemini-web", credit: null }, file2);
      shots.push({ ...b, text: words.slice(at).join(" "), wordStart: wordStart + at, sub: true, zoom: sh.cut.file ? null : (sh.cut.zoom ?? 1.45), focus: sh.cut.focus ?? sh.focus ?? null, notes: sh.cut.notes ?? null });
    }
    log.info(`✔ ${t.key} phrase ${j + 1}/${list.length} pré-générée${sh.cut ? " (2 plans)" : ""} — « ${sh.text.slice(0, 50)} »`);
  }
  const firstPhoto = shots.find((x) => x.kind === "photo");
  return firstPhoto ? { ...firstPhoto, shots } : null;
}

for (const t of targets) {
  const prev = previous?.all?.[t.key];
  const wantGemini = providerName === "gemini" && gemini.isConfigured() && !mock;
  const pre = mock ? null : fromPregen(t);
  if (pre) {
    results[t.key] = pre;
    continue;
  }
  if (prev && exists(path.join(DIRS.public, prev.file)) && prev.query === t.query && Boolean(prev.mock) === mock && (prev.provider === "gemini") === wantGemini) {
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
    if (t.step) {
      // Plans de substitution calés sur les phrases, pour tester la synchronisation sans clé.
      results[t.key].shots = groupShots(t.step.narration, { maxShots: SHOTS_PER_STEP }).map((gr, j) => {
        const f = path.join(imgDir, `${t.key}-${j + 1}.png`);
        fs.writeFileSync(f, placeholderPng(1920, 1080, t.seed * 7 + j * 3));
        // 1 plan sur 2 en illustration Remotion pour tester les deux rendus.
        if (j % 2 === 1) return { key: t.key, query: t.query, kind: "illustration", file: "", ...illustrate(gr.text), text: gr.text, wordStart: gr.wordStart, mock: true };
        return { ...entry(t, { kind: "photo", width: 1920, height: 1080, mock: true, credit: "placeholder" }, f), text: gr.text, wordStart: gr.wordStart };
      });
    }
    log.info(`✔ ${t.key} (mock placeholder)`);
    continue;
  }
  let got = null;
  if (providerName === "gemini" && gemini.isConfigured()) {
    try {
      got = await fromGemini(t);
    } catch (e) {
      log.warn(`gemini ${t.key} : ${e.message} → repli ${stockLabel}`);
    }
  }
  if (!got && multi) {
    got = t.step ? await fromPixabayStrict(t) : await fromPixabayRanked(t);
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

// Images générées synchronisées sur la voix : un plan par groupe de phrases de la narration.
async function fromGemini(t) {
  if (t.key === "hero") {
    const file = path.join(imgDir, "hero.png");
    const g = await gemini.generate({ prompt: `${t.prompt} No text, no letters, no watermark.`, aspect: "16:9", dest: file });
    if (!g) return null;
    log.info(`✔ hero Gemini (${g.model})`);
    return entry(t, { kind: "photo", width: null, height: null, provider: "gemini", model: g.model, credit: null }, file);
  }
  const groups = groupShots(t.step.narration, { maxShots: SHOTS_PER_STEP });
  const shots = [];
  for (const [j, gr] of groups.entries()) {
    const file = path.join(imgDir, `${t.key}${j ? `-${j + 1}` : ""}.png`);
    const prompt = shotPrompt({ subject: episode.title.replace(/^how to\s+/i, ""), stepTitle: t.step.title, text: gr.text, stylePrompt: j === 0 ? t.prompt : null });
    let g = null;
    try {
      g = await gemini.generate({ prompt, aspect: "16:9", dest: file });
    } catch (e) {
      log.warn(`gemini ${t.key} plan ${j + 1} : ${e.message}`);
    }
    if (!g) continue;
    shots.push({ ...entry(t, { kind: "photo", width: null, height: null, provider: "gemini", model: g.model, credit: null }, file), text: gr.text, wordStart: gr.wordStart, prompt });
    log.info(`✔ ${t.key} plan ${j + 1}/${groups.length} Gemini — « ${gr.text.slice(0, 70)} »`);
  }
  if (!shots.length) return null;
  // Un plan manquant : son voisin couvre son temps de parole (les mots de début restent ceux des plans générés).
  return { ...shots[0], shots };
}

// Pixabay « strict » : une photo/clip par phrase seulement si elle s'y prête vraiment
// (nom principal du sujet + ≥ 2 mots de la phrase dans les tags), sinon illustration animée Remotion.
async function cachedSearch(kind, q) {
  const k = `${kind}:${q}`;
  if (!queryCache.has(k)) {
    await new Promise((r) => setTimeout(r, 350)); // 100 requêtes/min max côté Pixabay
    try {
      queryCache.set(k, kind === "video" ? await pixabay.searchVideoList(q, { apiKey }) : await pixabay.searchPhotoList(q, { apiKey }));
    } catch (e) {
      log.warn(`Pixabay ${kind} « ${q} » : ${e.message}`);
      queryCache.set(k, []);
    }
  }
  return queryCache.get(k);
}

async function fromPixabayStrict(t) {
  const groups = groupShots(t.step.narration, { maxShots: SHOTS_PER_STEP });
  const subj = subject.join(" ");
  const shots = [];
  for (const [j, gr] of groups.entries()) {
    const terms = sentenceTerms(gr.text, subject);
    const queries = [...new Set([`${subj} ${terms.slice(0, 2).join(" ")}`.trim(), `${subj} ${terms[0] ?? ""}`.trim(), t.query])];
    let pick = null;
    for (const q of queries) {
      const vids = q === queries[0] ? await cachedSearch("video", q) : [];
      const photos = await cachedSearch("photo", q);
      pick = [...vids, ...photos].find((c) => !used.has(c.id) && strictMatch(c, gr.text, subject));
      if (pick) break;
    }
    if (pick) {
      used.add(pick.id);
      const ext = pick.kind === "video" ? "mp4" : "jpg";
      const file = path.join(imgDir, `${t.key}-${j + 1}.${ext}`);
      try {
        await stock.download(pick.downloadUrl, file);
        const { tags, ratio, wide, ...meta } = pick;
        shots.push({ ...entry(t, { ...meta, source: "pixabay", credit: `Pixabay / ${pick.photographer}` }, file), text: gr.text, wordStart: gr.wordStart });
        log.info(`✔ ${t.key} plan ${j + 1} : ${pick.kind} Pixabay ${pick.id} « ${tags.slice(0, 60)} »`);
        continue;
      } catch (e) {
        log.warn(`téléchargement ${pick.id} : ${e.message}`);
      }
    }
    const ill = illustrate(gr.text);
    shots.push({ key: t.key, query: t.query, kind: "illustration", file: "", ...ill, text: gr.text, wordStart: gr.wordStart, provider: "remotion" });
    log.info(`✎ ${t.key} plan ${j + 1} : illustration Remotion « ${ill.caption} » [${ill.icons.join(", ")}]`);
  }
  const firstPhoto = shots.find((x) => x.kind === "photo") ?? shots[0];
  return { ...firstPhoto, shots };
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
  // Image « principale » d'étape (Short, miniature) : jamais une illustration → repli sur l'image héros.
  steps: episode.steps.map((_, i) => {
    const r = stripShots(results[`step-${i + 1}`]);
    return r?.kind === "illustration" ? stripShots(results.hero) : r;
  }),
  stepShots: episode.steps.map((_, i) => results[`step-${i + 1}`]?.shots ?? [stripShots(results[`step-${i + 1}`])]),
  // Encarts calés sur la voix (chiffres, « pourquoi », « à éviter », coches du matériel), par étape.
  stepExtras: episode.steps.map((_, i) => pregen?.extras?.[`step-${i + 1}`] ?? null),
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
