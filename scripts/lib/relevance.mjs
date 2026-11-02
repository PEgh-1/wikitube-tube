// Pertinence des visuels de stock : classement des candidats Pixabay par recouvrement
// entre leurs tags et la requête, avec un « sujet » d'épisode obligatoire (ex. cast iron skillet)
// pour éviter les hors-sujet (théière en fonte, huiles de massage…).
export const STOP = new Set(
  "a an the and or of to in on at for with without from by into onto your you it its is are be this that these those how what while still up down out off over under very just then them their there here use using after before when".split(" "),
);
// Mots d'action trop génériques pour départager des photos.
const WEAK = new Set("clean cleaning wash washing make making do doing get getting set setting step steps way ways prepare preparing keep keeping".split(" "));

const SYN = {
  skillet: ["skillet", "pan", "frying", "cast-iron", "castiron"],
  pan: ["pan", "skillet", "frying"],
  oil: ["oil", "oiling", "olive", "seasoning"],
  oiling: ["oil", "oiling"],
  stove: ["stove", "gas", "burner", "hob", "cooker", "flame", "stovetop"],
  rinsing: ["rinse", "rinsing", "water", "sink", "tap", "faucet"],
  rinse: ["rinse", "rinsing", "water", "sink", "tap"],
  sink: ["sink", "tap", "faucet", "water"],
  boiling: ["boil", "boiling", "water", "steam", "simmer"],
  drying: ["dry", "drying", "towel", "heat"],
  hanging: ["hanging", "hang", "wall", "rack", "hook"],
  smoking: ["smoke", "smoking", "heat", "hot", "flame"],
  scrubbing: ["scrub", "scrubbing", "brush", "salt"],
  computer: ["computer", "laptop", "pc", "desktop", "screen"],
  garden: ["garden", "gardening", "plants", "soil", "yard"],
};

export function tokens(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s,]+/)
    .filter((t) => t && !STOP.has(t));
}

const stem = (t) => t.replace(/(ing|ed|es|s)$/, "");

function expand(t) {
  return new Set([t, stem(t), ...(SYN[t] ?? []), ...(SYN[stem(t)] ?? [])].map(stem));
}

/** Sujet d'épisode : mots présents dans au moins 60 % des requêtes d'étapes (ou ceux de la requête héros). */
export function subjectTokens(heroQuery, stepQueries) {
  const counts = new Map();
  for (const q of stepQueries) for (const t of new Set(tokens(q))) counts.set(t, (counts.get(t) ?? 0) + 1);
  const n = Math.max(1, stepQueries.length);
  const common = [...counts.entries()].filter(([t, c]) => c / n >= 0.6 && !WEAK.has(t)).map(([t]) => t);
  if (common.length) return common;
  return tokens(heroQuery).slice(0, 3);
}

/** Variantes de requête, de la plus précise à la plus large. */
export function queryVariants(query, subject) {
  const q = tokens(query);
  const actions = q.filter((t) => !subject.includes(t) && !WEAK.has(t));
  const subj = subject.join(" ");
  const out = [query, `${subj} ${actions.slice(0, 2).join(" ")}`.trim(), `${subj} ${actions[0] ?? ""}`.trim(), subj];
  if (actions.length) out.push(actions.slice(0, 2).join(" "));
  return [...new Set(out.map((s) => s.trim()).filter(Boolean))];
}

/**
 * Score d'un candidat : sujet (obligatoire si fourni) ×3, mots d'action ×2, bonus popularité léger.
 * Renvoie -1 si le sujet est totalement absent des tags.
 */
export function scoreCandidate(cand, query, subject) {
  const tagSet = new Set(tokens(cand.tags.replace(/,/g, " ")).map(stem));
  const has = (t) => [...expand(t)].some((x) => tagSet.has(x));
  const subjHits = subject.filter(has).length;
  // Le dernier mot du sujet est souvent le nom principal (skillet, drive, garden…) : il pèse double.
  const head = subject[subject.length - 1];
  const headHit = head ? has(head) : true;
  if (subject.length && subjHits === 0) return -1;
  const actions = tokens(query).filter((t) => !subject.includes(t) && !WEAK.has(t));
  const actHits = actions.filter(has).length;
  return subjHits * 3 + (headHit ? 3 : 0) + actHits * 2 + Math.min(1, Math.log10(1 + (cand.likes ?? 0)) / 3) + (cand.wide ? 0.5 : 0);
}

export function rank(cands, query, subject, exclude = new Set()) {
  const seen = new Set();
  return cands
    .filter((c) => !exclude.has(c.id) && !seen.has(c.id) && seen.add(c.id))
    .map((c) => ({ c, s: scoreCandidate(c, query, subject) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => ({ ...x.c, score: Math.round(x.s * 10) / 10 }));
}

// Mots d'action/objets d'une phrase de narration (pour une requête et un contrôle strict).
const NARR_STOP = new Set(
  "step one two three four five six seven eight first second next now also so if can will would should could may might much many more most some any every each all about than too only even really because like get gets got make makes made do does did don't doesn't won't can't let lets right good great thing things way ways time times bit little keep take takes put puts going go goes want need needs back again sure yet well around anything something everything nothing between actually almost already always usually probably simply enough another other others whole rather instead though through during turns becomes means picked works working start starts".split(" "),
);
export function sentenceTerms(text, subject = []) {
  return tokens(text).filter((t) => t.length >= 4 && !NARR_STOP.has(t) && !WEAK.has(t) && !subject.includes(t));
}

/**
 * Contrôle strict « l'image s'y prête vraiment » : nom principal du sujet présent dans les tags
 * ET au moins `minTerms` mots de la phrase (actions, objets) retrouvés.
 */
export function strictMatch(cand, text, subject, { minTerms = 2 } = {}) {
  const tagSet = new Set(tokens(cand.tags.replace(/,/g, " ")).map(stem));
  const has = (t) => [...expand(t)].some((x) => tagSet.has(x));
  const head = subject[subject.length - 1];
  if (head && !has(head)) return false;
  const terms = [...new Set(sentenceTerms(text, subject))];
  return terms.filter(has).length >= Math.min(minTerms, Math.max(1, terms.length));
}
