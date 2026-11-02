// Fournisseur d'images/vidéos Pixabay. https://pixabay.com/api/docs/
// Règles d'usage : pas de hotlink (les fichiers sont téléchargés et mis en cache dans public/assets/),
// 100 requêtes / 60 s par clé, crédit « Images: Pixabay » + auteur ajouté à la description (render.mjs).
const API = "https://pixabay.com/api/";
const API_VIDEOS = "https://pixabay.com/api/videos/";

export const name = "pixabay";

export function isConfigured() {
  return Boolean(process.env.PIXABAY_API_KEY);
}

export function buildPhotoUrl(query, { apiKey, minWidth = 1920, perPage = 10 }) {
  const p = new URLSearchParams({
    key: apiKey,
    q: query,
    image_type: "photo",
    orientation: "horizontal",
    min_width: String(minWidth),
    safesearch: "true",
    order: "popular",
    per_page: String(perPage),
  });
  return `${API}?${p}`;
}

export function buildVideoUrl(query, { apiKey, minWidth = 1920, perPage = 10 }) {
  const p = new URLSearchParams({
    key: apiKey,
    q: query,
    video_type: "film",
    min_width: String(minWidth),
    safesearch: "true",
    order: "popular",
    per_page: String(perPage),
  });
  return `${API_VIDEOS}?${p}`;
}

// Parsing pur (testable sans réseau) d'une réponse /api/.
// fullHDURL (1920) et imageURL (original) n'existent qu'avec l'accès API complet ; sinon largeImageURL (1280).
export function parsePhotos(json, { minWidth = 1920, exclude = new Set() } = {}) {
  const hits = (json?.hits ?? []).filter((h) => !exclude.has(h.id));
  const scored = hits.map((h) => {
    const full = h.imageURL || h.fullHDURL || null;
    const downloadUrl = full || h.largeImageURL;
    const width = h.imageURL ? h.imageWidth : h.fullHDURL ? Math.min(h.imageWidth, 1920) : Math.min(h.imageWidth, 1280);
    const ratio = h.imageWidth / h.imageHeight;
    return { h, downloadUrl, width, ratio, wide: h.imageWidth >= minWidth };
  }).filter((x) => x.downloadUrl);
  // Priorité : source assez large, ratio proche du 16:9 (1.3–2), puis ordre de popularité de l'API.
  scored.sort((a, b) => Number(b.wide) - Number(a.wide) || Number(inRange(b.ratio)) - Number(inRange(a.ratio)));
  const best = scored[0];
  if (!best) return null;
  const { h } = best;
  return {
    id: h.id,
    kind: "photo",
    downloadUrl: best.downloadUrl,
    width: best.width,
    height: Math.round(best.width / best.ratio),
    photographer: h.user,
    photographerUrl: h.user_id ? `https://pixabay.com/users/${h.user}-${h.user_id}/` : null,
    pageUrl: h.pageURL,
  };
  function inRange(r) {
    return r >= 1.3 && r <= 2;
  }
}

// Parsing pur d'une réponse /api/videos/ : variante large puis medium si ≥ minWidth, sinon la plus grande dispo.
export function parseVideos(json, { minWidth = 1920, maxDuration = 30 } = {}) {
  let fallback = null;
  for (const v of json?.hits ?? []) {
    if (v.duration > maxDuration) continue;
    const variants = ["large", "medium", "small", "tiny"].map((k) => v.videos?.[k]).filter((f) => f?.url);
    const ok = variants.filter((f) => f.width >= minWidth).sort((a, b) => a.width - b.width)[0];
    const make = (f) => ({ id: v.id, kind: "video", downloadUrl: f.url, width: f.width, height: f.height, duration: v.duration, photographer: v.user, photographerUrl: v.user_id ? `https://pixabay.com/users/${v.user}-${v.user_id}/` : null, pageUrl: v.pageURL });
    if (ok) return make(ok);
    const biggest = variants.sort((a, b) => b.width - a.width)[0];
    if (biggest && !fallback && biggest.width >= 1280) fallback = make(biggest);
  }
  return fallback;
}

async function getJson(url, fetchImpl) {
  const res = await fetchImpl(url);
  if (!res.ok) throw new Error(`Pixabay ${res.status} : ${(await res.text()).slice(0, 300)}`.replace(/key=[^&\s]+/g, "key=***"));
  return res.json();
}

export async function searchPhoto(query, { apiKey, minWidth = 1920, perPage = 10, exclude = new Set(), fetchImpl = fetch } = {}) {
  const json = await getJson(buildPhotoUrl(query, { apiKey, minWidth, perPage }), fetchImpl);
  return parsePhotos(json, { minWidth, exclude });
}

export async function searchVideo(query, { apiKey, minWidth = 1920, perPage = 10, maxDuration = 30, fetchImpl = fetch } = {}) {
  const json = await getJson(buildVideoUrl(query, { apiKey, minWidth, perPage }), fetchImpl);
  return parseVideos(json, { minWidth, maxDuration });
}

// Téléchargement local (pas de hotlink).
export async function download(url, dest, fetchImpl = fetch) {
  const res = await fetchImpl(url, { headers: { "user-agent": "wikitube-pipeline/0.1" } });
  if (!res.ok) throw new Error(`Téléchargement ${res.status} : ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const fs = await import("node:fs");
  fs.writeFileSync(dest, buf);
  return buf.length;
}
