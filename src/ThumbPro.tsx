import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C, FONT } from "./theme";
import { Logo } from "./components/ui";

export type ThumbProProps = {
  photo: string;
  flip?: boolean;
  position?: string; // object-position de la photo
  zoom?: number;
  lines: { text: string; hi?: boolean; size?: number }[];
  badge: string;
  mascot: string; // pose : panic, chef, nose…
  mascotH?: number;
};

const stroke = (w: number): React.CSSProperties => ({ WebkitTextStroke: `${w}px ${C.ink}`, paintOrder: "stroke fill" });

/** Miniature « clic » 1280×720 : photo vive à droite, panneau corail en biais, 2-3 mots géants, mascotte, pastille promesse. */
export const ThumbPro: React.FC<ThumbProProps> = ({ photo, flip, position = "50% 50%", zoom = 1.06, lines, badge, mascot, mascotH = 330 }) => (
  <AbsoluteFill style={{ background: C.ink, fontFamily: FONT, overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 430, top: 0, right: 0, bottom: 0, overflow: "hidden" }}>
      <Img
        src={staticFile(photo)}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: position, transform: `scale(${flip ? -zoom : zoom}, ${zoom})`, filter: "saturate(1.18) contrast(1.06) brightness(1.03)" }}
      />
    </div>
    {/* panneau en biais + liseré */}
    <div style={{ position: "absolute", inset: 0, background: C.ink, clipPath: "polygon(0 0, 706px 0, 566px 100%, 0 100%)" }} />
    <div style={{ position: "absolute", inset: 0, background: C.coral, clipPath: "polygon(0 0, 688px 0, 548px 100%, 0 100%)" }} />
    <div style={{ position: "absolute", inset: 0, clipPath: "polygon(0 0, 688px 0, 548px 100%, 0 100%)", backgroundImage: "radial-gradient(rgba(255,255,255,0.16) 3px, transparent 3.5px)", backgroundSize: "34px 34px" }} />
    {/* mots géants */}
    <div style={{ position: "absolute", left: 44, top: 30, transform: "rotate(-3deg)", transformOrigin: "left top" }}>
      {lines.map((l, i) => (
        <div key={i} style={{ fontSize: l.size ?? 128, fontWeight: 900, lineHeight: 0.98, letterSpacing: -2, color: l.hi ? C.sun : C.white, ...stroke(16), textShadow: `0 10px 0 ${C.ink}`, whiteSpace: "nowrap" }}>
          {l.text}
        </div>
      ))}
    </div>
    {/* mascotte */}
    <Img src={staticFile(`brand/mascot-${mascot}.png`)} style={{ position: "absolute", left: 60, bottom: -6, height: mascotH, filter: "drop-shadow(0 12px 0 rgba(27,42,65,0.35))" }} />
    {/* pastille promesse */}
    <div style={{ position: "absolute", right: 34, bottom: 36, transform: "rotate(-4deg)", background: C.sun, color: C.ink, border: `7px solid ${C.ink}`, borderRadius: 26, padding: "12px 30px", fontSize: 54, fontWeight: 900, letterSpacing: 0.5, boxShadow: `0 9px 0 ${C.ink}`, whiteSpace: "nowrap" }}>
      {badge}
    </div>
    <div style={{ position: "absolute", top: 26, right: 30, background: C.paper, padding: "8px 16px", borderRadius: 16, border: `4px solid ${C.ink}` }}>
      <Logo size={34} />
    </div>
  </AbsoluteFill>
);
