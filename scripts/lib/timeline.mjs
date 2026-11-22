// Calcule la timeline (en secondes) du long et du Short à partir de l'épisode et des
// durées audio. Consommée par render.mjs (inputProps Remotion), build-srt.mjs et les chapitres.
import { FPS, fmtTime } from "./common.mjs";
import { pickKeywords, stepIcon } from "./motion.mjs";
import { allSections } from "./episode.mjs";

export const PREROLL_SEC = 3;
export const OPEN_VOICE_AT = 0.55; // la voix démarre sur la fin du jingle
export const GAP_SEC = 0.7; // respiration après chaque segment narré
export const OUTRO_TAIL_SEC = 1.6;
export const SHORT_GAP_SEC = 0.35;
export const SHORT_MAX_SEC = 58;

const roundToFrame = (sec, fps = FPS) => Math.round(sec * fps) / fps;

/**
 * @param ep épisode validé
 * @param tts manifeste tts.json ({ segments: { id: { file, duration, words } } })
 * @param images manifeste images.json ({ hero, steps: [{ file, kind }] })
 */
export function buildLongTimeline(ep, tts, images, { fps = FPS, brand = null } = {}) {
  const seg = (id) => {
    const s = tts.segments[id];
    if (!s) throw new Error(`Segment audio manquant : ${id}`);
    return s;
  };
  const scenes = [];
  let t = 0;
  const push = (scene, segIds, extraTail = GAP_SEC) => {
    const segments = [];
    let cursor = t;
    for (const id of segIds) {
      const s = seg(id);
      segments.push({ id, file: s.file, at: roundToFrame(cursor, fps), duration: s.duration, words: s.words });
      cursor += s.duration + 0.25;
    }
    const duration = roundToFrame(Math.max(cursor - t - 0.25 + extraTail, 2), fps);
    scenes.push({ ...scene, start: roundToFrame(t, fps), duration, segments });
    t = roundToFrame(t + duration, fps);
  };

  // Ouverture signée (jingle + baseline dite par la voix). Par défaut l'accroche passe d'abord :
  // accroche → signature courte → introduction (meilleure rétention des premières secondes).
  const open = tts.segments["brand-open"];
  const hookScene = { type: "hook", title: ep.title, category: ep.category, stepCount: ep.steps.length, image: images.hero, pose: images.introExtras?.pose ?? null };
  const signature = () => {
    const dur = roundToFrame(Math.max(PREROLL_SEC, OPEN_VOICE_AT + open.duration + 0.45), fps);
    scenes.push({ type: "preroll", start: roundToFrame(t, fps), duration: dur, baseline: brand?.baseline ?? null, segments: [{ id: "brand-open", file: open.file, at: roundToFrame(t + OPEN_VOICE_AT, fps), duration: open.duration, words: open.words }] });
    t = roundToFrame(t + dur, fps);
  };
  let sting = null;
  const v3 = brand?.opening === "v3"; // ouverture « montage » : accroche en plans courts, virgule sonore, schéma entre deux photos
  if (open && brand?.hookFirst) {
    push({ ...hookScene, part: "cold" }, ["hook"], v3 ? 0.2 : 0.35);
    if (v3) hookMontage(scenes[scenes.length - 1], ep, images);
    if (v3 && brand?.hookStyle === "trailer") hookTrailer(scenes[scenes.length - 1], ep, images);
    if (v3) {
      // Virgule d'une seconde (pastille W + début du jingle) à cheval sur la coupe ; la baseline est dite sur la première photo de l'intro.
      sting = { at: roundToFrame(t, fps) };
      push({ ...hookScene, part: "intro", baseline: brand?.baseline ?? null }, ["brand-open", "intro"]);
    } else {
      signature();
      push({ ...hookScene, part: "intro" }, ["intro"]);
    }
    // Introduction illustrée : schéma + éléments calés sur les mots de la voix.
    const ix = images.introExtras;
    const sc = scenes[scenes.length - 1];
    const sg = sc.segments.find((x) => x.id === "intro");
    if (ix?.diagram) {
      const find = (on) => (sg.words ?? []).find((x) => normWord(x.w) === normWord(on ?? ""));
      const cue = (on, fallback) => {
        const w = find(on);
        return Math.round((w ? sg.at - sc.start + w.s - 0.1 : fallback) * 100) / 100;
      };
      sc.diagram = ix.diagram;
      sc.diagramTitle = ix.title ?? null;
      sc.diagramMode = ix.mode ?? null;
      // v3 : l'intro est resserrée, un encart dont le mot n'est plus dit disparaît (pas de repli à l'aveugle).
      sc.chips = (ix.chips ?? []).filter((c) => !v3 || find(c.on)).map((c, k) => ({ ...c, t: cue(c.on, 4 + k * 3) }));
      sc.gags = (ix.gags ?? []).filter((g) => !v3 || find(g.on)).map((g) => ({ ...g, t: cue(g.on, 6) }));
    }
    if (v3) introMontage(sc, sg, images);
  } else {
    if (open) signature();
    else {
      scenes.push({ type: "preroll", start: 0, duration: PREROLL_SEC, segments: [] });
      t = PREROLL_SEC;
    }
    push(hookScene, ["hook", "intro"]);
  }
  push({ type: "youneed", items: ep.youNeed, image: images.youneed ?? images.hero }, ["youneed"]);
  listCues(scenes[scenes.length - 1], ep.youNeed);
  allSections(ep).forEach((s, i) => {
    push(
      {
        type: "step",
        index: i + 1,
        total: ep.steps.length,
        title: s.title,
        tip: s.tip,
        bonus: s.bonus ? s.label : null,
        image: images.steps[i],
        images: (images.stepShots?.[i] ?? [images.steps[i]]).filter(Boolean),
        icon: stepIcon(s),
        layout: ["split", "full", "card"][i % 3],
      },
      [`step-${i + 1}`],
    );
    const sc = scenes[scenes.length - 1];
    const sg = sc.segments[0];
    sc.keywords = pickKeywords(sg.words, sg.at - sc.start, [s.title, s.tip]);
    // Coupes calées sur la voix : chaque plan démarre 0,15 s avant la phrase qu'il illustre.
    if (sc.images.length > 1 && sc.images.every((im) => Number.isInteger(im.wordStart)) && sg.words?.length) {
      sc.shotStarts = sc.images.map((im, j) => {
        if (j === 0) return 0;
        const w = sg.words[Math.min(im.wordStart, sg.words.length - 1)];
        return Math.max(0, Math.round((sg.at - sc.start + w.s - 0.15) * 100) / 100);
      });
    }
    resolveExtras(sc, sg, images.stepExtras?.[i]);
  });
  // Relance visuelle (v3) : en fin d'étape, une étiquette annonce la suivante (« NEXT · … »).
  // Jamais par-dessus un encart, une annotation ou la bulle d'astuce : sinon elle est décalée ou supprimée.
  if (v3) {
    const stepScenes = scenes.filter((x) => x.type === "step");
    stepScenes.forEach((x, k) => {
      const nx = stepScenes[k + 1];
      if (!nx) return;
      const lastShot = x.images?.[x.images.length - 1];
      if (lastShot?.notes?.length || lastShot?.compareFile) return;
      let at = Math.max(x.duration * 0.6, x.duration - 3.6);
      const tipEnd = Math.min(x.duration - 0.67, x.duration * 0.5 + 9) + 0.3;
      if (tipEnd > at) at = tipEnd;
      for (const [list, def] of [[x.facts, 4], [x.cards, 4.4], [x.gags, 3], [x.diagrams, 6], [x.ticks, 4]]) for (const c of list ?? []) at = Math.max(at, (c.t ?? 0) + (c.dur ?? def) + 1);
      if (x.duration - at < 2) return;
      x.nextUp = { t: Math.round(at * 100) / 100, label: nx.bonus ? nx.title : `Step ${nx.index}: ${nx.title}` };
    });
  }
  push({ type: "mistakes", items: ep.mistakesToAvoid.items, images: (images.mistakes ?? []).length === ep.mistakesToAvoid.items.length ? images.mistakes : [], subtitle: images.mistakesSubtitle ?? null }, ["mistakes"]);
  listCues(scenes[scenes.length - 1], ep.mistakesToAvoid.items);
  push({ type: "recap", items: ep.recap.items ?? ep.steps.map((s) => s.title), images: ep.steps.map((_, i) => images.steps[i] ?? null) }, ["recap"]);
  listCues(scenes[scenes.length - 1], ep.recap.items ?? ep.steps.map((s) => s.title));
  push({ type: "outro", baseline: brand?.baseline ?? null }, tts.segments["brand-close"] ? ["outro", "brand-close"] : ["outro"], OUTRO_TAIL_SEC);

  const totalSec = t;
  return {
    kind: "long",
    fps,
    width: 1920,
    height: 1080,
    totalSec,
    durationInFrames: Math.round(totalSec * fps),
    scenes,
    ...(sting ? { sting } : {}),
    chapters: chaptersFrom(scenes, ep),
  };
}

