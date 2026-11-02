// Squelette du fournisseur d'images génératives Gemini (à brancher plus tard).
// Interface commune à tous les fournisseurs d'images :
//   provider.generate({ prompt, query, aspect: "16:9", dest }) → { kind: "photo", file, width, height, credit? } | null
//
// Référence API (Gemini 2.5 Flash Image / "nano banana") :
//   POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key=GEMINI_API_KEY
//   body : { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: "16:9" } } }
//   réponse : candidates[0].content.parts[].inlineData.{ mimeType, data(base64) }
//
// NB (décision du 25/10/2026) : les visuels importants passent par Gemini via le navigateur avec
// l'abonnement perso, pas par l'API payante ; ce fichier reste donc un squelette tant que ce choix tient.
import fs from "node:fs";

export const name = "gemini";
export const DEFAULT_MODEL = "gemini-2.5-flash-image";

export function isConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}

export async function generate({ prompt, aspect = "16:9", dest, model = process.env.GEMINI_IMAGE_MODEL ?? DEFAULT_MODEL }) {
  if (!isConfigured()) throw new Error("GEMINI_API_KEY absent : fournisseur gemini non configuré");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const body = {
    contents: [{ parts: [{ text: `${prompt}\nPhotorealistic, no text, no letters, no watermark.` }] }],
    generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: aspect } },
  };
  const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`Gemini ${res.status} : ${(await res.text()).slice(0, 400)}`);
  const json = await res.json();
  const part = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!part) return null;
  fs.writeFileSync(dest, Buffer.from(part.inlineData.data, "base64"));
  return { kind: "photo", file: dest, mimeType: part.inlineData.mimeType, credit: null, provider: name };
}
