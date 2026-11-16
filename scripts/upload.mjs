#!/usr/bin/env node
// Étape 7 : mise en ligne YouTube (Data API v3, OAuth refresh token) — long + Short programmés,
// miniature, localisations, playlist, sous-titres anglais (captions.insert).
//   node scripts/upload.mjs                 # programme au prochain créneau 17:30 Europe/Paris
//   node scripts/upload.mjs --dry-run       # affiche les requêtes sans rien envoyer
//   options : --episode <id> --publish-at 2026-11-03T16:30:00Z --now (public immédiat) --private --skip-short
//             --short-delay 30 (minutes après le long)  --slot 17:30
// Secrets : YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN ; optionnel YT_PLAYLIST_ID
import fs from "node:fs";
import path from "node:path";
import { DIRS, parseArgs, readJson, writeJson, log, exists, requireEnv } from "./lib/common.mjs";

const args = parseArgs();
const dry = Boolean(args["dry-run"]);
const current = readJson(path.join(DIRS.build, "current.json"));
const episodeId = args.episode ?? current.episodeId;
const buildDir = path.join(DIRS.build, episodeId);
const meta = readJson(path.join(buildDir, "metadata.json"));
const qc = exists(path.join(buildDir, "qc.json")) ? readJson(path.join(buildDir, "qc.json")) : null;
if (qc && !qc.passed && !args.force) throw new Error("QC en échec : upload refusé (utiliser --force pour passer outre)");

const TZ = "Europe/Paris";
const slot = String(args.slot ?? process.env.PUBLISH_SLOT ?? "17:30");
const shortDelayMin = Number(args["short-delay"] ?? process.env.SHORT_DELAY_MINUTES ?? 30);

// ---------- Créneau de publication ----------
export function tzOffsetMs(tz, date) {
  const p = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).formatToParts(date);
  const g = (t) => Number(p.find((x) => x.type === t).value);
  return Date.UTC(g("year"), g("month") - 1, g("day"), g("hour"), g("minute"), g("second")) - Math.floor(date.getTime() / 1000) * 1000;
}
export function zonedToUtc(tz, y, m, d, h, mi) {
  let guess = Date.UTC(y, m - 1, d, h, mi);
  for (let i = 0; i < 2; i++) guess = Date.UTC(y, m - 1, d, h, mi) - tzOffsetMs(tz, new Date(guess));
  return new Date(guess);
}
export function nextSlot(now = new Date(), { tz = TZ, hhmm = slot, minLeadMin = 15 } = {}) {
  const [h, mi] = hhmm.split(":").map(Number);
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const g = (t) => Number(p.find((x) => x.type === t).value);
  let cand = zonedToUtc(tz, g("year"), g("month"), g("day"), h, mi);
  while (cand.getTime() < now.getTime() + minLeadMin * 60000) cand = zonedToUtc(tz, ...ymd(new Date(cand.getTime() + 24 * 3600000), tz), h, mi);
  return cand;
}
function ymd(date, tz) {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const g = (t) => Number(p.find((x) => x.type === t).value);
  return [g("year"), g("month"), g("day")];
}

const publishAt = args.now || args.private ? null : args["publish-at"] ? new Date(args["publish-at"]) : nextSlot();
const shortPublishAt = publishAt ? new Date(publishAt.getTime() + shortDelayMin * 60000) : null;
const privacy = args.now ? "public" : "private"; // privé + publishAt = programmé

// ---------- OAuth ----------
async function accessToken() {
  const body = new URLSearchParams({
    client_id: requireEnv("YT_CLIENT_ID"),
    client_secret: requireEnv("YT_CLIENT_SECRET"),
    refresh_token: requireEnv("YT_REFRESH_TOKEN"),
    grant_type: "refresh_token",
  });
  const res = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body });
  if (!res.ok) throw new Error(`OAuth ${res.status} : ${(await res.text()).slice(0, 300)}`);
  return (await res.json()).access_token;
}

