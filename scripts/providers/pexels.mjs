// Fournisseur d'images/vidéos Pexels. https://www.pexels.com/api/documentation/
const API = "https://api.pexels.com";

export async function searchPhoto(query, { apiKey, minWidth = 1920, orientation = "landscape", perPage = 15, exclude = new Set() }) {
  const url = `${API}/v1/search?query=${encodeURIComponent(query)}&orientation=${orientation}&size=large&per_page=${perPage}`;
  const res = await fetch(url, { headers: { Authorization: apiKey } });
  if (!res.ok) throw new Error(`Pexels ${res.status} : ${(await res.text()).slice(0, 300)}`);
  const json = await res.json();
  const photos = (json.photos ?? []).filter((p) => p.width >= minWidth && !exclude.has(p.id));
  // Préférer les photos bien horizontales (ratio 1.3–2) pour le Ken Burns.
  photos.sort((a, b) => score(b) - score(a));
  const p = photos[0];
  if (!p) return null;
  return {
    id: p.id,
    kind: "photo",
    url: p.src.original, // téléchargé ensuite redimensionné via paramètres
    downloadUrl: `${p.src.original}?auto=compress&cs=tinysrgb&w=2400`,
    width: p.width,
    height: p.height,
    photographer: p.photographer,
    photographerUrl: p.photographer_url,
    pageUrl: p.url,
    avgColor: p.avg_color,
  };
  function score(p) {
    const r = p.width / p.height;
    return (r >= 1.3 && r <= 2 ? 10 : 0) + Math.min(p.width / 1000, 6);
  }
}

export async function searchVideo(query, { apiKey, minWidth = 1920, orientation = "landscape", perPage = 10, maxDuration = 30 }) {
  const url = `${API}/videos/search?query=${encodeURIComponent(query)}&orientation=${orientation}&size=large&per_page=${perPage}`;
  const res = await fetch(url, { headers: { Authorization: apiKey } });
  if (!res.ok) throw new Error(`Pexels videos ${res.status} : ${(await res.text()).slice(0, 300)}`);
  const json = await res.json();
  for (const v of json.videos ?? []) {
    if (v.duration > maxDuration) continue;
    const files = (v.video_files ?? []).filter((f) => f.width >= minWidth && f.file_type === "video/mp4").sort((a, b) => a.width - b.width);
    if (files[0]) {
      return { id: v.id, kind: "video", downloadUrl: files[0].link, width: files[0].width, height: files[0].height, duration: v.duration, photographer: v.user?.name, pageUrl: v.url };
    }
  }
  return null;
}

export async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Téléchargement ${res.status} : ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const fs = await import("node:fs");
  fs.writeFileSync(dest, buf);
  return buf.length;
}
