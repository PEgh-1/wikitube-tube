// Découpage de la narration d'une étape en « plans » synchronisés sur la voix :
// chaque plan couvre 1 à 3 phrases et reçoit une image générée qui montre ce que dit la voix.
export function splitSentences(text) {
  const out = [];
  const re = /[^.!?]+[.!?]+["')\]]*|[^.!?]+$/g;
  let m;
  while ((m = re.exec(text))) {
    const s = m[0].trim();
    if (s) out.push(s);
  }
  return out;
}

const wc = (s) => s.split(/\s+/).filter(Boolean).length;

/**
 * Regroupe les phrases en au plus `maxShots` plans d'au moins `minWords` mots.
 * L'annonce « Step two. » est rattachée au plan suivant.
 * @returns [{ text, wordStart }] — wordStart = index du premier mot du plan dans la narration
 */
export function groupShots(narration, { maxShots = 3, minWords = 12 } = {}) {
  const sentences = splitSentences(narration);
  // Fusion gloutonne : on accumule jusqu'à minWords, puis on ferme le plan.
  let groups = [];
  let cur = [];
  for (const s of sentences) {
    cur.push(s);
    if (wc(cur.join(" ")) >= minWords) {
      groups.push(cur);
      cur = [];
    }
  }
  if (cur.length) {
    if (groups.length && wc(cur.join(" ")) < minWords) groups[groups.length - 1].push(...cur);
    else groups.push(cur);
  }
  // Trop de plans : on fusionne les deux voisins les plus courts.
  while (groups.length > maxShots) {
    let best = 0;
    let bestLen = Infinity;
    for (let i = 0; i < groups.length - 1; i++) {
      const l = wc(groups[i].join(" ")) + wc(groups[i + 1].join(" "));
      if (l < bestLen) {
        bestLen = l;
        best = i;
      }
    }
    groups.splice(best, 2, [...groups[best], ...groups[best + 1]]);
  }
  let idx = 0;
  return groups.map((g) => {
    const text = g.join(" ");
    const r = { text, wordStart: idx };
    idx += wc(text);
    return r;
  });
}

/** Prompt d'image pour un plan : sujet de l'épisode + ce que dit la voix + style maison. */
export function shotPrompt({ subject, stepTitle, text, stylePrompt }) {
  const action = text.replace(/^step\s+\w+\.\s*/i, "");
  return [
    `Photorealistic close-up photograph for a how-to video about ${subject}.`,
    `Step: "${stepTitle}".`,
    `The image must clearly show exactly this action or situation: "${action}"`,
    stylePrompt ? `Visual style reference: ${stylePrompt}` : "",
    "Real hands when an action is performed, realistic everyday setting that matches the topic, natural soft light, warm cream tones, shallow depth of field, 16:9 framing.",
    "No text, no letters, no captions, no logos, no watermark.",
  ]
    .filter(Boolean)
    .join(" ");
}
