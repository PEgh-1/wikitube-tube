// Ligne de crédits ajoutée à la description YouTube.
const LABELS = { pixabay: "Pixabay", pexels: "Pexels" };

// items : entrées du manifeste images (source, photographer, pageUrl). Mock/placeholder ignorés.
export function creditsLine(items) {
  const bySource = new Map();
  for (const it of items) {
    if (!it?.source || !LABELS[it.source]) continue;
    if (!bySource.has(it.source)) bySource.set(it.source, new Set());
    if (it.photographer) bySource.get(it.source).add(it.photographer);
  }
  if (!bySource.size) return "";
  const parts = [...bySource].map(([s, authors]) => `${LABELS[s]}${authors.size ? ` — ${[...authors].join(", ")}` : ""}`);
  return `Images: ${parts.join(" · ")}`;
}
