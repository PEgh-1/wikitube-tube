// Schéma de face : une fermeture éclair et son curseur.
// Modes : "snag" (du tissu pris dans les dents : on recule le curseur, le tissu se dégage),
// "split" (curseur détendu : les dents s'ouvrent derrière lui, puis la pince le resserre et elles tiennent),
// "track" (curseur sorti : on aligne les deux rangées, on l'enfile par le bas, il referme en montant).
import React from "react";
import { interpolate, Easing } from "remotion";
import { C } from "../../theme";
import { HAND } from "../brand";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.inOut(Easing.cubic);
/** Garde-fou des légendes : réduit le corps si le texte dépasserait du cadre (viewBox large de 800). */
const fitSize = (text: string, size: number, x: number, anchor: "start" | "middle" | "end", vw = 800) => {
  const room = anchor === "middle" ? 2 * Math.min(x, vw - x) - 20 : anchor === "end" ? x - 10 : vw - x - 10;
  const est = text.length * size * 0.5;
  return est > room ? Math.max(18, Math.floor((size * room) / est)) : size;
};
const METAL = "#C9CED6";
const CX = 400;
const TOP = 170;
const BOT = 470;
const N = 13;

/** Curseur vu de face, centré sur (x, y). `grip` < 1 : curseur détendu (plus large). */
const Slider: React.FC<{ x: number; y: number; wide?: number; rot?: number }> = ({ x, y, wide = 0, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <path d={`M${-30 - wide} -30 Q0 -44 ${30 + wide} -30 L${20 + wide / 2} 30 H${-20 - wide / 2} Z`} fill={C.coral} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
    <rect x={-9} y={22} width={18} height={50} rx={9} fill={C.white} stroke={C.ink} strokeWidth={6} />
  </g>
);

export const ZipperSlider: React.FC<{ mode: string; local: number; width?: number }> = ({ mode, local, width = 800 }) => {
  const label = (x: number, y: number, text: string, size = 40, color: string = C.ink, anchor: "start" | "middle" | "end" = "start") => (
    <text x={x} y={y} fontFamily={HAND} fontWeight={700} fontSize={fitSize(text, size, x, anchor)} fill={color} textAnchor={anchor}>
      {text}
    </text>
  );
  const snag = mode === "snag";
  const split = mode === "split";
  const track = mode === "track";

  // position du curseur et état des dents selon le mode
  let sy = 300; // y du curseur
  let gap = 0; // écart des dents « fermées » sous le curseur (mode split)
  let wide = 0;
  let sx = CX;
  let rot = 0;
  let fabric = 0; // 1 = tissu pris, 0 = dégagé
  let squeeze = 0;
  let closedBelow = true;
  if (snag) {
    const back = interpolate(local, [30, 70], [0, 1], { ...clamp, easing: ease });
    sy = 290 + back * 46;
    fabric = 1 - interpolate(local, [70, 115], [0, 1], { ...clamp, easing: ease });
  } else if (split) {
    squeeze = interpolate(local, [55, 85], [0, 1], { ...clamp, easing: ease });
    const up = interpolate(local, [85, 135], [0, 1], { ...clamp, easing: ease });
    const down = interpolate(local, [0, 45], [0, 1], { ...clamp, easing: ease });
    sy = 260 + down * 170 - up * 190;
    gap = (1 - squeeze) * 22;
    wide = (1 - squeeze) * 12;
  } else {
    const on = interpolate(local, [20, 60], [0, 1], { ...clamp, easing: ease });
    const up = interpolate(local, [65, 125], [0, 1], { ...clamp, easing: ease });
    sx = CX - 90 * (1 - on);
    rot = -24 * (1 - on);
    sy = BOT - 10 - up * 230;
    closedBelow = on >= 1;
  }

  const teeth = Array.from({ length: N }, (_, i) => {
    const y = TOP + (i * (BOT - TOP)) / (N - 1);
    const below = y > sy + 6;
    let off: number;
    if (below && closedBelow) off = 9 + gap + (split ? Math.sin(i * 1.7) * gap * 0.25 : 0);
    else if (track && !closedBelow) off = 26;
    else off = 9 + Math.min(84, Math.max(0, (sy - y) * 0.42 + 16));
    return { y, off, side: i % 2 };
  });

  return (
    <svg width={width} height={(width * 560) / 800} viewBox="0 0 800 560" style={{ display: "block" }}>
      {/* rubans */}
      <path d={`M${CX - teeth[0].off - 26} ${TOP - 20} L${CX - 40} ${BOT + 20} H${CX - 150} V${TOP - 20} Z`} fill="#DCE6F2" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M${CX + teeth[0].off + 26} ${TOP - 20} L${CX + 40} ${BOT + 20} H${CX + 150} V${TOP - 20} Z`} fill="#DCE6F2" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      {/* dents */}
      {teeth.map((t, i) => (
        <g key={i}>
          <rect x={CX - t.off - 22} y={t.y - 7 + (t.side ? 0 : 6)} width={26} height={12} rx={4} fill={METAL} stroke={C.ink} strokeWidth={4} />
          <rect x={CX + t.off - 4} y={t.y - 7 + (t.side ? 6 : 0)} width={26} height={12} rx={4} fill={METAL} stroke={C.ink} strokeWidth={4} />
        </g>
      ))}
      {/* tissu pris */}
      {snag && fabric > 0.02 && (
        <path d={`M${CX - 150} ${sy - 70} Q${CX - 60 - (1 - fabric) * 70} ${sy - 40} ${CX - 6 - (1 - fabric) * 110} ${sy - 22} Q${CX - 70 - (1 - fabric) * 60} ${sy - 4} ${CX - 150} ${sy + 10} Z`} fill={C.teal} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" opacity={0.92} />
      )}
      {/* butée basse */}
      {!(track && !closedBelow) && <rect x={CX - 20} y={BOT + 14} width={40} height={14} rx={4} fill={C.ink} />}
      <Slider x={sx} y={sy} wide={wide} rot={rot} />
      {/* pince (mode split) */}
      {split && local > 40 && local < 95 && (
        <g opacity={interpolate(local, [40, 50, 86, 95], [0, 1, 1, 0], clamp)}>
          <path d={`M${CX - 150} ${sy} H${CX - 44 - wide + squeeze * 4}`} stroke={C.ink} strokeWidth={14} strokeLinecap="round" />
          <path d={`M${CX + 150} ${sy} H${CX + 44 + wide - squeeze * 4}`} stroke={C.ink} strokeWidth={14} strokeLinecap="round" />
        </g>
      )}
      {/* flèche de recul (mode snag) */}
      {snag && (
        <g opacity={interpolate(local, [20, 35, 70, 85], [0, 1, 1, 0], clamp)}>
          <path d={`M${CX + 120} ${250} V${350}`} stroke={C.coral} strokeWidth={8} strokeLinecap="round" />
          <path d={`M${CX + 120} ${350} l-14 -20 M${CX + 120} ${350} l14 -20`} stroke={C.coral} strokeWidth={8} strokeLinecap="round" />
        </g>
      )}
      {snag && (
        <>
          {label(400, 64, "Fabric caught in the teeth", 46, C.ink, "middle")}
          {label(400, 118, "Back the slider up, then lift it out", 38, C.teal, "middle")}
          {label(400, 540, "Never pull harder", 38, C.coral, "middle")}
        </>
      )}
      {split && (
        <>
          {label(400, 64, "A stretched slider stops gripping", 44, C.ink, "middle")}
          {label(400, 118, "The teeth open up behind it", 38, C.teal, "middle")}
          {label(400, 540, "Tiny squeezes, then test", 38, C.coral, "middle")}
        </>
      )}
      {track && (
        <>
          {label(400, 64, "Line up both rows of teeth", 46, C.ink, "middle")}
          {label(400, 118, "Slide it on from the bottom", 38, C.teal, "middle")}
          {label(400, 540, "Then fit the stop back", 38, C.coral, "middle")}
        </>
      )}
    </svg>
  );
};