// ---------- Ouverture v3 ----------
/** Débuts de plans calés sur la voix : n coupes réparties, chacune ramenée au début de membre de phrase le plus proche. */
function voiceCuts(words, base, from, to, n, { snap = 0.9, minGap = 1.3 } = {}) {
  const starts = [from];
  if (n <= 1) return starts;
  const clause = [];
  const any = [];
  (words ?? []).forEach((w, i) => {
    const at = base + w.s - 0.12;
    any.push(at);
    if (i > 0 && /[.,;:!?…]$/.test(words[i - 1].w)) clause.push(at);
  });
  const nearest = (list, x) => list.reduce((best, c) => (Math.abs(c - x) < Math.abs(best - x) ? c : best), Infinity);
  for (let k = 1; k < n; k++) {
    const ideal = from + ((to - from) * k) / n;
    let c = nearest(clause, ideal);
    if (!Number.isFinite(c) || Math.abs(c - ideal) > snap) c = nearest(any, ideal);
    if (!Number.isFinite(c)) c = ideal;
    if (c - starts[starts.length - 1] >= minGap && to - c >= minGap) starts.push(Math.round(c * 100) / 100);
  }
  return starts;
}

const stepShot = (images, ref) => {
  const m = /^(\d+)-(\d+)$/.exec(String(ref));
  return m ? images.stepShots?.[Number(m[1]) - 1]?.[Number(m[2]) - 1] ?? null : null;
};
const mediaRef = (images, ref) => (ref === "hero" ? images.hero : /^mistake-(\d+)$/.test(String(ref)) ? images.mistakes?.[Number(String(ref).slice(8)) - 1] ?? null : stepShot(images, ref));
/** Un plan d'ouverture : la photo seule (ni annotation, ni effet calé sur une autre scène). */
const bare = (im, extra = {}) => (im ? { file: im.file, kind: im.kind, duration: im.duration, focus: im.focus ?? null, fx: im.fx ?? null, ...extra } : null);

