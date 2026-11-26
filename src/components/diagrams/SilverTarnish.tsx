// Schéma : pourquoi l'argent noircit et comment la ternissure s'en va.
// Modes : "tarnish" (le soufre de l'air se dépose, la bague s'assombrit), "layer" (coupe : fine couche sombre en surface, qui s'enlève),
// "foil" (bain chaud : la ternissure quitte l'argent et passe sur la feuille d'aluminium).
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
const SILVER = "#DDE3EC";
const DARK = "#5A5148";
const mix = (t: number) => {
  // de l'argent clair (t = 0) à la ternissure (t = 1)
  const a = [0xdd, 0xe3, 0xec];
  const b = [0x5a, 0x51, 0x48];
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};
const Sparkle: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <path d={`M${x} ${y - 18 * s} L${x + 5 * s} ${y - 5 * s} L${x + 18 * s} ${y} L${x + 5 * s} ${y + 5 * s} L${x} ${y + 18 * s} L${x - 5 * s} ${y + 5 * s} L${x - 18 * s} ${y} L${x - 5 * s} ${y - 5 * s} Z`} fill={C.sun} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
);

export const SilverTarnish: React.FC<{ mode: string; local: number; width?: number }> = ({ mode, local, width = 800 }) => {
  const label = (x: number, y: number, text: string, size = 40, color: string = C.ink, anchor: "start" | "middle" | "end" = "start") => (
    <text x={x} y={y} fontFamily={HAND} fontWeight={700} fontSize={fitSize(text, size, x, anchor)} fill={color} textAnchor={anchor}>
      {text}
    </text>
  );
  const grow = interpolate(local, [10, 90], [0, 1], { ...clamp, easing: ease });
  return (
    <svg width={width} height={(width * 560) / 800} viewBox="0 0 800 560" style={{ display: "block" }}>
      {mode === "tarnish" && (
        <>
          {/* bague de face : elle s'assombrit à mesure que le soufre se dépose */}
          <circle cx={400} cy={320} r={118} fill="none" stroke={C.ink} strokeWidth={62} />
          <circle cx={400} cy={320} r={118} fill="none" stroke={mix(grow * 0.9)} strokeWidth={46} />
          <circle cx={400} cy={320} r={95} fill={C.paper} stroke={C.ink} strokeWidth={8} />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const k = frac(local / 80 + i / 8);
            const side = i % 2 ? 1 : -1;
            const x0 = 400 + side * (250 + (i % 3) * 40);
            const y0 = 190 + ((i * 53) % 220);
            const x1 = 400 + side * 128;
            const y1 = 320 + ((i * 37) % 120) - 60;
            return <circle key={i} cx={x0 + (x1 - x0) * k} cy={y0 + (y1 - y0) * k} r={11} fill={C.coral} stroke={C.ink} strokeWidth={4} opacity={interpolate(k, [0, 0.15, 0.85, 1], [0, 1, 1, 0], clamp)} />;
          })}
          {label(400, 64, "Sulfur reacts with silver", 46, C.ink, "middle")}
          {label(400, 122, "Air and moisture speed it up", 38, C.coral, "middle")}
          {label(400, 528, "The surface turns dull and dark", 38, C.teal, "middle")}
        </>
      )}
      {mode === "layer" && (
        <>
          {/* coupe : métal clair, fine couche sombre en surface, chiffon qui l'emporte */}
          <rect x={90} y={270} width={620} height={170} rx={18} fill={SILVER} stroke={C.ink} strokeWidth={8} />
          <rect x={94 + 612 * grow} y={258} width={612 * (1 - grow)} height={20} rx={8} fill={DARK} stroke={C.ink} strokeWidth={5} opacity={grow >= 0.995 ? 0 : 1} />
          <g transform={`translate(${94 + 612 * grow} 232)`}>
            <rect x={-46} y={-8} width={92} height={40} rx={12} fill={C.teal} stroke={C.ink} strokeWidth={6} />
            <path d="M-26 -22 q9 -11 18 0 M6 -26 q9 -11 18 0" stroke={C.teal} strokeWidth={5} fill="none" strokeLinecap="round" />
          </g>
          {grow > 0.25 && <Sparkle x={94 + 612 * grow * 0.35} y={236} s={interpolate(grow, [0.25, 0.5], [0, 1], clamp)} />}
          {label(400, 64, "Tarnish is only on the surface", 44, C.ink, "middle")}
          {label(400, 122, "A thin layer, and it comes off", 38, C.coral, "middle")}
          {label(400, 372, "Solid silver underneath", 38, C.ink, "middle")}
          {label(400, 528, "Gentle rubbing, light pressure", 38, C.teal, "middle")}
        </>
      )}
      {mode === "foil" && (
        <>
          {/* bol en coupe, eau chaude, feuille d'aluminium au fond, bague posée dessus */}
          <path d="M150 200 Q160 450 260 450 H540 Q640 450 650 200" fill={C.mint} stroke={C.ink} strokeWidth={9} strokeLinejoin="round" />
          <path d="M150 200 H650" stroke={C.ink} strokeWidth={9} strokeLinecap="round" />
          <path d="M214 428 H586" stroke={mix(grow * 0.75)} strokeWidth={20} strokeLinecap="round" />
          <path d="M214 428 H586" stroke={C.ink} strokeWidth={5} strokeDasharray="14 12" strokeLinecap="round" opacity={0.5} />
          <ellipse cx={400} cy={388} rx={84} ry={30} fill="none" stroke={C.ink} strokeWidth={30} />
          <ellipse cx={400} cy={388} rx={84} ry={30} fill="none" stroke={mix(0.9 * (1 - grow))} strokeWidth={18} />
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const k = frac(local / 60 + i / 6);
            const x = 320 + i * 32;
            return <circle key={i} cx={x + Math.sin(i * 2.1) * 60 * k} cy={388 + 34 * k} r={8} fill={DARK} opacity={grow < 0.98 ? interpolate(k, [0, 0.2, 0.8, 1], [0, 1, 1, 0], clamp) : 0} />;
          })}
          {[0, 1, 2, 3].map((i) => {
            const k = frac(local / 50 + i / 4);
            return <circle key={`b${i}`} cx={270 + i * 88} cy={360 - 140 * k} r={7 + (i % 2) * 3} fill="none" stroke={C.teal} strokeWidth={4} opacity={1 - k} />;
          })}
          {grow > 0.7 && <Sparkle x={500} y={346} s={interpolate(grow, [0.7, 0.95], [0, 1], clamp)} />}
          {label(400, 64, "The tarnish moves to the foil", 44, C.ink, "middle")}
          {label(400, 122, "Hot water and baking soda", 38, C.coral, "middle")}
          {label(400, 528, "The silver must touch the foil", 38, C.teal, "middle")}
        </>
      )}
    </svg>
  );
};
