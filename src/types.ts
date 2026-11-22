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
  type: "arrow" | "circle" | "swirl" | "cross" | "loupe" | "inset"; // inset : médaillon gros plan, sans assombrir l'image
  lens?: [number, number]; // centre de la loupe (cadre affiché, 0-1)
  zoom?: number; // grossissement de la loupe
  at: [number, number]; // cible, en coordonnées image (0-1)
  text?: string;
  label?: [number, number]; // centre de l'étiquette, en coordonnées du cadre affiché (0-1)
  r?: number; // rayon (fraction de la largeur du cadre)
  on?: string;
  t?: number; // apparition (s, relative à la scène)
};
export type Fx = { type: "steam" | "bubbles" | "drops" | "sparkle"; at: [number, number]; size?: number };
export type Fact = { t?: number; dur?: number; kind: "timer" | "measure"; big: string; small?: string };
export type InfoCardData = { t?: number; dur?: number; kind: "why" | "avoid"; title: string; text: string };
export type Gag = { t?: number; dur?: number; pose: string; side?: "left" | "right" | "bottom"; on?: string; shot?: number };
export type Diagram = { t?: number; dur?: number; name: string; mode: string; title?: string; on?: string; shot?: number };
export type Chip = { t?: number; label: string; sub?: string; mode?: string; on?: string; hidden?: boolean }; // hidden : change seulement le mode du schéma
export type Tick = { t?: number; dur?: number; label: string };

export type ImageRef = {
  focus?: [number, number] | null; // point d'intérêt (coordonnées image) : cadrage et zoom
  zoom?: number | null; // second plan de la phrase : zoom sur le geste (même image)
  sub?: boolean; // second plan d'une même phrase (coupe franche)
  notes?: Note[] | null;
  fx?: Fx[] | null; // effets d'ambiance animés sur la photo
  punches?: number[] | null; // coups de zoom calés sur la voix (s, relatifs à la scène)
  compareFile?: string | null; // image « avant » (avant / après)
  compareLabels?: [string, string] | null;
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
  part?: "cold" | "intro";
  pose?: string | null; // pose de Wiki sur l'accroche (plumber, chef…)
  diagramTitle?: string | null;
  diagramMode?: string | null;
  diagram?: string | null;
  chips?: Chip[];
  gags?: Gag[];
  images?: ImageRef[]; // v3 : plans du montage (accroche) ou photos autour du schéma (intro)
  shotStarts?: number[];
  keywords?: Keyword[];
  tease?: { t: number; label: string } | null;
  voiceEnd?: number;
  trailer?: { problem: { file: string }; result: { file: string; kind?: string }; turn: number; promise: number; tease: number; teaseStep: number; cards: { n: number; file: string }[] } | null; // v4 : accroche « bande-annonce »
  baseline?: string | null;
  diagramFrom?: number; // v3 : fenêtre d'affichage du schéma (s, relatives à la scène)
  diagramTo?: number;
  type: "hook"; title: string; category: string; stepCount: number; image?: ImageRef };
export type YouNeedScene = SceneBase & { type: "youneed"; items: string[]; image?: ImageRef | null; cues?: number[] };
export type StepScene = SceneBase & {
  type: "step";
  index: number;
  total: number;
  title: string;
  tip: string;
  bonus?: string | null; // section hors numérotation : étiquette affichée à la place de « STEP n »
  image?: ImageRef;
  images?: ImageRef[];
  icon?: string;
  keywords?: Keyword[];
  shotStarts?: number[]; // débuts des plans (s, relatifs à la scène), calés sur les phrases
  layout: "split" | "full" | "card";
  facts?: Fact[];
  cards?: InfoCardData[];
  ticks?: Tick[];
  gags?: Gag[];
  diagrams?: Diagram[];
  nextUp?: { t: number; label: string } | null; // v3 : annonce de l'étape suivante en fin de scène
};
export type MistakesScene = SceneBase & { type: "mistakes"; items: string[]; images?: ImageRef[]; cues?: number[]; subtitle?: string | null };
export type RecapScene = SceneBase & { type: "recap"; items: string[]; images?: (ImageRef | null)[]; cues?: number[] };
export type OutroScene = SceneBase & { type: "outro"; baseline?: string | null };
export type ShortHookScene = SceneBase & { type: "short-hook"; title: string; punch?: string; image?: ImageRef };
export type ShortStepScene = SceneBase & { type: "short-step"; index: number; total: number; title: string; image?: ImageRef };
export type ShortCtaScene = SceneBase & { type: "short-cta" };
export type Short2HookScene = SceneBase & { type: "short2-hook"; kind: "mistake" | "tip"; title: string; image?: ImageRef };
export type Short2BeatScene = SceneBase & { type: "short2-beat"; kind: "mistake" | "tip"; index: number; total: number; label: string; title: string; image?: ImageRef };

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
  | ShortCtaScene
  | Short2HookScene
  | Short2BeatScene;

export type Timeline = {
  kind: "long" | "short";
  fps: number;
  width: number;
  height: number;
  totalSec: number;
  durationInFrames: number;
  scenes: Scene[];
  sting?: { at: number } | null; // v3 : virgule sonore (pastille W + jingle court) à cheval sur la coupe accroche → intro
};

export type RenderOptions = {
  burnSubtitles?: boolean; // sous-titres incrustés (par défaut true)
  audio?: boolean; // désactiver l'audio (aperçu Studio)
  probe?: boolean; // sonde de mise en page (contrôle, jamais en rendu final)
};

export type LongProps = { timeline: Timeline; options?: RenderOptions };
export type ShortProps = { timeline: Timeline; options?: RenderOptions };
export type ThumbnailProps = {
  title: string; // metadata.thumbnailTitle
  stepCount: number;
  category: string;
  image?: ImageRef;
};
