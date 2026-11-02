import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, FONT } from "../theme";
import type { ImageRef } from "../types";
import { DrawIcon } from "./icons";

// Illustration animée générée à la volée (aucune image externe) : utilisée quand aucune photo
// ne colle vraiment à la phrase dite. Tailles en unités de conteneur (cqw/cqh) → s'adapte à la
// carte 800×600, au plein écran 1920×1080 ou au bandeau 1700×600.
const PALETTES = [
  { bg1: C.teal, bg2: "#1F8C80", fg: C.white, accent: C.sun },
  { bg1: C.coral, bg2: "#E2553A", fg: C.white, accent: C.sun },
  { bg1: C.ink, bg2: "#24385A", fg: C.white, accent: C.coral },
  { bg1: C.sun, bg2: "#F2B32F", fg: C.ink, accent: C.coral },
];

export const Illustration: React.FC<{ image: ImageRef; seed?: number; padTop?: number; padBottom?: number }> = ({ image, seed = 0, padTop = 0, padBottom = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = PALETTES[seed % PALETTES.length];
  const icons = (image.icons?.length ? image.icons : ["bulb"]).slice(0, image.timer ? 2 : 3);
  const words = String(image.caption ?? "").split(/\s+/).filter(Boolean);
  const drift = frame / fps;
  return (
    <AbsoluteFill style={{ containerType: "size", background: `linear-gradient(135deg, ${p.bg1}, ${p.bg2})`, fontFamily: FONT, overflow: "hidden" }}>
      {/* Fond vivant : grands cercles qui dérivent + trame de points */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: `${60 + i * 25}cqh`,
            height: `${60 + i * 25}cqh`,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.07)",
            left: `${[-10, 70, 30][i] + Math.sin(drift / (3 + i)) * 4}cqw`,
            top: `${[-25, 40, 70][i] + Math.cos(drift / (4 + i)) * 5}cqh`,
          }}
        />
      ))}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.12) 1.5px, transparent 1.5px)", backgroundSize: "28px 28px" }} />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: `${padTop}cqh`, paddingBottom: `${padBottom}cqh`, gap: "5cqh" }}>
        {/* Rangée de pictogrammes reliés par des flèches qui se dessinent */}
        <div style={{ display: "flex", alignItems: "center", gap: "2.5cqw" }}>
          {icons.map((name, i) => (
            <React.Fragment key={name + i}>
              
              <IconDisc name={name} delay={4 + i * 12} accent={p.accent} cross={image.negative && i === 0} />
            </React.Fragment>
          ))}
          {image.timer && (
            <>
              <Timer value={image.timer.value} unit={image.timer.unit} delay={4 + icons.length * 12} accent={p.accent} />
            </>
          )}
        </div>
        {/* Consigne : mots qui montent un par un */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 1.4cqh", maxWidth: "84cqw", textAlign: "center" }}>
          {words.map((w, i) => {
            const s = spring({ frame: frame - (14 + i * 3), fps, config: { damping: 14, stiffness: 170 } });
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  fontSize: "clamp(20px, 7.4cqh, 84px)",
                  fontWeight: 900,
                  color: p.fg,
                  lineHeight: 1.12,
                  transform: `translateY(${(1 - s) * 30}px)`,
                  opacity: s,
                  textShadow: p.fg === C.white ? "0 4px 18px rgba(0,0,0,0.18)" : "none",
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const IconDisc: React.FC<{ name: string; delay: number; accent: string; cross?: boolean }> = ({ name, delay, accent, cross }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 10, stiffness: 150 } });
  const bob = Math.sin((frame - delay) / 12) * 1.2;
  const crossP = interpolate(frame - delay - 20, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <div
      style={{
        position: "relative",
        width: "26cqh",
        height: "26cqh",
        borderRadius: "50%",
        background: C.white,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `0 1.6cqh 4cqh rgba(0,0,0,0.22), inset 0 0 0 1.1cqh ${accent}`,
        transform: `translateY(${bob}cqh) scale(${s})`,
      }}
    >
      <div style={{ width: "15cqh", height: "15cqh" }}>
        <DrawIcon name={name} size="100%" color={C.ink} delay={delay + 5} stroke={5} />
      </div>
      {cross && crossP > 0 && (
        <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: "-6%", width: "112%", height: "112%" }}>
          <path d="M18 18 L82 82" stroke={C.coral} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - crossP} />
        </svg>
      )}
    </div>
  );
};

const Arrow: React.FC<{ delay: number; color: string }> = ({ delay, color }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <svg viewBox="0 0 80 40" style={{ width: "10cqh", height: "5cqh", overflow: "visible", opacity: 0.9 }}>
      <path d="M4 20 H66 M54 8 L68 20 L54 32" fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 10" pathLength={1} style={{ strokeDasharray: 1, strokeDashoffset: 1 - p }} />
    </svg>
  );
};

const Timer: React.FC<{ value: number; unit: string; delay: number; accent: string }> = ({ value, unit, delay, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 10, stiffness: 150 } });
  const sweep = interpolate(frame - delay, [6, 6 + fps * 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });
  const r = 42;
  const circ = 2 * Math.PI * r;
  const label = unit.startsWith("min") ? "MIN" : unit.startsWith("sec") ? "SEC" : "H";
  return (
    <div style={{ position: "relative", width: "26cqh", height: "26cqh", transform: `scale(${s})` }}>
      <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <circle cx="50" cy="50" r="48" fill={C.white} />
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(27,42,65,0.12)" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={accent} strokeWidth="8" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - sweep)} transform="rotate(-90 50 50)" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: C.ink, fontFamily: FONT, fontWeight: 900, lineHeight: 1 }}>
        <span style={{ fontSize: "9cqh" }}>{value}</span>
        <span style={{ fontSize: "3.6cqh", letterSpacing: 2 }}>{label}</span>
      </div>
    </div>
  );
};