/**
 * Accroche en montage : le résultat d'abord (clip animé du jour s'il existe), puis le problème, un aperçu des gestes,
 * et l'avant / après pour finir. Plans choisis à la main (shots.json → extras.hook.shots : "hero", "mistake-1", "4-7"…)
 * ou automatiquement.
 */
function hookMontage(sc, ep, images) {
  const sg = sc.segments[0];
  const hx = images.hookExtras ?? {};
  const all = (images.stepShots ?? []).map((list) => (list ?? []).filter((im) => im && im.kind !== "illustration"));
  let picks;
  if (hx.shots?.length) picks = hx.shots.map((r) => mediaRef(images, r)).filter(Boolean);
  else {
    const n = Math.min(ep.steps.length, all.length);
    const clip = all.flat().find((im) => im.kind === "video");
    const spread = [0.2, 0.45, 0.7, 0.95].map((f) => all[Math.min(n - 1, Math.floor(f * n))]).filter((l) => l?.length);
    picks = [clip ?? images.hero, images.mistakes?.[0], ...spread.map((l, k) => l[Math.min(l.length - 1, 1 + (k % 2))]), images.mistakes?.[1]].filter(Boolean);
  }
  const seen = new Set();
  picks = picks.filter((im) => !seen.has(im.file) && seen.add(im.file));
  const voiceEnd = sg.at - sc.start + sg.duration;
  const n = Math.max(3, Math.min(picks.length + 1, 8, Math.round(sc.duration / 2.3)));
  const starts = voiceCuts(sg.words, sg.at - sc.start, 0, sc.duration, n);
  const body = picks.slice(0, starts.length - 1).map((im, k) => bare(im, { punches: k === 0 ? [0.5] : [starts[k] + 0.75] }));
  // Dernier plan : avant / après (l'erreur à gauche, le résultat à droite) quand une image d'erreur existe.
  const before = images.mistakes?.[0];
  const last = before && images.hero?.kind !== "video" ? bare(images.hero, { compareFile: before.file, compareLabels: hx.labels ?? ["Before", "After"] }) : bare(images.hero);
  sc.images = [...body, last];
  sc.shotStarts = starts.slice(0, sc.images.length);
  // Mots forts : ceux choisis dans l'épisode (hookWords, dans l'ordre du texte), sinon choix automatique.
  const lastStart = sc.shotStarts[sc.shotStarts.length - 1];
  let kws;
  if (ep.hookWords?.length) {
    let cursor = 0;
    kws = [];
    for (const hw of ep.hookWords) {
      const first = normWord(String(hw).split(/\s+/)[0]);
      const j = (sg.words ?? []).findIndex((x, i) => i >= cursor && normWord(x.w) === first);
      if (j < 0) continue;
      cursor = j + 1;
      const at = sg.at - sc.start + sg.words[j].s;
      kws.push({ text: hw, at, end: at + 1.2, icon: null });
    }
  } else kws = pickKeywords(sg.words, sg.at - sc.start, [], { minGap: 2.2, max: 6, startAfter: 2.4 });
  sc.keywords = kws.filter((k) => k.at > (sc.shotStarts[1] ?? 2) - 0.05 && k.at < lastStart - 0.4);
  // Promesse à l'écran : « restez jusqu'à l'étape N » si la voix le dit, sinon le nombre d'étapes.
  const m = /step (one|two|three|four|five|six|seven|eight|nine|ten|\d+)/i.exec(ep.hook);
  const w = m ? (sg.words ?? []).find((x) => normWord(x.w) === "step") : null;
  sc.tease = m && w ? { t: Math.round((sg.at - sc.start + w.s - 0.2) * 100) / 100, label: `Stay for step ${wordToNum(m[1])}` } : null;
  sc.voiceEnd = Math.round(voiceEnd * 100) / 100;
}
/**
 * Accroche « bande-annonce » (v4) : quatre actes calés sur la voix.
 *   1. le problème (image d'erreur, zoom par à-coups, titre), jusqu'à la 2e phrase ;
 *   2. le résultat (panoramique filé vers la photo réussie) ;
 *   3. la promesse : une carte par étape, dès que la voix dit le nombre (« seven steps ») ;
 *   4. le suspense : la carte de l'étape annoncée (« stay for step N ») passe au centre, floutée.
 */
