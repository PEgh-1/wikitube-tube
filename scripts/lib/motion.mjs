// Données d'animation calculées à partir de la narration : mots-clés synchronisés sur la voix
// et pictogramme d'étape. Consommé par timeline.mjs → props Remotion.
const STOP = new Set(
  ("a an the and or but of to in on at for with without from by into onto your you it its it's is are was were be been being this that these those " +
    "how what which who while still up down out off over under very just then them they their there here use using after before when one two three four five six seven " +
    "step first second next now also so if can will would should could may might much many more most some any every each all about than too only even really " +
    "because like get gets got make makes made do does did doing don't doesn't won't can't let lets right good great thing things way ways time times bit little " +
    "keep take takes put puts going go goes want need needs back again sure yet well around " +
    "anything something everything nothing between actually almost already always usually probably simply enough another other others whole rather instead though through during turns becomes means biggest releases cooking").split(/\s+/),
);

const norm = (w) => String(w).toLowerCase().replace(/[^a-z0-9'-]/g, "").replace(/^'+|'+$/g, "");
const clean = (w) => String(w).replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9%°]+$/g, "");

/**
 * Sélectionne les mots-clés à animer pendant une étape.
 * @param words mots [{w,s,e}] relatifs au segment
 * @param offset décalage (s) du segment dans la scène
 * @param hints texte prioritaire (titre + astuce)
 */
export function pickKeywords(words, offset, hints, { minGap = 2.6, max = 7, startAfter = 1.2 } = {}) {
  if (!words?.length) return [];
  const hint = new Set(hints.flatMap((h) => String(h).split(/\s+/)).map(norm).filter((t) => t && !STOP.has(t)));
  const cands = [];
  for (let i = 0; i < words.length; i++) {
    const w = norm(words[i].w);
    if (!w || STOP.has(w) || /^\d+$/.test(w) && w.length < 2) continue;
    if (words[i].s < startAfter) continue; // « Step two. » d'ouverture
    let score = 0;
    if (hint.has(w)) score += 3;
    if (w.length >= 7) score += 1.5;
    else if (w.length >= 5) score += 0.8;
    else score -= 1;
    if (/\d/.test(w) || /minute|second|hour|degree|°/.test(w)) score += 1.5;
    if (score < 1.5) continue;
    // Groupe nominal de 2 mots (« coarse salt », « thin coat ») si le mot suivant est aussi fort et enchaîné.
    let text = clean(words[i].w);
    let e = words[i].e;
    const nx = words[i + 1];
    if (nx && !/[.,;:!?]$/.test(words[i].w) && nx.s - words[i].e < 0.35) {
      const n2 = norm(nx.w);
      if (n2 && !STOP.has(n2) && hint.has(n2)) {
        text = `${text} ${clean(nx.w)}`;
        e = nx.e;
        score += 1;
      }
    }
    cands.push({ text, at: offset + words[i].s, end: offset + e, score });
  }
  // Glouton par score, puis espacement minimal dans le temps.
  const chosen = [];
  for (const c of [...cands].sort((a, b) => b.score - a.score)) {
    if (chosen.length >= max) break;
    if (chosen.some((k) => Math.abs(k.at - c.at) < minGap)) continue;
    if (chosen.some((k) => k.text.toLowerCase() === c.text.toLowerCase())) continue;
    chosen.push(c);
  }
  return chosen
    .sort((a, b) => a.at - b.at)
    .map((k) => ({ text: k.text, at: round(k.at), end: round(k.end), icon: iconFor(k.text) }));
}

const round = (n) => Math.round(n * 100) / 100;

// Pictogrammes disponibles côté Remotion (src/components/icons.tsx).
const ICONS = [
  ["drop", /\b(water|rinse|rinsing|wash|washing|wet|soak|sink|tap|liquid|rain|spray|pour)/],
  ["flame", /\b(heat|hot|warm|stove|burner|boil|boiling|simmer|oven|fire|flame|smoke|smoking|cook|bake|temperature)/],
  ["clock", /\b(minute|minutes|second|seconds|hour|hours|time|wait|timer|daily|weekly|overnight|until)/],
  ["oil", /\b(oil|oiling|grease|butter|lubric|wax)/],
  ["sparkle", /\b(scrub|scrubbing|clean|polish|shine|shiny|wipe|salt|brush|scour|dust)/],
  ["towel", /\b(towel|dry|drying|cloth|rag|paper)/],
  ["shield", /\b(protect|rust|seasoning|safe|safety|prevent|coat|layer|guard)/],
  ["cross", /\b(never|don't|avoid|mistake|wrong|stop|ruin|crack|damage)/],
  ["box", /\b(store|storage|cupboard|shelf|hang|hanging|drawer|pack)/],
  ["screen", /\b(click|settings|menu|app|phone|computer|screen|windows|tap on|select|button|drive|file|folder|browser)/],
  ["leaf", /\b(garden|plant|plants|soil|leaf|leaves|seed|grass|lawn|compost|mulch|tree)/],
  ["wrench", /\b(fix|repair|tool|screw|bolt|tighten|install|replace)/],
  ["check", /\b(done|ready|check|works|working|perfect|finished)/],
];

export function iconFor(text) {
  const t = String(text).toLowerCase();
  for (const [name, re] of ICONS) if (re.test(t)) return name;
  return null;
}

/** Pictogramme principal d'une étape : celui qui revient le plus dans titre (×3) + astuce (×2) + narration. */
export function stepIcon(step) {
  const score = new Map();
  const add = (text, weight) => {
    for (const w of String(text ?? "").toLowerCase().split(/[^a-z']+/)) {
      const ic = iconFor(w);
      if (ic) score.set(ic, (score.get(ic) ?? 0) + weight);
    }
  };
  add(step.title, 3);
  add(step.tip, 2);
  add(step.narration, 1);
  const best = [...score.entries()].sort((a, b) => b[1] - a[1])[0];
  return best ? best[0] : "bulb";
}
