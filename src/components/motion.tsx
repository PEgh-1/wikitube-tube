import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, FONT } from "../theme";
import type { ImageRef, Keyword } from "../types";
import { DrawIcon } from "./icons";
import { Illustration } from "./illustration";
import { NotesLayer, imageToBox } from "./brand";
import { BeforeAfter, SignedTransition } from "./stage";
import { FxLayer } from "./fx";

const TRANS = 16; // frames de transition entre plans / scènes

// ---------- Plusieurs plans par étape (photos + clip), coupes dynamiques ----------
export const MultiShot: React.FC<{
  shots: (ImageRef | undefined)[];
  durationInFrames: number;
  seed?: number;
  overlay?: string;
  minShotSec?: number;
  starts?: number[]; // débuts imposés (s) : coupes synchronisées sur la voix
  illusPad?: [number, number]; // marges haut/bas (cqh) des illustrations (place du titre en plein écran)
  box?: [number, number]; // taille du cadre affiché (px) : sert à placer les annotations
}> = ({ shots, durationInFrames, seed = 0, overlay, minShotSec = 4.5, starts, illusPad, box = [1920, 1080] }) => {
  const { fps } = useVideoConfig();
  const list = shots.filter(Boolean) as ImageRef[];
  if (!list.length) list.push(undefined as unknown as ImageRef);
  let froms: number[];
  if (starts && starts.length === list.length) {
    froms = starts.map((s) => Math.round(s * fps));
  } else {
    const n = Math.max(1, Math.min(list.length, Math.floor(durationInFrames / (minShotSec * fps))));
    const len = Math.ceil(durationInFrames / n);
    froms = Array.from({ length: n }, (_, i) => i * len);
  }
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: C.ink }}>
      {froms.map((from, i) => {
        const to = i < froms.length - 1 ? froms[i + 1] : durationInFrames;
        const len = Math.max(1, to - from);
        return (
          <Sequence key={i} from={from} durationInFrames={len + (i < froms.length - 1 ? TRANS : 0)} layout="none">
            <Shot image={list[i]} len={len + TRANS} first={i === 0} move={(seed + i) % 4} seed={seed + i} illusPad={illusPad} box={box} fromFrame={from} />
          </Sequence>
        );
      })}
      {overlay && <div style={{ position: "absolute", inset: 0, background: overlay }} />}
    </div>
  );
};

