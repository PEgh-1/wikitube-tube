// Schéma d'un épisode WikiTube (zod) + export JSON Schema + règles métier.
import { z } from "zod";
import { wordCount } from "./common.mjs";

export const LOCALES = ["es", "pt", "fr", "de", "hi", "it", "ja", "id"];

const Narration = (min, max) =>
  z
    .string()
    .trim()
    .min(1)
    .refine((s) => wordCount(s) >= min && wordCount(s) <= max, {
      message: `narration : entre ${min} et ${max} mots`,
    });

const Localization = z.object({
  title: z.string().trim().min(5).max(100),
  description: z.string().trim().min(20).max(5000),
});

export const StepSchema = z.object({
  title: z.string().trim().min(3).max(60).describe("Titre court affiché à l'écran (≤ 60 caractères)."),
  narration: Narration(35, 120).describe("Voix off de l'étape, 2 à 4 phrases."),
  tip: z.string().trim().min(3).max(70).describe("Astuce courte affichée dans la carte."),
  mistake: z.string().trim().min(3).max(90).describe("Erreur fréquente liée à l'étape."),
  imageQuery: z.string().trim().min(3).max(100).describe("Requête de recherche d'images stock (Pixabay/Pexels, photo paysage)."),
  imagePrompt: z.string().trim().min(10).max(600).describe("Prompt pour une future API d'image (Gemini…)."),
  media: z.enum(["photo", "video"]).default("photo").describe("Type de média stock à chercher (photo ou vidéo)."),
});

export const ShortStepSchema = z.object({
  title: z.string().trim().min(2).max(40),
  narration: Narration(4, 30),
});

export const EpisodeSchema = z
  .object({
    $schema: z.string().optional(),
    id: z.string().regex(/^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/, "id = <date>-<slug>"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    category: z.string().trim().min(2).max(30).describe("Rubrique affichée (Kitchen, Home, Tech…)."),
    title: z.string().trim().min(10).max(90).describe("Titre affiché dans la vidéo."),
    hook: Narration(15, 70),
    intro: Narration(20, 110),
    youNeed: z.array(z.string().trim().min(2).max(40)).min(2).max(6),
    youNeedNarration: Narration(10, 90).optional(),
    heroImageQuery: z.string().trim().min(3).max(100),
    heroImagePrompt: z.string().trim().min(10).max(600),
    steps: z.array(StepSchema).min(6).max(8),
    mistakesToAvoid: z.object({
      narration: Narration(25, 120),
      items: z.array(z.string().trim().min(3).max(70)).min(2).max(4),
    }),
    recap: z.object({
      narration: Narration(25, 110),
      items: z.array(z.string().trim().min(3).max(40)).min(6).max(8).optional(),
    }),
    outro: Narration(15, 80),
    metadata: z.object({
      title: z.string().trim().min(10).max(100),
      description: z.string().trim().min(50).max(4500),
      tags: z.array(z.string().trim().min(2).max(60)).min(3).max(30),
      thumbnailTitle: z.string().trim().min(5).max(40),
      chapters: z.union([z.literal("auto"), z.array(z.object({ time: z.string(), title: z.string() }))]).default("auto"),
      playlistId: z.string().optional(),
      localizations: z.object(Object.fromEntries(LOCALES.map((l) => [l, Localization]))),
    }),
    short: z.object({
      title: z.string().trim().min(5).max(100),
      description: z.string().trim().min(10).max(1000),
      hook: Narration(5, 25),
      steps: z.array(ShortStepSchema).length(3),
      cta: Narration(5, 30),
    }),
  })
  .superRefine((ep, ctx) => {
    if (ep.id !== `${ep.date}-${ep.slug}`) {
      ctx.addIssue({ code: "custom", path: ["id"], message: "id doit valoir `${date}-${slug}`" });
    }
    if (ep.recap.items && ep.recap.items.length !== ep.steps.length) {
      ctx.addIssue({ code: "custom", path: ["recap", "items"], message: "recap.items doit avoir autant d'entrées que steps" });
    }
    const shortWords =
      wordCount(ep.short.hook) + ep.short.steps.reduce((a, s) => a + wordCount(s.narration), 0) + wordCount(ep.short.cta);
    if (shortWords > 130) {
      ctx.addIssue({ code: "custom", path: ["short"], message: `Short trop long : ${shortWords} mots (max 130 ≈ 50 s)` });
    }
    const longWords = totalLongWords(ep);
    if (longWords < 700 || longWords > 1500) {
      ctx.addIssue({ code: "custom", path: ["steps"], message: `Narration totale ${longWords} mots : viser 700–1500 (≈ 5–10 min)` });
    }
  });

export function totalLongWords(ep) {
  return (
    wordCount(ep.hook) +
    wordCount(ep.intro) +
    wordCount(ep.youNeedNarration ?? "") +
    ep.steps.reduce((a, s) => a + wordCount(s.narration), 0) +
    wordCount(ep.mistakesToAvoid.narration) +
    wordCount(ep.recap.narration) +
    wordCount(ep.outro)
  );
}

export function validateEpisode(raw) {
  const r = EpisodeSchema.safeParse(raw);
  if (!r.success) {
    const lines = r.error.issues.map((i) => `  • ${i.path.join(".") || "(racine)"} : ${i.message}`);
    throw new Error(`Épisode invalide :\n${lines.join("\n")}`);
  }
  return r.data;
}

export function episodeJsonSchema() {
  return z.toJSONSchema(EpisodeSchema, { io: "input", unrepresentable: "any" });
}

/** Liste ordonnée des segments narrés (clé → texte) pour le long. */
export function longSegments(ep) {
  const segs = [
    { id: "hook", text: ep.hook },
    { id: "intro", text: ep.intro },
    { id: "youneed", text: ep.youNeedNarration ?? `You'll need ${joinList(ep.youNeed)}.` },
    ...ep.steps.map((s, i) => ({ id: `step-${i + 1}`, text: s.narration })),
    { id: "mistakes", text: ep.mistakesToAvoid.narration },
    { id: "recap", text: ep.recap.narration },
    { id: "outro", text: ep.outro },
  ];
  return segs;
}

export function shortSegments(ep) {
  return [
    { id: "short-hook", text: ep.short.hook },
    ...ep.short.steps.map((s, i) => ({ id: `short-step-${i + 1}`, text: s.narration })),
    { id: "short-cta", text: ep.short.cta },
  ];
}

function joinList(items) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