function hookTrailer(sc, ep, images) {
  const sg = sc.segments[0];
  const W = sg.words ?? [];
  const base = sg.at - sc.start;
  const D = sc.duration;
  const at = (i) => base + W[i].s - 0.12;
  const sent = [0];
  W.forEach((w, i) => i > 0 && /[.!?…]$/.test(W[i - 1].w) && sent.push(i));
  const sentOf = (i) => sent.filter((x) => x <= i).pop() ?? 0;
  const NUM = /^(two|three|four|five|six|seven|eight|nine|ten|\d+)$/;
  let iTease = W.findIndex((w) => normWord(w.w) === "stay");
  if (iTease < 0) iTease = sent[sent.length - 1];
  const iNum = W.findIndex((w, i) => i < iTease && i >= (sent[1] ?? 0) && NUM.test(normWord(w.w)));
  const iProm = iNum < 0 ? -1 : iNum - sentOf(iNum) <= 3 ? sentOf(iNum) : iNum;
  let turn = sent[1] !== undefined && W.length ? at(sent[1]) : D * 0.2;
  let promise = iProm >= 0 ? at(iProm) : D * 0.42;
  let tease = W.length && iTease > 0 ? at(iTease) : D * 0.74;
  // Garde-fous : chaque acte a le temps d'exister.
  turn = Math.min(Math.max(turn, 1.7), D * 0.3);
  promise = Math.max(promise, turn + 1.5);
  tease = Math.min(Math.max(tease, promise + 3), D - 2.4);
  if (promise > tease - 3) promise = Math.max(turn + 1.2, tease - 3.4);
  const m = /step (one|two|three|four|five|six|seven|eight|nine|ten|\d+)/i.exec(ep.hook);
  const n = ep.steps.length;
  const teaseStep = Math.min(n, Math.max(1, Number(m ? wordToNum(m[1]) : n)));
  const still = (list) => (list ?? []).find((im) => im && im.kind !== "illustration" && im.kind !== "video");
  const cards = ep.steps.map((_, i) => {
    const im = still(images.stepShots?.[i]) ?? images.steps?.[i] ?? images.hero;
    return { n: i + 1, file: im?.file ?? images.hero.file };
  });
  const r2 = (x) => Math.round(x * 100) / 100;
  const problem = images.mistakes?.[0] ?? still(images.stepShots?.[0]) ?? images.hero;
  sc.trailer = { problem: { file: problem.file }, result: { file: images.hero.file, kind: images.hero.kind ?? "image" }, turn: r2(turn), promise: r2(promise), tease: r2(tease), teaseStep, cards };
  sc.keywords = [];
  sc.tease = null;
}
const wordToNum = (x) => ({ one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 })[String(x).toLowerCase()] ?? x;