let token = null;
async function api(method, url, { json, body, headers = {} } = {}) {
  if (dry) {
    log.info(`[dry-run] ${method} ${url}${json ? "\n" + JSON.stringify(json, null, 2).slice(0, 1500) : ""}`);
    return { id: "dry-run-id", snippet: {} };
  }
  token ??= await accessToken();
  const res = await fetch(url, {
    method,
    headers: { authorization: `Bearer ${token}`, ...(json ? { "content-type": "application/json" } : {}), ...headers },
    body: json ? JSON.stringify(json) : body,
  });
  if (!res.ok) throw new Error(`${method} ${url} → ${res.status} : ${(await res.text()).slice(0, 800)}`);
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

// ---------- videos.insert (resumable) ----------
async function uploadVideo(file, snippet, status, localizations) {
  const size = fs.statSync(file).size;
  const parts = ["snippet", "status"].concat(localizations ? ["localizations"] : []).join(",");
  const metadata = { snippet, status, ...(localizations ? { localizations } : {}) };
  if (dry) {
    log.info(`[dry-run] videos.insert ${path.basename(file)} (${(size / 1e6).toFixed(1)} Mo)\n${JSON.stringify(metadata, null, 2).slice(0, 2500)}`);
    return { id: `dry-${path.basename(file, ".mp4")}` };
  }
  token ??= await accessToken();
  const init = await fetch(`https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=${parts}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json; charset=UTF-8",
      "x-upload-content-type": "video/mp4",
      "x-upload-content-length": String(size),
    },
    body: JSON.stringify(metadata),
  });
  if (!init.ok) throw new Error(`videos.insert init ${init.status} : ${(await init.text()).slice(0, 800)}`);
  const location = init.headers.get("location");
  for (let attempt = 1; attempt <= 3; attempt++) {
    const put = await fetch(location, { method: "PUT", headers: { "content-type": "video/mp4", "content-length": String(size) }, body: fs.readFileSync(file) });
    if (put.ok) return put.json();
    log.warn(`PUT ${put.status} (essai ${attempt}) : ${(await put.text()).slice(0, 300)}`);
    await new Promise((r) => setTimeout(r, 5000 * attempt));
  }
  throw new Error("Upload vidéo échoué après 3 essais");
}

async function setThumbnail(videoId, file) {
  const buf = fs.readFileSync(file);
  return api("POST", `https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${videoId}`, { body: buf, headers: { "content-type": file.endsWith(".png") ? "image/png" : "image/jpeg", "content-length": String(buf.length) } });
}

async function insertCaption(videoId, srtFile, language = "en", name = "English") {
  const boundary = "wikitube_" + Date.now();
  const metaPart = JSON.stringify({ snippet: { videoId, language, name, isDraft: false } });
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\ncontent-type: application/json; charset=UTF-8\r\n\r\n${metaPart}\r\n--${boundary}\r\ncontent-type: application/octet-stream\r\n\r\n`),
    fs.readFileSync(srtFile),
    Buffer.from(`\r\n--${boundary}--`),
  ]);
  return api("POST", "https://www.googleapis.com/upload/youtube/v3/captions?uploadType=multipart&part=snippet", { body, headers: { "content-type": `multipart/related; boundary=${boundary}`, "content-length": String(body.length) } });
}

async function addToPlaylist(playlistId, videoId) {
  return api("POST", "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet", { json: { snippet: { playlistId, resourceId: { kind: "youtube#video", videoId } } } });
}

// ---------- Déroulé ----------
log.step(`Upload ${episodeId}${dry ? " (dry-run)" : ""}`);
log.info(`Long programmé : ${publishAt ? publishAt.toISOString() : privacy} — Short : ${shortPublishAt ? shortPublishAt.toISOString() : privacy}`);

const result = { episodeId, uploadedAt: new Date().toISOString(), dryRun: dry };
const baseStatus = { privacyStatus: privacy, selfDeclaredMadeForKids: false, containsSyntheticMedia: true, license: "youtube", embeddable: true, publicStatsViewable: true };

