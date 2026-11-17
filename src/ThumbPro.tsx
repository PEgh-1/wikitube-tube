import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C, FONT } from "./theme";
import { Logo } from "./components/ui";
import { OverflowProbe } from "./components/probe";

export type ThumbProProps = {
  photo: string;
  flip?: boolean;
  position?: string; // object-position de la photo
  zoom?: number;
  lines: { text: string; hi?: boolean; size?: number }[];
  badge: string;
  mascot: string; // pose : panic, chef, nose…
  mascotH?: number;
  probe?: boolean;
};

const stroke = (w: number): React.CSSProperties => ({ WebkitTextStroke: `${w}px ${C.ink}`, paintOrder: "stroke fill" });

/** Miniature « clic » 1280×720 : photo vive à droite, panneau corail en biais, 2-3 mots géants, mascotte, pastille promesse. */
export const ThumbPro: React.FC<ThumbProProps> = ({ photo, flip, position = "50% 50%", zoom = 1.06, lines, badge, mascot, mascotH, probe }) => {
  // Mise en page calculée : chaque ligne tient dans le panneau en biais, la mascotte remplit l'espace restant,
  // la pastille ne passe jamais sous la mascotte. Aucun texte ne déborde, aucune zone ne reste vide.
  const LH = 1.04; // interligne : les contours épais ne se touchent pas
  const TOP = 40;
  // Le panneau s'élargit si un mot long le demande (jusqu'à 820 px en haut), la photo garde au moins la moitié droite.
  let yy = TOP;
  let need = 688;
  for (const l of lines) {
    const size = l.size ?? 128;
    yy += size * LH;
    need = Math.max(need, 44 + 56 + l.text.length * 0.7 * size + (140 * yy) / 720);
  }
  const panelTop = Math.min(820, need);
  const edgeAt = (y: number) => panelTop - (140 * y) / 720; // bord droit du panneau corail à la hauteur y
  let y = TOP;
  const fitted = lines.map((l) => {
    let size = l.size ?? 128;
    for (let i = 0; i < 6; i++) size = Math.min(size, (edgeAt(y + size * LH) - 44 - 56) / (l.text.length * 0.7));
    y += size * LH;
    return { ...l, size: Math.floor(size) };
  });
  const textBottom = y;
  const mH = Math.round(Math.min(mascotH ?? 420, 720 - textBottom - 26, 420));
  const mascotRight = 60 + mH * 0.86;
  const badgeRoom = 1280 - 34 - mascotRight - 36;
  const badgeSize = Math.floor(Math.min(54, badgeRoom / (badge.length * 0.62 + 1.4)));
  return (
  <AbsoluteFill style={{ background: C.ink, fontFamily: FONT, overflow: "hidden" }}>
    <div style={{ position: "absolute", left: panelTop - 258, top: 0, right: 0, bottom: 0, overflow: "hidden" }}>
      <Img
        src={staticFile(photo)}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: position, transform: `scale(${flip ? -zoom : zoom}, ${zoom})`, filter: "saturate(1.18) contrast(1.06) brightness(1.03)" }}
      />
    </div>
    {/* panneau en biais + liseré */}
    <div style={{ position: "absolute", inset: 0, background: C.ink, clipPath: `polygon(0 0, ${panelTop + 18}px 0, ${panelTop - 122}px 100%, 0 100%)` }} />
    <div style={{ position: "absolute", inset: 0, background: C.coral, clipPath: `polygon(0 0, ${panelTop}px 0, ${panelTop - 140}px 100%, 0 100%)` }} />
    <div style={{ position: "absolute", inset: 0, clipPath: `polygon(0 0, ${panelTop}px 0, ${panelTop - 140}px 100%, 0 100%)`, backgroundImage: "radial-gradient(rgba(255,255,255,0.16) 3px, transparent 3.5px)", backgroundSize: "34px 34px" }} />
    {/* mots géants */}
    <div style={{ position: "absolute", left: 44, top: TOP, transform: "rotate(-3deg)", transformOrigin: "left top" }}>
      {fitted.map((l, i) => (
        <div key={i} style={{ fontSize: l.size, fontWeight: 900, lineHeight: LH, letterSpacing: -2, color: l.hi ? C.sun : C.white, ...stroke(14), textShadow: `0 10px 0 ${C.ink}`, whiteSpace: "nowrap" }}>
          {l.text}
        </div>
      ))}
    </div>
    {/* mascotte */}
    <Img src={staticFile(`brand/mascot-${mascot}.png`)} style={{ position: "absolute", left: 60, bottom: -6, height: mH, filter: "drop-shadow(0 12px 0 rgba(27,42,65,0.35))" }} />
    {/* pastille promesse */}
    <div style={{ position: "absolute", right: 34, bottom: 36, transform: "rotate(-4deg)", background: C.sun, color: C.ink, border: `7px solid ${C.ink}`, borderRadius: 26, padding: "12px 30px", fontSize: badgeSize, fontWeight: 900, letterSpacing: 0.5, boxShadow: `0 9px 0 ${C.ink}`, whiteSpace: "nowrap" }}>
      {badge}
    </div>
    <div style={{ position: "absolute", top: 26, right: 30, background: C.paper, padding: "8px 16px", borderRadius: 16, border: `4px solid ${C.ink}` }}>
      <Logo size={34} />
    </div>
    {probe && <OverflowProbe />}
  </AbsoluteFill>
);
};