/** Intro v3 : photo pendant la baseline et la première phrase, schéma au milieu (tant que des encarts tombent), photo pour finir. */
function introMontage(sc, sg, images) {
  const all = (images.stepShots ?? []).slice(0, sc.stepCount).map((list) => (list ?? []).filter((im) => im && im.kind !== "illustration" && im.kind !== "video"));
  const ix = images.introExtras ?? {};
  const pool = ix.shots?.length ? ix.shots.map((r) => mediaRef(images, r)).filter(Boolean) : [all[0]?.[0], all[Math.floor(all.length / 2)]?.[0], all[all.length - 1]?.[0], all[1]?.[0]].filter(Boolean);
  const base = sg.at - sc.start;
  const chipTs = (sc.chips ?? []).filter((c) => !c.hidden).map((c) => c.t);
  let from = sc.duration;
  let to = sc.duration;
  if (sc.diagram && chipTs.length) {
    from = Math.max(base + 1.2, Math.min(...chipTs) - 0.9);
    to = Math.min(sc.duration - 2.2, Math.max(...chipTs) + 3.2);
    if (to - from < 3) from = to = sc.duration;
  } else sc.diagram = null;
  sc.diagramFrom = Math.round(from * 100) / 100;
  sc.diagramTo = Math.round(to * 100) / 100;
  // Photos avant et après le schéma, une coupe toutes les 3 s environ, calées sur la voix.
  const pre = voiceCuts(sg.words, base, 0, from, Math.max(1, Math.round(from / 3.2)));
  const post = to < sc.duration ? voiceCuts(sg.words, base, to, sc.duration, Math.max(1, Math.round((sc.duration - to) / 3.2))) : [];
  const starts = [...pre, ...post];
  sc.images = starts.map((_, k) => bare(pool[k % pool.length]));
  sc.shotStarts = starts;
}

