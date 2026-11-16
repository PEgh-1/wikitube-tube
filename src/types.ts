export type Word = { w: string; s: number; e: number };
export type Keyword = { text: string; at: number; end: number; icon?: string | null };

export type Segment = {
  id: string;
  file: string; // chemin relatif à public/ (staticFile)
  at: number; // début absolu dans la vidéo (s)
  duration: number;
  words?: Word[];
};

export type Note = {
  type: "arrow" | "circle" | "swirl" | "cross";
  at: [number, number]; // cible, en coordonnées image (0-1)
  text?: string;
  label?: [number, number]; // centre de l'étiquette, en coordonnées du cadre affiché (0-1)
  r?: number; // rayon (fraction de la largeur du cadre)
  on?: string;
  t?: number; // apparition (s, relative à la scène)
};
export type Fact = { t?: number; dur?: number; kind: "timer" | "measure"; big: string; small?: string };
export type InfoCardData = { t?: number; dur?: number; kind: "why" | "avoid"; title: string; text: string };
export type Tick = { t?: number; dur?: number; label: string };

export type ImageRef = {
  focus?: [number, number] | null; // point d'intérêt (coordonnées image) : cadrage et zoom
  zoom?: number | null; // second plan de la phrase : zoom sur le geste (même image)
  sub?: boolean; // second plan d'une même phrase (coupe franche)
  notes?: Note[] | null;
  key?: string;
  file: string; // relatif à public/
  kind?: "photo" | "video" | "illustration";
  caption?: string;
  icons?: string[];
  timer?: { value: number; unit: string } | null;
  negative?: boolean;
  duration?: number;
  wordStart?: number;
  text?: string;
  width?: number | null;
  height?: number | null;
  credit?: string | null;
};

export type SceneBase = {
  type: string;
  start: number; // s
  duration: number; // s
  segments: Segment[];
};

export type PrerollScene = SceneBase & { type: "preroll"; baseline?: string | null };
export type HookScene = SceneBase & {
  part?: "cold" | "intro"; type: "hook"; title: string; category: string; stepCount: number; image?: ImageRef };
export type YouNeedScene = SceneBase & { type: "youneed"; items: string[] };
export type StepScene = SceneBase & {
  type: "step";
  index: number;
  total: number;
  title: string;
  tip: string;
  image?: ImageRef;
  images?: ImageRef[];
  icon?: string;
  keywords?: Keyword[];
  shotStarts?: number[]; // débuts des plans (s, relatifs à la scène), calés sur les phrases
  layout: "split" | "full" | "card";
  facts?: Fact[];
  cards?: InfoCardData[];
  ticks?: Tick[];
};
export type MistakesScene = SceneBase & { type: "mistakes"; items: string[] };
export type RecapScene = SceneBase & { type: "recap"; items: string[] };
export type OutroScene = SceneBase & { type: "outro"; baseline?: string | null };
export type ShortHookScene = SceneBase & { type: "short-hook"; title: string; image?: ImageRef };
export type ShortStepScene = SceneBase & { type: "short-step"; index: number; total: number; title: string; image?: ImageRef };
export type ShortCtaScene = SceneBase & { type: "short-cta" };

export type Scene =
  | PrerollScene
  | HookScene
  | YouNeedScene
  | StepScene
  | MistakesScene
  | RecapScene
  | OutroScene
  | ShortHookScene
  | ShortStepScene
  | ShortCtaScene;

export type Timeline = {
  kind: "long" | "short";
  fps: number;
  width: number;
  height: number;
  totalSec: number;
  durationInFrames: number;
  scenes: Scene[];
};

export type RenderOptions = {
  burnSubtitles?: boolean; // sous-titres incrustés (par défaut true)
  audio?: boolean; // désactiver l'audio (aperçu Studio)
};

export type LongProps = { timeline: Timeline; options?: RenderOptions };
export type ShortProps = { timeline: Timeline; options?: RenderOptions };
export type ThumbnailProps = {
  title: string; // metadata.thumbnailTitle
  stepCount: number;
  category: string;
  image?: ImageRef;
};
