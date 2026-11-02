// Fournisseur TTS ElevenLabs — endpoint with-timestamps (timestamps caractère → mot).
const API = "https://api.elevenlabs.io/v1";

export const DEFAULT_MODEL = "eleven_flash_v2_5";

/**
 * Synthétise un texte et renvoie { audio: Buffer(mp3), words: [{ w, s, e }] }.
 * @see https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps
 */
export async function synthesize(text, { apiKey, voiceId, modelId = DEFAULT_MODEL, outputFormat = "mp3_44100_128", voiceSettings, retries = 3 }) {
  const url = `${API}/text-to-speech/${encodeURIComponent(voiceId)}/with-timestamps?output_format=${outputFormat}`;
  const body = {
    text,
    model_id: modelId,
    voice_settings: voiceSettings ?? { stability: 0.5, similarity_boost: 0.75, style: 0.2, use_speaker_boost: true, speed: 1.0 },
    apply_text_normalization: "auto",
  };
  let lastErr;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "xi-api-key": apiKey, "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 429 || res.status >= 500) {
        const wait = 2000 * attempt;
        lastErr = new Error(`ElevenLabs ${res.status} : ${(await res.text()).slice(0, 300)}`);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      if (!res.ok) throw new Error(`ElevenLabs ${res.status} : ${(await res.text()).slice(0, 500)}`);
      const json = await res.json();
      const audio = Buffer.from(json.audio_base64, "base64");
      const words = charsToWords(json.alignment ?? json.normalized_alignment);
      return { audio, words, raw: { alignment: json.alignment } };
    } catch (e) {
      lastErr = e;
      if (attempt === retries) break;
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
  throw lastErr;
}

/** Regroupe l'alignement caractère par caractère d'ElevenLabs en mots. */
export function charsToWords(alignment) {
  if (!alignment) return [];
  const { characters, character_start_times_seconds: starts, character_end_times_seconds: ends } = alignment;
  const words = [];
  let cur = null;
  characters.forEach((ch, i) => {
    if (/\s/.test(ch)) {
      if (cur) words.push(cur), (cur = null);
      return;
    }
    if (!cur) cur = { w: ch, s: starts[i], e: ends[i] };
    else (cur.w += ch), (cur.e = ends[i]);
  });
  if (cur) words.push(cur);
  return words.map((w) => ({ w: w.w, s: round3(w.s), e: round3(w.e) }));
}

const round3 = (n) => Math.round(n * 1000) / 1000;

/** Solde de crédits (pour les logs de la tâche quotidienne). */
export async function getSubscription(apiKey) {
  const res = await fetch(`${API}/user/subscription`, { headers: { "xi-api-key": apiKey } });
  if (!res.ok) return null;
  const j = await res.json();
  return { used: j.character_count, limit: j.character_limit, resetUnix: j.next_character_count_reset_unix };
}