const STOP = new Set("the and for with from into your you that this then".split(" "));
/**
 * Cale chaque élément d'une liste (matériel, erreurs, récap) sur le moment où la voix le nomme :
 * on cherche, dans l'ordre, le premier mot significatif de l'élément ; à défaut, répartition régulière.
 */
function listCues(sc, items) {
  const sg = sc.segments[0];
  const words = sg?.words ?? [];
  const base = sg ? sg.at - sc.start : 0;
  let cursor = 0;
  const even = (k) => Math.round((0.6 + (k * (sc.duration - 1.5)) / Math.max(1, items.length)) * 100) / 100;
  sc.cues = items.map((it, k) => {
    const tokens = String(it).split(/\s+/).map(normWord).filter((x) => x.length >= 3 && !STOP.has(x));
    let best = -1;
    for (const tok of tokens) {
      for (let j = cursor; j < Math.min(words.length, cursor + 22); j++) {
        if (normWord(words[j].w) === tok || normWord(words[j].w) === tok.replace(/s$/, "") || normWord(words[j].w).replace(/s$/, "") === tok) {
          if (best < 0 || j < best) best = j;
          break;
        }
      }
    }
    if (best < 0) return even(k);
    cursor = best + 1;
    return Math.max(0, Math.round((base + words[best].s - 0.12) * 100) / 100);
  });
  // Toujours croissant (un repli régulier ne doit pas passer avant l'élément précédent).
  for (let k = 1; k < sc.cues.length; k++) if (sc.cues[k] <= sc.cues[k - 1]) sc.cues[k] = Math.round((sc.cues[k - 1] + 0.8) * 100) / 100;
}

