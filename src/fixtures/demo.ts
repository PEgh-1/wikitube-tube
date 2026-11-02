// Timeline de démonstration pour le Studio Remotion (sans audio ni images : repli dégradé).
import type { Timeline } from "../types";

const mkWords = (text: string, start = 0) => {
  let t = start;
  return text.split(" ").map((w) => {
    const d = 0.28 + w.length * 0.04;
    const o = { w, s: +t.toFixed(2), e: +(t + d).toFixed(2) };
    t += d + 0.06;
    return o;
  });
};
const seg = (id: string, at: number, text: string) => ({ id, file: "", at, duration: text.split(" ").length * 0.4, words: mkWords(text) });

export const demoLong: Timeline = {
  kind: "long",
  fps: 30,
  width: 1920,
  height: 1080,
  totalSec: 36,
  durationInFrames: 36 * 30,
  scenes: [
    { type: "preroll", start: 0, duration: 3, segments: [] },
    { type: "hook", start: 3, duration: 6, title: "How to Clean a Cast Iron Skillet", category: "Kitchen", stepCount: 3, segments: [seg("hook", 3, "Cast iron can outlive you, if you clean it right.")] },
    { type: "youneed", start: 9, duration: 4, items: ["Coarse salt", "A little oil", "A dry towel"], segments: [seg("youneed", 9, "You'll need salt, oil and a towel.")] },
    { type: "step", start: 13, duration: 5, index: 1, total: 3, title: "Rinse it while warm", tip: "No soap needed", layout: "split", segments: [seg("step-1", 13, "Step one, rinse it with hot water while it is still warm.")] },
    { type: "step", start: 18, duration: 5, index: 2, total: 3, title: "Scrub with coarse salt", tip: "Salt scrubs, not scratches", layout: "full", segments: [seg("step-2", 18, "Step two, scrub stuck-on bits with a handful of coarse salt.")] },
    { type: "step", start: 23, duration: 5, index: 3, total: 3, title: "Wipe a thin coat of oil", tip: "Thin, not greasy", layout: "card", segments: [seg("step-3", 23, "Step three, rub in a thin layer of oil and heat it.")] },
    { type: "mistakes", start: 28, duration: 3, items: ["Soaking it", "The dishwasher"], segments: [seg("mistakes", 28, "Never soak it, never the dishwasher.")] },
    { type: "recap", start: 31, duration: 3, items: ["Rinse warm", "Salt scrub", "Oil and heat"], segments: [seg("recap", 31, "Rinse, scrub, oil.")] },
    { type: "outro", start: 34, duration: 2, segments: [] },
  ],
};

export const demoShort: Timeline = {
  kind: "short",
  fps: 30,
  width: 1080,
  height: 1920,
  totalSec: 16,
  durationInFrames: 16 * 30,
  scenes: [
    { type: "short-hook", start: 0, duration: 4, title: "How to Clean a Cast Iron Skillet", segments: [seg("short-hook", 0, "Stop ruining your cast iron skillet.")] },
    { type: "short-step", start: 4, duration: 3.5, index: 1, total: 3, title: "Rinse it warm", segments: [seg("short-step-1", 4, "One, rinse it warm.")] },
    { type: "short-step", start: 7.5, duration: 3.5, index: 2, total: 3, title: "Scrub with salt", segments: [seg("short-step-2", 7.5, "Two, scrub with salt.")] },
    { type: "short-step", start: 11, duration: 3, index: 3, total: 3, title: "Oil and heat", segments: [seg("short-step-3", 11, "Three, oil and heat.")] },
    { type: "short-cta", start: 14, duration: 2, segments: [] },
  ],
};
