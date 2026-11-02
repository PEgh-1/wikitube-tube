// Calcule la timeline (en secondes) du long et du Short à partir de l'épisode et des
// durées audio. Consommée par render.mjs (inputProps Remotion), build-srt.mjs et les chapitres.
import { FPS, fmtTime } from "./common.mjs";
import { pickKeywords, stepIcon } from "./motion.mjs";

export const PREROLL_SEC = 3;
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
export function buildLongTimeline(ep, tts, images, { fps = FPS } = {}) {
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

  scenes.push({ type: "preroll", start: 0, duration: PREROLL_SEC, segments: [] });
  t = PREROLL_SEC;
  push({ type: "hook", title: ep.title, category: ep.category, stepCount: ep.steps.length, image: images.hero }, ["hook", "intro"]);
  push({ type: "youneed", items: ep.youNeed }, ["youneed"]);
  ep.steps.forEach((s, i) => {
    push(
      {
        type: "step",
        index: i + 1,
        total: ep.steps.length,
        title: s.title,
        tip: s.tip,
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
  });
  push({ type: "mistakes", items: ep.mistakesToAvoid.items }, ["mistakes"]);
  push({ type: "recap", items: ep.recap.items ?? ep.steps.map((s) => s.title) }, ["recap"]);
  push({ type: "outro" }, ["outro"], OUTRO_TAIL_SEC);

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
      push({ type: "short-step", index: i + 1, total: 3, title: s.title, image: images.steps[srcIndex] }, `short-step-${i + 1}`);
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
    if (s.type === "step") list.push({ time: s.start, title: `Step ${s.index}: ${s.title}` });
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
