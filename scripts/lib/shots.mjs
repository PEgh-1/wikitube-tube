import { iconFor } from "./motion.mjs";
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


const NUM = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, fifteen: 15, twenty: 20, thirty: 30 };

/**
 * Illustration animée générée dans Remotion quand aucune photo ne colle vraiment à la phrase :
 * légende courte (la consigne), 1 à 3 pictogrammes, minuteur si une durée est dite.
 */
export function illustrate(text) {
  const clean = text.replace(/^step\s+\w+\.\s*/i, "").trim();
  const first = splitSentences(clean)[0] ?? clean;
  // Légende : la proposition la plus « consigne » du plan (impératif, 3 à 9 mots).
  const NOT_IMPERATIVE = new Set("if when for the a an you your it it's its this that these warm most once while as and but so because there here what which salt cast iron oil heat water".split(" "));
  const clauses = splitSentences(clean)
    .flatMap((x) => x.split(/[,;:—–]| - /))
    .map((c) => c.trim().replace(/^(and|but|so|then)\s+/i, "").replace(/[.!?]+$/, ""))
    .filter(Boolean);
  const score = (c) => {
    const ws = c.split(/\s+/);
    let sc = 0;
    if (!NOT_IMPERATIVE.has(ws[0].toLowerCase()) && !/^(you|we|i|they|there|which|where|in|on)'?/i.test(ws[0])) sc += 4;
    if (ws.length >= 3 && ws.length <= 9) sc += 2;
    else if (ws.length <= 13) sc += 1;
    else sc -= 2;
    if (iconFor(c)) sc += 1;
    return sc;
  };
  let caption = clauses.length ? clauses.reduce((best, c) => (score(c) > score(best) ? c : best), clauses[0]) : first;
  const words = caption.split(/\s+/);
  if (words.length > 12) caption = words.slice(0, 11).join(" ") + "…";
  caption = caption.charAt(0).toUpperCase() + caption.slice(1);
  const icons = [];
  for (const w of clean.toLowerCase().split(/[^a-z']+/)) {
    const ic = iconFor(w);
    if (ic && !icons.includes(ic)) icons.push(ic);
    if (icons.length >= 3) break;
  }
  if (!icons.length) icons.push("bulb");
  const m = clean.toLowerCase().match(/\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|fifteen|twenty|thirty)\s+(seconds?|minutes?|hours?)\b/);
  const timer = m ? { value: Number(m[1]) || NUM[m[1]] || 1, unit: m[2].replace(/s$/, "") } : null;
  const negative = /\b(never|don't|do not|avoid|no\b|not\b)/i.test(first);
  return { caption, icons, timer, negative };
}