// Journal de publication : écrit dès que le long est en ligne, complété après le Short (reprise sans doublon).
const logFile = path.join(DIRS.data, "published.json");
function record() {
  if (dry) return;
  const published = exists(logFile) ? readJson(logFile) : [];
  const entry = { episodeId, title: meta.long.title, long: result.long, short: result.short ?? null, uploadedAt: result.uploadedAt };
  const i = published.findIndex((e) => e.episodeId === episodeId);
  if (i >= 0) published[i] = { ...published[i], ...entry, short: entry.short ?? published[i].short ?? null };
  else published.push(entry);
  writeJson(logFile, published);
}

// Long (--skip-long --long-url <url> : le long est déjà en ligne, on n'envoie que le Short)
const skipLong = Boolean(args["skip-long"]);
if (skipLong) {
  if (!args["long-url"]) throw new Error("--skip-long demande --long-url");
  result.long = { videoId: String(args["long-url"]).split("/").pop(), publishAt: publishAt?.toISOString() ?? null, url: String(args["long-url"]) };
}
const longFile = path.join(DIRS.root, meta.long.file);
const longSnippet = {
  title: meta.long.title,
  description: meta.long.description,
  tags: meta.long.tags,
  categoryId: "26", // Howto & Style
  defaultLanguage: "en",
  defaultAudioLanguage: "en",
};
const longVideo = skipLong ? { id: result.long.videoId } : await uploadVideo(longFile, longSnippet, { ...baseStatus, ...(publishAt ? { publishAt: publishAt.toISOString() } : {}) }, meta.long.localizations);
if (!skipLong) {
  result.long = { videoId: longVideo.id, publishAt: publishAt?.toISOString() ?? null, url: `https://youtu.be/${longVideo.id}` };
  log.info(`✔ long → ${result.long.url}`);
  record();
}

const thumb = skipLong ? null : [path.join(DIRS.root, meta.long.thumbnail), path.join(DIRS.root, meta.long.thumbnail).replace(/\.png$/, ".jpg")].find((f) => exists(f) && fs.statSync(f).size <= 2 * 1024 * 1024);
if (thumb) {
  try {
    await setThumbnail(longVideo.id, thumb);
    result.thumbnail = true;
    log.info("✔ miniature");
  } catch (e) {
    result.thumbnail = false;
    log.warn(`thumbnails.set : ${e.message}`);
  }
} else if (!skipLong) log.warn("Miniature absente ou > 2 Mo : ignorée");

const srt = path.join(DIRS.root, meta.long.srt);
if (!skipLong && exists(srt)) {
  try {
    await insertCaption(longVideo.id, srt);
    log.info("✔ sous-titres EN (captions.insert)");
  } catch (e) {
    log.warn(`captions.insert : ${e.message}`);
  }
}

if (!skipLong && meta.playlistId) {
  try {
    await addToPlaylist(meta.playlistId, longVideo.id);
    log.info(`✔ playlist ${meta.playlistId}`);
  } catch (e) {
    log.warn(`playlistItems.insert : ${e.message}`);
  }
}

// Short (vidéo séparée ; YouTube le classe en Short via le format 9:16 ≤ 3 min)
if (!args["skip-short"]) {
  const shortFile = path.join(DIRS.root, meta.short.file);
  const shortSnippet = {
    title: meta.short.title,
    description: `${meta.short.description}\n\nFull video: ${result.long.url}`,
    tags: [...meta.short.tags, "shorts"],
    categoryId: "26",
    defaultLanguage: "en",
    defaultAudioLanguage: "en",
  };
  const shortVideo = await uploadVideo(shortFile, shortSnippet, { ...baseStatus, ...(shortPublishAt ? { publishAt: shortPublishAt.toISOString() } : {}) }, null);
  result.short = { videoId: shortVideo.id, publishAt: shortPublishAt?.toISOString() ?? null, url: `https://youtube.com/shorts/${shortVideo.id}` };
  log.info(`✔ short → ${result.short.url}`);
}

writeJson(path.join(buildDir, "upload.json"), result);
record();
log.info("Upload terminé.");
