import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, FONT } from "../theme";
import type { ImageRef } from "../types";

// ---------- Logo (CSS + texte, aucun fichier image requis) ----------
export const Logo: React.FC<{ size?: number; onDark?: boolean }> = ({ size = 64, onDark = false }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.25, fontFamily: FONT }}>
    <div
      style={{
        width: size,
        height: size * 0.72,
        borderRadius: size * 0.2,
        background: C.coral,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 0,
          height: 0,
          borderTop: `${size * 0.18}px solid transparent`,
          borderBottom: `${size * 0.18}px solid transparent`,
          borderLeft: `${size * 0.3}px solid ${C.white}`,
          marginLeft: size * 0.06,
        }}
      />
    </div>
    <div style={{ fontSize: size * 0.8, fontWeight: 900, color: onDark ? C.paper : C.ink, letterSpacing: -1, lineHeight: 1 }}>
      Wiki<span style={{ color: C.coral }}>Tube</span>
    </div>
  </div>
);

// ---------- Fond papier pointillé ----------
export const Frame: React.FC<{ children: React.ReactNode; bg?: string; dots?: boolean }> = ({ children, bg = C.paper, dots = true }) => (
  <AbsoluteFill style={{ background: bg, fontFamily: FONT, color: C.ink, overflow: "hidden" }}>
    {dots && (
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(${C.ink}12 1.5px, transparent 1.5px)`,
          backgroundSize: "36px 36px",
          opacity: 0.6,
        }}
      />
    )}
    {children}
  </AbsoluteFill>
);

// ---------- Animations ----------
export const Pop: React.FC<{ delay?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ delay = 0, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 160 } });
  return <div style={{ transform: `scale(${s})`, opacity: Math.min(1, s * 1.2), ...style }}>{children}</div>;
};

export const SlideUp: React.FC<{ delay?: number; distance?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  delay = 0,
  distance = 60,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 120 } });
  return <div style={{ transform: `translateY(${(1 - s) * distance}px)`, opacity: s, ...style }}>{children}</div>;
};

/** Fondu de sortie sur les N dernières frames de la scène. */
export const FadeOut: React.FC<{ durationInFrames: number; frames?: number; children: React.ReactNode }> = ({ durationInFrames, frames = 10, children }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [durationInFrames - frames, durationInFrames - 1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

// ---------- Barre de progression des étapes ----------
export const ProgressBar: React.FC<{ step: number; total: number; top?: number }> = ({ step, total, top = 36 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fill = spring({ frame, fps, config: { damping: 20, stiffness: 90 } });
  return (
    <div style={{ position: "absolute", top, left: 80, right: 80, display: "flex", gap: 12 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: 10, borderRadius: 5, background: "rgba(27,42,65,0.12)", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              borderRadius: 5,
              background: i < step - 1 ? C.coral : C.coral,
              width: i < step - 1 ? "100%" : i === step - 1 ? `${fill * 100}%` : "0%",
            }}
          />
        </div>
      ))}
    </div>
  );
};

// ---------- Badge numéro d'étape ----------
export const StepBadge: React.FC<{ n: number; size?: number; color?: string }> = ({ n, size = 120, color = C.coral }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const badge = spring({ frame, fps, config: { damping: 10, stiffness: 200 } });
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: size * 0.25,
        background: color,
        color: C.white,
        fontSize: size * 0.6,
        fontWeight: 900,
        fontFamily: FONT,
        transform: `scale(${badge}) rotate(${(1 - badge) * -20}deg)`,
        boxShadow: "0 12px 30px rgba(27,42,65,0.18)",
      }}
    >
      {n}
    </div>
  );
};

// ---------- Image Ken Burns (zoom lent + léger pan) ----------
export const KenBurns: React.FC<{
  image?: ImageRef;
  durationInFrames: number;
  direction?: number; // 0..3 alterne les directions
  zoomFrom?: number;
  zoomTo?: number;
  style?: React.CSSProperties;
  overlay?: string; // CSS background pour l'overlay (dégradé charte)
}> = ({ image, durationInFrames, direction = 0, zoomFrom = 1.02, zoomTo = 1.14, style, overlay }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, Math.max(1, durationInFrames)], [0, 1], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });
  const scale = zoomFrom + (zoomTo - zoomFrom) * t;
  const pan = 2.2; // % de déplacement
  const dirs = [
    [-pan, -pan * 0.5],
    [pan, -pan * 0.4],
    [-pan * 0.6, pan],
    [pan * 0.8, pan * 0.6],
  ];
  const [dx, dy] = dirs[direction % dirs.length];
  const transform = `scale(${scale}) translate(${dx * t}%, ${dy * t}%)`;
  return (
    <div style={{ position: "relative", overflow: "hidden", width: "100%", height: "100%", background: C.ink, ...style }}>
      {image?.kind === "video" ? (
        <OffthreadVideo src={staticFile(image.file)} muted style={{ width: "100%", height: "100%", objectFit: "cover", transform }} />
      ) : image ? (
        <Img src={staticFile(image.file)} style={{ width: "100%", height: "100%", objectFit: "cover", transform }} />
      ) : (
        <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${C.teal}, ${C.ink})`, transform }} />
      )}
      {overlay && <div style={{ position: "absolute", inset: 0, background: overlay }} />}
    </div>
  );
};

// ---------- Pastille astuce ----------
export const TipPill: React.FC<{ text: string; delay?: number; dark?: boolean; size?: number }> = ({ text, delay = 24, dark = false, size = 34 }) => (
  <SlideUp delay={delay} style={{ display: "inline-flex", alignItems: "center", gap: 14 }}>
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 14,
        background: dark ? "rgba(255,255,255,0.14)" : C.mint,
        border: `3px solid ${C.teal}`,
        color: dark ? C.white : C.ink,
        borderRadius: 999,
        padding: `${size * 0.35}px ${size * 0.8}px`,
        fontSize: size,
        fontWeight: 800,
        fontFamily: FONT,
        backdropFilter: "blur(6px)",
      }}
    >
      <span style={{ width: size * 0.45, height: size * 0.45, borderRadius: "50%", background: C.teal, display: "inline-block" }} />
      {text}
    </div>
  </SlideUp>
);

export const LogoCorner: React.FC<{ top?: number; left?: number; size?: number; onDark?: boolean }> = ({ top = 36, left = 80, size = 44, onDark }) => (
  <div style={{ position: "absolute", top, left }}>
    <Logo size={size} onDark={onDark} />
  </div>
);