const Shot: React.FC<{ image?: ImageRef; len: number; first: boolean; move: number; seed?: number; illusPad?: [number, number]; box: [number, number]; fromFrame: number }> = ({
  image,
  len,
  first,
  move,
  seed = 0,
  illusPad,
  box,
  fromFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = interpolate(frame, [0, len], [0, 1], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });
  const annotated = Boolean(image?.notes?.length);
  const focus: [number, number] = [image?.focus?.[0] ?? 0.5, image?.focus?.[1] ?? 0.5];
  // 4 mouvements : zoom avant, travelling gauche, zoom arrière, travelling droite (parallaxe : léger décalage vertical).
  // Plans annotés : mouvement plus doux pour que les étiquettes restent dans le cadre.
  const moves = (
    annotated
      ? [
          { s0: 1.02, s1: 1.08, x: -0.8, y: -0.5 },
          { s0: 1.06, s1: 1.06, x: 1.2, y: 0.4 },
          { s0: 1.08, s1: 1.02, x: 0.6, y: -0.6 },
          { s0: 1.06, s1: 1.06, x: -1.2, y: 0.5 },
        ]
      : [
          { s0: 1.04, s1: 1.2, x: -2, y: -1.5 },
          { s0: 1.16, s1: 1.16, x: 4, y: 1 },
          { s0: 1.22, s1: 1.05, x: 1.5, y: -2 },
          { s0: 1.16, s1: 1.16, x: -4, y: 1.5 },
        ]
  )[move];
  const punch = first ? 0 : spring({ frame, fps, config: { damping: 16, stiffness: 120 } });
  const cut = Boolean(image?.sub); // second plan d'une même phrase : coupe franche + coup de zoom
  let scale = moves.s0 + (moves.s1 - moves.s0) * t + (first ? 0 : (1 - punch) * (cut ? 0.1 : 0.18));
  let tx = (t - 0.5) * moves.x;
  let ty = (t - 0.5) * moves.y;
  let ox = 0.5;
  let oy = 0.5;
  const [fbx, fby] = imageToBox(focus[0], focus[1], box, focus);
  const cl = (x: number) => Math.max(0.08, Math.min(0.92, x));
  if (image?.zoom) {
    // Zoom sur le geste : on resserre sur le point d'intérêt de la même image.
    ox = cl(fbx);
    oy = cl(fby);
    scale = image.zoom * (0.95 + 0.05 * t) + (1 - punch) * 0.12;
    tx = 0;
    ty = 0;
  } else if (annotated && image?.focus) {
    // Mouvement de caméra vers le geste : plan large, puis la caméra glisse vers le point d'intérêt
    // au moment où la voix le nomme (première annotation du plan).
    const first0 = Math.min(...(image.notes ?? []).map((n) => Math.round((n.t ?? 0) * fps) - fromFrame));
    const go = interpolate(frame, [first0 - 14, first0 + 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
    ox = cl(fbx);
    oy = cl(fby);
    scale = 1.02 + 0.15 * go + 0.03 * t + (first ? 0 : (1 - punch) * 0.06);
    tx = 0;
    ty = 0;
  }
  // Travelling lent continu : l'image ne se fige jamais, même après le glissement vers le geste.
  // Amplitude proportionnelle à la durée du plan (plans longs : jusqu'à 8 %), sens alterné d'un plan à l'autre.
  const lin = Math.min(1, frame / Math.max(1, len));
  const amp = Math.min(0.12, 0.017 * (len / fps));
  const pushIn = seed % 2 === 0;
  if (!image?.zoom && image?.kind !== "illustration") scale += pushIn ? amp * lin : amp * (1 - lin);
  // Coups de zoom sur les mots forts : saut net, tenu jusqu'à la fin du plan.
  for (const p of image?.punches ?? []) {
    const pf = Math.round(p * fps) - fromFrame;
    if (frame >= pf) scale += 0.11 * spring({ frame: frame - pf, fps, config: { damping: 20, stiffness: 320 } });
  }
  // Mise au point : à l'arrivée de la première annotation, le fond se floute autour du geste.
  const firstNote = (image?.notes ?? []).find((n) => n.type !== "loupe" && n.type !== "inset");
  let rack = 0;
  let rackAt: [number, number] = [0.5, 0.5];
  if (firstNote && !image?.compareFile) {
    const f0 = Math.round((firstNote.t ?? 0) * fps) - fromFrame;
    rack = interpolate(frame, [f0 - 8, f0 + 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
    rackAt = imageToBox(firstNote.at[0], firstNote.at[1], box, focus);
  }
  const origin = `${ox * 100}% ${oy * 100}%`;
  const cam = { s: scale, ox, oy, tx: tx / 100, ty: ty / 100 };
  // Entrée : volet diagonal depuis la droite + flash léger (coupe franche pour un second plan).
  const reveal = first || cut ? 1 : interpolate(frame, [0, TRANS], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const clip = first || cut ? undefined : `polygon(${100 - reveal * 115}% 0, 100% 0, 100% 100%, ${100 - reveal * 115 - 15}% 100%)`;
  const transform = `scale(${scale}) translate(${tx}%, ${ty}%)`;
  const media: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: `${focus[0] * 100}% ${focus[1] * 100}%` };
  const flash = first ? 0 : cut ? interpolate(frame, [0, 5], [0.3, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : interpolate(frame, [TRANS - 4, TRANS + 6], [0.35, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  let el: React.ReactNode;
  if (image?.kind === "illustration") {
    el = (
      <AbsoluteFill style={{ transform: first ? undefined : `scale(${1 + (1 - punch) * 0.08})` }}>
        <Illustration image={image} seed={seed} padTop={illusPad?.[0] ?? 0} padBottom={illusPad?.[1] ?? 0} />
      </AbsoluteFill>
    );
  } else if (image?.kind === "video") {
    const dur = Number((image as ImageRef & { duration?: number }).duration ?? 0);
    const rate = dur > 0 ? Math.max(0.5, Math.min(1, dur / (len / fps))) : 1;
    el = (
      <>
        <div style={{ position: "absolute", inset: 0, transform, transformOrigin: origin }}>
          <OffthreadVideo src={staticFile(image.file)} muted playbackRate={rate} style={media} />
        </div>
        <NotesLayer notes={image.notes} box={box} focus={focus} fromFrame={fromFrame} cam={cam} file={(image as ImageRef & { poster?: string }).poster ?? undefined} />
      </>
    );
  } else if (image?.compareFile) {
    el = <BeforeAfter before={image.compareFile} after={image.file} labels={image.compareLabels ?? undefined} len={len - TRANS} />;
  } else if (image) {
    // Les cibles des annotations suivent la caméra ; les étiquettes restent fixes dans le cadre.
    el = (
      <>
        <div style={{ position: "absolute", inset: 0, transform, transformOrigin: origin }}>
          <Img src={staticFile(image.file)} style={media} />
          {rack > 0.01 && (
            <Img
              src={staticFile(image.file)}
              style={{ ...media, filter: "blur(5px) brightness(0.92)", opacity: rack, WebkitMaskImage: `radial-gradient(circle at ${rackAt[0] * 100}% ${rackAt[1] * 100}%, transparent 0%, transparent 27%, black 58%)`, maskImage: `radial-gradient(circle at ${rackAt[0] * 100}% ${rackAt[1] * 100}%, transparent 0%, transparent 27%, black 58%)` }}
            />
          )}
          <FxLayer fx={image.fx} box={box} focus={focus} />
        </div>
        <NotesLayer notes={image.notes} box={box} focus={focus} fromFrame={fromFrame} cam={cam} file={image.file} />
      </>
    );
  } else {
    el = <div style={{ ...media, transform, background: `linear-gradient(135deg, ${C.teal}, ${C.ink})` }} />;
  }
  return (
    <AbsoluteFill style={{ clipPath: clip }}>
      {el}
      {flash > 0 && <AbsoluteFill style={{ background: C.white, opacity: flash }} />}
    </AbsoluteFill>
  );
};

// ---------- Mots-clés synchronisés sur la voix ----------
export const KeywordBurst: React.FC<{ keywords?: Keyword[]; dark?: boolean; size?: number; align?: "left" | "center" }> = ({
  keywords,
  dark = false,
  size = 64,
  align = "left",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!keywords?.length) return null;
  const t = frame / fps;
  let idx = -1;
  for (let i = 0; i < keywords.length; i++) if (keywords[i].at <= t + 0.04) idx = i;
  if (idx < 0) return null;
  const k = keywords[idx];
  const next = keywords[idx + 1];
  const endT = Math.min(next ? next.at - 0.08 : Infinity, k.at + 2.6);
  if (t > endT) return null;
  const local = frame - Math.round(k.at * fps);
  const left = Math.round((endT - t) * fps);
  const s = spring({ frame: local, fps, config: { damping: 11, stiffness: 220 } });
  const out = interpolate(left, [0, 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const hl = interpolate(local, [3, 12], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const wobble = Math.sin(local / 3) * Math.max(0, 1 - local / 18) * 4;
  return (
    <div style={{ display: "flex", justifyContent: align === "center" ? "center" : "flex-start" }}>
      <div
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          gap: size * 0.3,
          padding: `${size * 0.14}px ${size * 0.34}px`,
          borderRadius: size * 0.3,
          background: dark ? C.white : C.ink,
          color: dark ? C.ink : C.white,
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: size,
          lineHeight: 1.1,
          textTransform: "uppercase",
          letterSpacing: 1,
          boxShadow: "0 16px 40px rgba(27,42,65,0.28)",
          transform: `scale(${s * out}) rotate(${-2 + wobble}deg)`,
          transformOrigin: align === "center" ? "50% 50%" : "0% 50%",
          opacity: Math.min(1, s * 1.5) * out,
        }}
      >
        {k.icon && <DrawIcon name={k.icon} size={size * 0.9} color={dark ? C.coral : C.sun} delay={Math.round(k.at * fps) + 2} stroke={6} />}
        <span style={{ position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: -6,
              bottom: size * 0.04,
              height: size * 0.32,
              width: `calc(${hl}% + 12px)`,
              background: dark ? C.sun : C.coral,
              borderRadius: 6,
              opacity: 0.9,
            }}
          />
          <span style={{ position: "relative" }}>{k.text}</span>
        </span>
      </div>
    </div>
  );
};

/** Petits « tics » sonores discrets sur chaque mot-clé. */
export const KeywordSfx: React.FC<{ keywords?: Keyword[] }> = ({ keywords }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {(keywords ?? []).map((k, i) => (
        <Sequence key={i} from={Math.round(k.at * fps)} durationInFrames={Math.round(fps * 0.5)} layout="none">
          <Audio src={staticFile("sfx/pop.mp3")} volume={0.16} />
        </Sequence>
      ))}
    </>
  );
};

// ---------- Transition entre scènes : volets corail + encre, avec whoosh ----------
export const SceneWipe: React.FC<{ durationInFrames: number; enter?: boolean; exit?: boolean; sound?: boolean; variant?: number; variantIn?: number }> = ({
  durationInFrames,
  enter = true,
  exit = true,
  sound = true,
  variant,
  variantIn,
}) => {
  const frame = useCurrentFrame();
  const easing = Easing.inOut(Easing.cubic);
  // Entrée : les volets partent vers la droite. Sortie : ils arrivent depuis la gauche.
  const inP = enter ? interpolate(frame, [0, TRANS], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing }) : 1;
  const outP = exit ? interpolate(frame, [durationInFrames - TRANS, durationInFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing }) : 0;
  // Sortie : jaune, puis corail, puis encre recouvrent l'écran ; entrée : ordre inverse (l'encre part en premier).
  const bar = (color: string, outDelay: number, inDelay: number) => {
    const span = 0.7;
    let x: number | null = null;
    if (outP > 0) x = -130 + Math.max(0, Math.min(1, (outP - outDelay) / span)) * 130;
    else if (inP < 1) x = Math.max(0, Math.min(1, (inP - inDelay) / span)) * 130;
    if (x === null || x >= 130 || x <= -130) return null;
    return <div style={{ position: "absolute", top: "-10%", bottom: "-10%", left: "-8%", width: "116%", background: color, transform: `translateX(${x}%) skewX(-12deg)` }} />;
  };
  return (
    <>
      {variant === undefined ? (
        <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
          {bar(C.sun, 0, 0.3)}
          {bar(C.coral, 0.15, 0.15)}
          {bar(C.ink, 0.3, 0)}
        </AbsoluteFill>
      ) : (
        <SignedTransition p={outP > 0 ? outP : inP < 1 ? 1 + inP : 0} variant={outP > 0 ? variant : (variantIn ?? variant)} />
      )}
      {sound && exit && (
        <Sequence from={durationInFrames - TRANS - 4} layout="none">
          <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.22} />
          <Audio src={staticFile("brand/sfx-w.mp3")} volume={0.4} />
        </Sequence>
      )}
    </>
  );
};

/** Le plan affiché à l'instant est-il une illustration (la légende remplace alors les mots-clés) ? */
export function useIllustrationActive(shots: (ImageRef | undefined)[], starts?: number[]): boolean {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!starts || starts.length !== shots.length) return false;
  let idx = 0;
  for (let i = 0; i < starts.length; i++) if (frame >= Math.round(starts[i] * fps)) idx = i;
  return shots[idx]?.kind === "illustration";
}
