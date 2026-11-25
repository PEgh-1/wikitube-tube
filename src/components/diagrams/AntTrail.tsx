// Schéma en coupe : la piste odorante des fourmis, du nid dehors jusqu'à la miette, à travers une fissure du mur.
// Modes : "trail" (les éclaireuses tracent la piste), "erase" (le vinaigre efface la piste, les fourmis se dispersent), "seal" (fissure bouchée, les fourmis restent dehors).
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
const frac = (x: number) => ((x % 1) + 1) % 1;
const WALL_X = 300;
const GROUND = 400;
// La piste : du nid (dehors, à gauche) à la fissure au pied du mur, puis sur le plan de travail jusqu'à la miette.
const pos = (k: number) => {
  if (k < 0.42) return { x: 70 + (k / 0.42) * (WALL_X - 70), y: GROUND - 22 };
  if (k < 0.5) return { x: WALL_X + ((k - 0.42) / 0.08) * 26, y: GROUND - 22 - ((k - 0.42) / 0.08) * 62 };
  return { x: WALL_X + 26 + ((k - 0.5) / 0.5) * 330, y: GROUND - 84 };
};
const Ant: React.FC<{ x: number; y: number; s?: number; flip?: boolean }> = ({ x, y, s = 1.7, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <ellipse cx={-12} cy={0} rx={9} ry={7} fill={C.ink} />
    <circle cx={0} cy={0} r={5} fill={C.ink} />
    <circle cx={10} cy={-1} r={6} fill={C.ink} />
    <path d="M-10 6 L-16 14 M0 5 L0 14 M8 5 L14 14 M14 -5 L22 -12" stroke={C.ink} strokeWidth={2.5} strokeLinecap="round" />
  </g>
);

export const AntTrail: React.FC<{ mode: string; local: number; width?: number }> = ({ mode, local, width = 800 }) => {
  const label = (x: number, y: number, text: string, size = 40, color: string = C.ink, anchor: "start" | "middle" | "end" = "start") => (
    <text x={x} y={y} fontFamily={HAND} fontWeight={700} fontSize={fitSize(text, size, x, anchor)} fill={color} textAnchor={anchor}>
      {text}
    </text>
  );
  const sealed = mode === "seal";
  const erased = mode === "erase";
  // piste en pointillés : elle se dessine (trail), s'efface côté cuisine (erase), reste dehors (seal)
  const drawn = mode === "trail" ? interpolate(local, [6, 70], [0, 1], { ...clamp, easing: ease }) : 1;
  const wipe = erased ? interpolate(local, [14, 80], [0, 1], { ...clamp, easing: ease }) : 0;
  const dots = Array.from({ length: 40 }, (_, i) => i / 39);
  const ants = [0, 1, 2, 3, 4, 5];
  return (
    <svg width={width} height={(width * 560) / 800} viewBox="0 0 800 560" style={{ display: "block" }}>
      {/* sol, mur en coupe, plan de travail */}
      <path d={`M20 ${GROUND} H${WALL_X}`} stroke={C.ink} strokeWidth={9} strokeLinecap="round" />
      <path d={`M40 ${GROUND + 26} h40 M130 ${GROUND + 26} h50 M220 ${GROUND + 26} h40`} stroke={C.teal} strokeWidth={6} strokeLinecap="round" />
      <rect x={WALL_X} y={150} width={26} height={GROUND - 150 + 70} fill="#DDE3EC" stroke={C.ink} strokeWidth={8} />
      <rect x={WALL_X + 26} y={GROUND - 62} width={440} height={26} rx={8} fill={C.white} stroke={C.ink} strokeWidth={8} />
      <path d={`M${WALL_X + 70} ${GROUND - 36} V${GROUND + 70} M${WALL_X + 420} ${GROUND - 36} V${GROUND + 70}`} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
      {/* nid */}
      <path d={`M40 ${GROUND} Q70 ${GROUND - 46} 100 ${GROUND} Z`} fill="#C9A27A" stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
      {/* miette sucrée */}
      <path d={`M${WALL_X + 356} ${GROUND - 66} l26 -34 l40 8 l14 26 Z`} fill={C.sun} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" opacity={erased ? interpolate(local, [0, 20], [1, 0], clamp) : 1} />
      {/* fissure ou joint */}
      {sealed ? (
        <rect x={WALL_X - 6} y={GROUND - 84} width={38} height={76} rx={12} fill={C.mint} stroke={C.ink} strokeWidth={7} transform={`scale(1 ${interpolate(local, [6, 30], [0, 1], { ...clamp, easing: ease })})`} style={{ transformOrigin: `${WALL_X + 13}px ${GROUND - 46}px`, transformBox: "fill-box" as const }} />
      ) : (
        <path d={`M${WALL_X} ${GROUND - 18} l10 -14 l-6 -14 l12 -16 l10 -10`} stroke={C.coral} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {/* piste odorante */}
      {dots.map((k, i) => {
        const p = pos(k);
        const inside = k >= 0.5;
        const shown = k <= drawn && !(erased && inside && (k - 0.5) / 0.5 <= wipe) && !(sealed && k > 0.4);
        return shown ? <circle key={i} cx={p.x} cy={p.y + 30} r={7} fill={C.coral} opacity={0.9} /> : null;
      })}
      {/* fourmis */}
      {ants.map((i) => {
        if (mode === "trail") {
          const k = Math.min(drawn, frac(local / 150 + i / 6));
          const p = pos(k);
          return <Ant key={i} x={p.x} y={p.y} />;
        }
        if (erased) {
          const k0 = 0.55 + i * 0.07;
          const p = pos(k0);
          const t = interpolate(local, [30 + i * 6, 110 + i * 6], [0, 1], clamp);
          return <Ant key={i} x={p.x + Math.sin(i * 2.4) * 90 * t} y={p.y - (i % 2 ? 0 : 0)} flip={i % 2 === 0} />;
        }
        const k = 0.08 + frac(local / 170 + i / 6) * 0.3;
        const p = pos(k);
        return <Ant key={i} x={p.x} y={p.y} flip={frac(local / 170 + i / 6) > 0.7} />;
      })}
      {/* chiffon et vinaigre */}
      {erased && (
        <g transform={`translate(${WALL_X + 40 + wipe * 300} ${GROUND - 96})`}>
          <rect x={-34} y={0} width={68} height={30} rx={10} fill={C.teal} stroke={C.ink} strokeWidth={6} />
          <path d="M-20 -14 q8 -10 16 0 M2 -18 q8 -10 16 0" stroke={C.teal} strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
      )}
      {mode === "trail" && (
        <>
          {label(400, 64, "Scouts leave a scent trail", 46, C.ink, "middle")}
          {label(400, 122, "The colony follows it to the food", 38, C.coral, "middle")}
          {label(150, 528, "Nest outside", 36, C.teal, "middle")}
          {label(560, 528, "One crumb is enough", 36, C.ink, "middle")}
        </>
      )}
      {erased && (
        <>
          {label(400, 64, "Vinegar erases the trail", 46, C.ink, "middle")}
          {label(400, 122, "The scouts lose their way", 40, C.coral, "middle")}
          {label(400, 528, "Wipe the whole route, daily", 40, C.teal, "middle")}
        </>
      )}
      {sealed && (
        <>
          {label(400, 64, "No gap, no way in", 48, C.ink, "middle")}
          {label(400, 122, "Seal cracks with caulk", 40, C.teal, "middle")}
          {label(400, 528, "Let it dry completely", 40, C.coral, "middle")}
        </>
      )}
    </svg>
  );
};
