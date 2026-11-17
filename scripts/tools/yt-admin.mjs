#!/usr/bin/env node
// Réglages de chaîne par l'API YouTube : playlists (création + rangement) et titres traduits.
// Lit publish/admin.json ; idempotent (ne recrée ni ne réinsère ce qui existe). Écrit publish/admin-result.json.
import path from "node:path";
import { DIRS, readJson, writeJson, requireEnv, log } from "../lib/common.mjs";
const cfg = readJson(path.join(DIRS.root, "publish", "admin.json"));
const YT = "https://www.googleapis.com/youtube/v3";
let token = null;
async function accessToken() {
  const body = new URLSearchParams({ client_id: requireEnv("YT_CLIENT_ID"), client_secret: requireEnv("YT_CLIENT_SECRET"), refresh_token: requireEnv("YT_REFRESH_TOKEN"), grant_type: "refresh_token" });
  const res = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body });
  if (!res.ok) throw new Error(`OAuth ${res.status} : ${(await res.text()).slice(0, 300)}`);
  return (await res.json()).access_token;
}
async function api(method, url, json, attempt = 1) {
  token ??= await accessToken();
  const res = await fetch(url, { method, headers: { authorization: `Bearer ${token}`, ...(json ? { "content-type": "application/json" } : {}) }, body: json ? JSON.stringify(json) : undefined });
  if ((res.status === 409 || res.status >= 500) && attempt < 5) {
    await new Promise((r) => setTimeout(r, 6000 * attempt));
    return api(method, url, json, attempt + 1);
  }
  if (!res.ok) throw new Error(`${method} ${url.slice(0, 90)} → ${res.status} : ${(await res.text()).slice(0, 400)}`);
  const t = await res.text();
  return t ? JSON.parse(t) : {};
}
const result = { at: new Date().toISOString(), playlists: [], localizations: [], errors: [] };
try {
  // Playlists
  const mine = (await api("GET", `${YT}/playlists?part=snippet&mine=true&maxResults=50`)).items ?? [];
  for (const pl of cfg.playlists ?? []) {
    let id = mine.find((p) => p.snippet.title === pl.title)?.id;
    if (!id) {
      id = (await api("POST", `${YT}/playlists?part=snippet,status`, { snippet: { title: pl.title, description: pl.description, defaultLanguage: "en" }, status: { privacyStatus: "public" } })).id;
      log.info(`✔ playlist créée : ${pl.title}`);
      await new Promise((r) => setTimeout(r, 8000));
    }
    const have = ((await api("GET", `${YT}/playlistItems?part=contentDetails&playlistId=${id}&maxResults=50`).catch(() => ({ items: [] }))).items ?? []).map((i) => i.contentDetails.videoId);
    const added = [];
    for (const v of pl.videos) {
      if (have.includes(v)) continue;
      await api("POST", `${YT}/playlistItems?part=snippet`, { snippet: { playlistId: id, resourceId: { kind: "youtube#video", videoId: v } } });
      added.push(v);
    }
    result.playlists.push({ title: pl.title, id, added, already: have });
  }
  // Titres traduits
  for (const [videoId, titles] of Object.entries(cfg.localizations ?? {})) {
    const v = (await api("GET", `${YT}/videos?part=localizations&id=${videoId}`)).items?.[0];
    if (!v) { result.errors.push(`vidéo introuvable : ${videoId}`); continue; }
    const loc = v.localizations ?? {};
    let changed = 0;
    for (const [l, title] of Object.entries(titles)) {
      if (loc[l]?.title === title) continue;
      loc[l] = { ...(loc[l] ?? { description: "" }), title };
      changed++;
    }
    if (changed) await api("PUT", `${YT}/videos?part=localizations`, { id: videoId, localizations: loc });
    result.localizations.push({ videoId, changed, locales: Object.keys(loc) });
    log.info(`✔ ${videoId} : ${changed} titre(s) traduit(s) mis à jour`);
  }
} catch (e) {
  result.errors.push(String(e.message));
  log.warn(e.message);
}
writeJson(path.join(DIRS.root, "publish", "admin-result.json"), result);
process.exit(result.errors.length ? 1 : 0);
