import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, FONT } from "../theme";
import type { ImageRef, Keyword } from "../types";
import { DrawIcon } from "./icons";
import { Illustration } from "./illustration";

const TRANS = 12; // frames de transition entre plans / scènes

// ---------- Plusieurs plans par étape (photos + clip), coupes dynamiques ----------
export const MultiShot: React.FC<{
  shots: (ImageRef | undefined)[];
  durationInFrames: number;
  seed?: number;
  overlay?: string;
  minShotSec?: number;
  starts?: number[]; // débuts imposés (s) : coupes synchronisées sur la voix
  illusPad?: [number, number]; // marges haut/bas (cqh) des illustrations (place du titre en plein écran)
}> = ({ shots, durationInFrames, seed = 0, overlay, minShotSec = 4.5, starts, illusPad }) => {
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
            <Shot image={list[i]} len={len + TRANS} first={i === 0} move={(seed + i) % 4} seed={seed + i} illusPad={illusPad} />
          </Sequence>
        );
      })}
      {overlay && <div style={{ position: "absolute", inset: 0, background: overlay }} />}
    </div>
  );
};

const Shot: React.FC<{ image?: ImageRef; len: number; first: boolean; move: number; seed?: number; illusPad?: [number, number] }> = ({ image, len, first, move, seed = 0, illusPad }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = interpolate(frame, [0, len], [0, 1], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });
  // 4 mouvements : zoom avant, travelling gauche, zoom arrière, travelling droite (parallaxe : léger décalage vertical).
  const moves = [
    { s0: 1.04, s1: 1.2, x: -2, y: -1.5 },
    { s0: 1.16, s1: 1.16, x: 4, y: 1 },
    { s0: 1.22, s1: 1.05, x: 1.5, y: -2 },
    { s0: 1.16, s1: 1.16, x: -4, y: 1.5 },
  ][move];
  const punch = first ? 0 : spring({ frame, fps, config: { damping: 16, stiffness: 120 } });
  const scale = moves.s0 + (moves.s1 - moves.s0) * t + (first ? 0 : (1 - punch) * 0.18);
  const tx = (t - 0.5) * moves.x;
  const ty = (t - 0.5) * moves.y;
  // Entrée : volet diagonal depuis la droite + flash léger.
  const reveal = first ? 1 : interpolate(frame, [0, TRANS], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const clip = first ? undefined : `polygon(${100 - reveal * 115}% 0, 100% 0, 100% 100%, ${100 - reveal * 115 - 15}% 100%)`;
  const transform = `scale(${scale}) translate(${tx}%, ${ty}%)`;
  const media: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform };
  const flash = first ? 0 : interpolate(frame, [TRANS - 4, TRANS + 6], [0.35, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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
    el = <OffthreadVideo src={staticFile(image.file)} muted playbackRate={rate} style={media} />;
  } else if (image) {
    el = <Img src={staticFile(image.file)} style={media} />;
  } else {
    el = <div style={{ ...media, background: `linear-gradient(135deg, ${C.teal}, ${C.ink})` }} />;
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
export const SceneWipe: React.FC<{ durationInFrames: number; enter?: boolean; exit?: boolean; sound?: boolean }> = ({
  durationInFrames,
  enter = true,
  exit = true,
  sound = true,
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
      <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
        {bar(C.sun, 0, 0.3)}
        {bar(C.coral, 0.15, 0.15)}
        {bar(C.ink, 0.3, 0)}
      </AbsoluteFill>
      {sound && exit && (
        <Sequence from={durationInFrames - TRANS - 4} layout="none">
          <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.32} />
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