const normWord = (w) => String(w).toLowerCase().replace(/[^a-z0-9'-]/g, "");

/**
 * Cale sur la voix les annotations des plans et les encarts de l'étape (chiffres, « pourquoi », « à éviter », coches).
 * `on` = mot de la phrase du plan à partir duquel l'élément apparaît ; sans `on`, 0,4 s après le début du plan.
 */
function resolveExtras(sc, sg, extras) {
  const words = sg.words ?? [];
  const base = sg.at - sc.start;
  const shots = sc.images ?? [];
  const range = (j) => [shots[j]?.wordStart ?? 0, shots[j + 1]?.wordStart ?? words.length];
  const shotStart = (j) => sc.shotStarts?.[j] ?? 0;
  const timeOf = (j, on, fallback = 0.4) => {
    if (on && words.length) {
      // On cherche dans la phrase entière (les deux moitiés d'un plan coupé partagent la phrase).
      let a = range(j)[0];
      let b = range(j)[1];
      for (let k = j; k > 0 && shots[k].sub; k--) a = range(k - 1)[0];
      for (let k = j + 1; k < shots.length && shots[k].sub; k++) b = range(k)[1];
      const target = normWord(on);
      for (let k = a; k < Math.min(b, words.length); k++) if (normWord(words[k].w) === target) return Math.max(shotStart(j) + 0.1, base + words[k].s - 0.1);
    }
    return shotStart(j) + fallback;
  };
  const r2 = (x) => Math.round(x * 100) / 100;
  shots.forEach((im, j) => {
    if (im?.notes) im.notes = im.notes.map((n) => ({ ...n, t: r2(timeOf(j, n.on)) }));
    // Coups de zoom : seulement si le mot est bien trouvé dans la phrase (pas de repli).
    if (im?.punchOn) im.punches = im.punchOn.map((w) => timeOf(j, w, -1)).filter((t) => t > shotStart(j) + 0.3).map(r2);
  });
  if (!extras) return;
  const first = (shotNo) => {
    // `shot` = n° de phrase (1..n) dans shots.json → index du premier plan de cette phrase
    let idx = -1;
    let count = 0;
    shots.forEach((im, j) => {
      if (!im?.sub) count++;
      if (count === shotNo && idx < 0) idx = j;
    });
    return Math.max(0, idx);
  };
  for (const key of ["facts", "cards", "ticks", "gags", "diagrams"]) {
    if (!extras[key]) continue;
    sc[key] = extras[key].map((x) => ({ ...x, t: r2(timeOf(first(x.shot ?? 1), x.on, 0.6)) })).sort((a, b) => a.t - b.t);
  }
}

/** Timeline réduite à quelques scènes (pilote) : ouverture + scènes choisies + fin, recalées bout à bout. */
export function subsetTimeline(tl, keys, { fps = FPS } = {}) {
  const want = (sc) => sc.type === "preroll" || sc.type === "outro" || keys.includes(sc.type) || keys.includes(`${sc.type}-${sc.index}`);
  let t = 0;
  const scenes = tl.scenes.filter(want).map((sc) => {
    const shift = t - sc.start;
    const out = { ...sc, start: roundToFrame(t, fps), segments: sc.segments.map((g) => ({ ...g, at: roundToFrame(g.at + shift, fps) })) };
    t = roundToFrame(t + sc.duration, fps);
    return out;
  });
  // Virgule v3 : seulement si l'accroche et l'intro sont toutes deux dans l'extrait.
  const cold = scenes.find((sc) => sc.type === "hook" && sc.part === "cold");
  const intro = scenes.find((sc) => sc.type === "hook" && sc.part === "intro");
  const sting = tl.sting && cold && intro ? { at: intro.start } : null;
  return { ...tl, scenes, sting, totalSec: t, durationInFrames: Math.round(t * fps), chapters: [] };
}

export function buildShortTimeline(ep, tts, images, { fps = FPS } = {}) {
  const build = (gap) => {
    const scenes = [];
    let t = 0;
    const push = (scene, id, tail = gap) => {
      const s = tts.segments[id];
      if (!s) throw new Error(`Segment audio manquant : ${id}`);
      const duration = roundToFrame(Math.max(s.duration + tail, 1.5), fps);
      scenes.push({ ...scene, start: roundToFrame(t, fps), duration, segments: [{ id, file: s.file, at: roundToFrame(t, fps), duration: s.duration, words: s.words }] });
      t = roundToFrame(t + duration, fps);
    };
    // Image d'ouverture choisie à la main (short.hookShot : "hero", "mistake-N" ou "étape-plan"), sinon l'image héros.
    const hookRef = String(ep.short.hookShot ?? "");
    const hm = /^mistake-(\d+)$/.exec(hookRef);
    const [hs, hj] = hookRef.split("-").map(Number);
    const hookImage = (hm ? images.mistakes?.[Number(hm[1]) - 1] : hs && hj ? images.stepShots?.[hs - 1]?.[hj - 1] : null) ?? images.hero;
    push({ type: "short-hook", title: ep.title, punch: ep.short.punch, image: hookImage?.kind === "video" ? images.hero : hookImage }, "short-hook");
    ep.short.steps.forEach((s, i) => {
      // Les 3 étapes du Short réutilisent les images des étapes du long (réparties).
      const srcIndex = Math.min(ep.steps.length - 1, Math.round((i * (ep.steps.length - 1)) / 2));
      // Plan choisi à la main pour le Short ("étape-plan", photo uniquement), sinon l'image principale de l'étape.
      const [ps, pj] = String(images.shortShots?.[i] ?? "").split("-").map(Number);
      const picked = ps && pj ? images.stepShots?.[ps - 1]?.[pj - 1] : null;
      push({ type: "short-step", index: i + 1, total: 3, title: s.title, image: picked && picked.kind !== "video" ? picked : images.steps[srcIndex] }, `short-step-${i + 1}`);
    });
    push({ type: "short-cta" }, "short-cta", 1.0);
    return { scenes, totalSec: t };
  };
  let r = build(SHORT_GAP_SEC);
  if (r.totalSec > SHORT_MAX_SEC) r = build(0.1);
  if (r.totalSec > SHORT_MAX_SEC) {
    throw new Error(`Short trop long : ${r.totalSec.toFixed(1)} s > ${SHORT_MAX_SEC} s — raccourcir short.* dans l'épisode`);
  }
  return {
    kind: "short",
    fps,
    width: 1080,
    height: 1920,
    totalSec: r.totalSec,
    durationInFrames: Math.round(r.totalSec * fps),
    scenes: r.scenes,
  };
}

export function chaptersFrom(scenes, ep) {
  if (Array.isArray(ep.metadata.chapters)) return ep.metadata.chapters;
  const list = [{ time: 0, title: "Intro" }];
  for (const s of scenes) {
    if (s.type === "youneed") list.push({ time: s.start, title: "What you'll need" });
    if (s.type === "step") list.push({ time: s.start, title: s.bonus ? s.title : `Step ${s.index}: ${s.title}` });
    if (s.type === "mistakes") list.push({ time: s.start, title: "Mistakes to avoid" });
    if (s.type === "recap") list.push({ time: s.start, title: "Recap" });
  }
  // YouTube : 1er chapitre à 0:00, ≥ 3 chapitres, ≥ 10 s chacun.
  return list.map((c) => ({ time: fmtTime(c.time), seconds: c.time, title: c.title }));
}

export function chaptersText(chapters) {
  return chapters.map((c) => `${c.time} ${c.title}`).join("\n");
}

/** Mots avec timestamps absolus (dans la vidéo) pour une timeline. */
export function absoluteWords(timeline) {
  const out = [];
  for (const sc of timeline.scenes) {
    for (const seg of sc.segments) {
      for (const w of seg.words ?? []) out.push({ w: w.w, s: seg.at + w.s, e: seg.at + w.e, seg: seg.id });
    }
  }
  return out;
}

/** Second Short : une erreur à éviter ou une astuce. Ouverture (clip vertical si disponible), 1 à 3 temps, appel à l'action. */
export function buildShort2Timeline(ep, tts, images, { fps = FPS } = {}) {
  const s2 = ep.short2;
  if (!s2) return null;
  // "étape-plan", "mistake-N", "hero" ou un fichier short2-*.mp4|jpg déposé dans data/shots/<id>/.
  const media = (ref) => {
    if (!ref) return null;
    if (images.short2Files?.[ref]) return images.short2Files[ref];
    if (ref === "hero") return images.hero;
    const m = /^mistake-(\d+)$/.exec(ref);
    if (m) return images.mistakes?.[Number(m[1]) - 1] ?? null;
    const [ps, pj] = String(ref).split("-").map(Number);
    return ps && pj ? (images.stepShots?.[ps - 1]?.[pj - 1] ?? null) : null;
  };
  const scenes = [];
  let t = 0;
  const push = (scene, id, tail = SHORT_GAP_SEC) => {
    const g = tts.segments[id];
    if (!g) throw new Error(`Segment audio manquant : ${id}`);
    const duration = roundToFrame(Math.max(g.duration + tail, 1.5), fps);
    scenes.push({ ...scene, start: roundToFrame(t, fps), duration, segments: [{ id, file: g.file, at: roundToFrame(t, fps), duration: g.duration, words: g.words }] });
    t = roundToFrame(t + duration, fps);
  };
  push({ type: "short2-hook", kind: s2.kind, title: s2.headline, image: media(s2.shot) ?? images.hero }, "short2-hook");
  s2.beats.forEach((b, i) => push({ type: "short2-beat", kind: s2.kind, index: i + 1, total: s2.beats.length, label: b.label, title: b.title, image: media(b.shot) ?? images.hero }, `short2-beat-${i + 1}`));
  push({ type: "short-cta" }, "short2-cta", 1.0);
  if (t > SHORT_MAX_SEC) throw new Error(`Second Short trop long : ${t.toFixed(1)} s`);
  return { kind: "short", fps, width: 1080, height: 1920, totalSec: t, durationInFrames: Math.round(t * fps), scenes, chapters: [] };
}
