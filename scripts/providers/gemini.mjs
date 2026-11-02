// Fournisseur d'images génératives Google (clé GEMINI_API_KEY, Google AI Studio, facturation activée).
//   provider.generate({ prompt, aspect: "16:9", dest }) → { kind: "photo", file, provider, model } | null
// Modèles :
//   imagen-4.0-fast-generate-001 (défaut, ≈ 0,02 $/image)  → POST …/models/{model}:predict
//   gemini-2.5-flash-image       (≈ 0,039 $/image)         → POST …/models/{model}:generateContent
// Décision du 01/11/2026 : images par étape via l'API (≈ 12 €/mois visés) — le choix navigateur du
// 25/10/2026 concerne les illustrations des sites, pas ce pipeline automatisé.
import fs from "node:fs";

export const name = "gemini";
export const DEFAULT_MODEL = "imagen-4.0-fast-generate-001";
const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export function isConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function post(url, body) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
      body: JSON.stringify(body),
    });
    if (res.ok) return res.json();
    const txt = (await res.text()).slice(0, 400);
    if ((res.status === 429 || res.status >= 500) && attempt < 4) {
      await sleep(4000 * attempt);
      continue;
    }
    throw new Error(`Gemini ${res.status} : ${txt}`);
  }
}

export async function generate({ prompt, aspect = "16:9", dest, model = process.env.GEMINI_IMAGE_MODEL || DEFAULT_MODEL }) {
  if (!isConfigured()) throw new Error("GEMINI_API_KEY absent : fournisseur gemini non configuré");
  let b64 = null;
  if (model.startsWith("imagen")) {
    const json = await post(`${BASE}/${model}:predict`, {
      instances: [{ prompt }],
      parameters: { sampleCount: 1, aspectRatio: aspect, personGeneration: "allow_adult" },
    });
    b64 = json.predictions?.[0]?.bytesBase64Encoded ?? null;
  } else {
    const json = await post(`${BASE}/${model}:generateContent`, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: aspect } },
    });
    b64 = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData?.data ?? null;
  }
  if (!b64) return null;
  fs.writeFileSync(dest, Buffer.from(b64, "base64"));
  return { kind: "photo", file: dest, credit: null, provider: name, model };
}
