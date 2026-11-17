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
  if (open && brand?.hookFirst) {
    push({ ...hookScene, part: "cold" }, ["hook"], 0.35);
    signature();
    push({ ...hookScene, part: "intro" }, ["intro"]);
    // Introduction illustrée : schéma + éléments calés sur les mots de la voix.
    const ix = images.introExtras;
    if (ix?.diagram) {
      const sc = scenes[scenes.length - 1];
      const sg = sc.segments[0];
      const cue = (on, fallback) => {
        const w = (sg.words ?? []).find((x) => normWord(x.w) === normWord(on ?? ""));
        return Math.round((w ? sg.at - sc.start + w.s - 0.1 : fallback) * 100) / 100;
      };
      sc.diagram = ix.diagram;
      sc.diagramTitle = ix.title ?? null;
      sc.diagramMode = ix.mode ?? null;
      sc.chips = (ix.chips ?? []).map((c, k) => ({ ...c, t: cue(c.on, 4 + k * 3) }));
      sc.gags = (ix.gags ?? []).map((g) => ({ ...g, t: cue(g.on, 6) }));
    }
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
    chapters: chaptersFrom(scenes, ep),
  };
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
  return { ...tl, scenes, totalSec: t, durationInFrames: Math.round(t * fps), chapters: [] };
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
    push({ type: "short-hook", title: ep.title, image: images.hero }, "short-hook");
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
