import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import * as pixabay from "../scripts/providers/pixabay.mjs";
import { creditsLine } from "../scripts/lib/credits.mjs";

const photos = JSON.parse(fs.readFileSync(new URL("./fixtures/pixabay-photos.json", import.meta.url)));
const videos = JSON.parse(fs.readFileSync(new URL("./fixtures/pixabay-videos.json", import.meta.url)));

test("URL photo : paramètres imposés", () => {
  const u = new URL(pixabay.buildPhotoUrl("cast iron skillet", { apiKey: "K" }));
  assert.equal(u.origin + u.pathname, "https://pixabay.com/api/");
  const p = u.searchParams;
  assert.equal(p.get("q"), "cast iron skillet");
  for (const [k, v] of Object.entries({ key: "K", image_type: "photo", orientation: "horizontal", min_width: "1920", safesearch: "true", order: "popular", per_page: "10" })) assert.equal(p.get(k), v, k);
});

test("URL vidéo : endpoint /api/videos/", () => {
  assert.ok(pixabay.buildVideoUrl("sizzle", { apiKey: "K" }).startsWith("https://pixabay.com/api/videos/?"));
});

test("parsePhotos : choisit la photo large 16:9 avec fullHDURL", () => {
  const p = pixabay.parsePhotos(photos);
  assert.equal(p.id, 222);
  assert.equal(p.downloadUrl, "https://pixabay.com/get/pan_1920.jpg");
  assert.equal(p.width, 1920);
  assert.equal(p.photographer, "cook-man");
  assert.equal(p.pageUrl, "https://pixabay.com/photos/pan-kitchen-222/");
});

test("parsePhotos : exclusion des ids déjà utilisés, repli sur largeImageURL", () => {
  const p = pixabay.parsePhotos(photos, { exclude: new Set([222]) });
  assert.equal(p.id, 333);
  assert.equal(p.downloadUrl, "https://pixabay.com/get/small_1280.jpg");
  assert.equal(pixabay.parsePhotos({ hits: [] }), null);
});

test("parseVideos : ignore > 30 s, prend medium ≥ 1920 quand large est vide", () => {
  const v = pixabay.parseVideos(videos);
  assert.equal(v.id, 901);
  assert.equal(v.downloadUrl, "https://cdn.pixabay.com/m.mp4");
  assert.equal(v.width, 1920);
});

test("searchPhoto avec fetch simulé, clé masquée dans les erreurs", async () => {
  const ok = async () => ({ ok: true, json: async () => photos });
  assert.equal((await pixabay.searchPhoto("x", { apiKey: "K", fetchImpl: ok })).id, 222);
  const ko = async () => ({ ok: false, status: 429, text: async () => "rate limit key=SECRET" });
  await assert.rejects(() => pixabay.searchPhoto("x", { apiKey: "SECRET", fetchImpl: ko }), (e) => /429/.test(e.message) && !e.message.includes("SECRET"));
});

test("crédits : « Images: Pixabay » + auteurs", () => {
  const p = pixabay.parsePhotos(photos);
  const line = creditsLine([{ source: "pixabay", photographer: p.photographer, pageUrl: p.pageUrl }, { source: "pixabay", photographer: "chef", pageUrl: "u2" }]);
  assert.match(line, /^Images: Pixabay — cook-man, chef/);
  assert.equal(creditsLine([]), "");
});
