// Schéma en coupe : la casserole de pâtes.
// Modes : "boil" (grande casserole, les pâtes bougent librement), "salt" (le sel assaisonne l'eau, les pâtes en absorbent un peu),
// "dente" (coupe d'une pâte : le point blanc au centre), "starch" (eau trouble chargée d'amidon, une tasse la prélève),
// "sauce" (poêle : pâtes + sauce + un trait d'eau de cuisson, la sauce enrobe).
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
const PASTA = "#F2D58A";
const SAUCE = "#E2472F";

/** Un tube de penne vu de côté. */
const Penne: React.FC<{ x: number; y: number; r: number; fill?: string }> = ({ x, y, r, fill = PASTA }) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    <path d="M-24 -9 L20 -9 L28 9 L-16 9 Z" fill={fill} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
  </g>
);

export const PastaPot: React.FC<{ mode: string; local: number; width?: number }> = ({ mode, local, width = 800 }) => {
  const label = (x: number, y: number, text: string, size = 40, color: string = C.ink, anchor: "start" | "middle" | "end" = "start") => (
    <text x={x} y={y} fontFamily={HAND} fontWeight={700} fontSize={fitSize(text, size, x, anchor)} fill={color} textAnchor={anchor}>
      {text}
    </text>
  );
  const svg = (children: React.ReactNode) => (
    <svg width={width} height={(width * 560) / 800} viewBox="0 0 800 560" style={{ display: "block" }}>
      {children}
    </svg>
  );

  // ---------- coupe d'une pâte : le point blanc ----------
  if (mode === "dente") {
    const dot = interpolate(local, [20, 110], [34, 9], { ...clamp, easing: ease });
    return svg(
      <>
        {label(400, 64, "Bite one piece", 48, C.ink, "middle")}
        {label(400, 122, "Soft, with a slight firmness inside", 38, C.teal, "middle")}
        <circle cx={400} cy={316} r={130} fill={PASTA} stroke={C.ink} strokeWidth={9} />
        <circle cx={400} cy={316} r={dot} fill={C.white} stroke={C.ink} strokeWidth={5} strokeDasharray="10 8" />
        <path d="M560 250 Q500 262 440 300" stroke={C.coral} strokeWidth={7} fill="none" strokeLinecap="round" />
        <path d="M440 300 l24 -4 M440 300 l10 -22" stroke={C.coral} strokeWidth={7} strokeLinecap="round" />
        {label(690, 236, "White dot?", 38, C.coral, "middle")}
        {label(400, 528, "It needs another minute", 40, C.coral, "middle")}
      </>,
    );
  }

  // ---------- poêle : finir dans la sauce ----------
  if (mode === "sauce") {
    const coat = interpolate(local, [30, 110], [0, 1], { ...clamp, easing: ease });
    const splash = interpolate(local, [10, 50], [0, 1], clamp);
    const toss = Math.sin(local / 7) * 6;
    const pieces = [0, 1, 2, 3, 4, 5, 6];
    return svg(
      <>
        {label(400, 64, "Finish the pasta in the sauce", 46, C.ink, "middle")}
        {label(400, 122, "A splash of pasta water helps it cling", 38, C.teal, "middle")}
        {/* poêle en coupe */}
        <path d="M170 300 L210 420 H590 L630 300" fill={C.white} stroke={C.ink} strokeWidth={9} strokeLinejoin="round" />
        <path d="M630 312 H770" stroke={C.ink} strokeWidth={16} strokeLinecap="round" />
        <path d="M188 356 L208 416 H592 L612 356 Z" fill={SAUCE} opacity={0.9} />
        {pieces.map((i) => (
          <Penne key={i} x={250 + i * 50} y={372 + (i % 2 ? 14 : -8) + (i % 3 === 0 ? toss : -toss)} r={i * 37 - 30} fill={coat > i / 9 ? "#F0A45C" : PASTA} />
        ))}
        {/* trait d'eau de cuisson */}
        <g opacity={1 - interpolate(local, [50, 80], [0, 1], clamp)}>
          <rect x={300} y={170} width={60} height={56} rx={8} fill={C.white} stroke={C.ink} strokeWidth={6} transform="rotate(-28 330 198)" />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={372 + i * 6} cy={232 + splash * (70 + i * 22)} r={8} fill="#CFE3EA" stroke={C.ink} strokeWidth={4} />
          ))}
        </g>
        {/* flammes */}
        <path d="M280 470 q10 -26 20 0 M390 470 q10 -26 20 0 M500 470 q10 -26 20 0" stroke={C.coral} strokeWidth={7} fill="none" strokeLinecap="round" />
        {label(400, 528, "The sauce coats every piece", 40, C.coral, "middle")}
      </>,
    );
  }

  // ---------- casserole en coupe : boil, salt, starch ----------
  const salt = mode === "salt";
  const starch = mode === "starch";
  const L = 230;
  const R = 570;
  const TOP = 190;
  const BOT = 440;
  const WATER = TOP + 34;
  const cloud = starch ? interpolate(local, [6, 60], [0, 1], { ...clamp, easing: ease }) : 0;
  const bubbles = [0, 1, 2, 3, 4, 5, 6];
  const pasta = [0, 1, 2, 3, 4, 5];
  const grains = [0, 1, 2, 3, 4, 5, 6, 7];
  const scoop = starch ? interpolate(local, [50, 100], [0, 1], { ...clamp, easing: ease }) : 0;
  return svg(
    <>
      {/* eau */}
      <rect x={L + 5} y={WATER} width={R - L - 10} height={BOT - WATER - 5} fill={starch ? "#E9E3CF" : "#CFE9F2"} opacity={starch ? 0.55 + cloud * 0.45 : 1} />
      <path d={`M${L + 5} ${WATER} q28 ${-8 + Math.sin(local / 5) * 5} 56 0 t56 0 t56 0 t56 0 t56 0 t50 0`} stroke={C.teal} strokeWidth={6} fill="none" strokeLinecap="round" />
      {/* casserole */}
      <path d={`M${L} ${TOP} V${BOT} H${R} V${TOP}`} fill="none" stroke={C.ink} strokeWidth={10} strokeLinejoin="round" />
      <path d={`M${L} ${TOP + 30} H${L - 50} M${R} ${TOP + 30} H${R + 50}`} stroke={C.ink} strokeWidth={14} strokeLinecap="round" />
      {/* flammes */}
      <path d={`M${L + 50} 486 q10 -26 20 0 M${L + 160} 486 q10 -26 20 0 M${L + 270} 486 q10 -26 20 0`} stroke={C.coral} strokeWidth={7} fill="none" strokeLinecap="round" />
      {/* bulles */}
      {bubbles.map((i) => {
        const k = frac(local / 50 + i / 7);
        return <circle key={i} cx={L + 40 + i * 46} cy={BOT - 16 - k * (BOT - WATER - 30)} r={5 + (i % 3) * 3} fill="none" stroke={C.white} strokeWidth={4} opacity={1 - k * 0.6} />;
      })}
      {/* pâtes qui circulent */}
      {pasta.map((i) => {
        const k = frac(local / 120 + i / 6);
        const x = (L + R) / 2 + Math.cos(k * Math.PI * 2 + i) * 110;
        const y = (WATER + BOT) / 2 + 16 + Math.sin(k * Math.PI * 2 + i) * 70;
        return <Penne key={i} x={x} y={y} r={k * 360 + i * 50} />;
      })}
      {/* sel : les grains tombent et se dissolvent */}
      {salt &&
        grains.map((i) => {
          const k = frac(local / 60 + i / 8);
          const y = 150 + k * (BOT - 180);
          return <rect key={i} x={L + 60 + i * 34} y={y} width={10} height={10} rx={2} fill={C.white} stroke={C.ink} strokeWidth={3} opacity={y > WATER ? Math.max(0, 1 - (y - WATER) / 120) : 1} transform={`rotate(${i * 30 + local * 3} ${L + 65 + i * 34} ${y + 5})`} />;
        })}
      {/* amidon : particules troubles + tasse qui prélève */}
      {starch &&
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <circle key={i} cx={L + 30 + ((i * 67) % (R - L - 60))} cy={WATER + 30 + ((i * 41) % (BOT - WATER - 60)) + Math.sin(local / 9 + i) * 6} r={5} fill={C.white} opacity={cloud * 0.9} />
        ))}
      {starch && (
        <g transform={`translate(${R + 110} ${WATER - 10 - scoop * 60}) rotate(${-20 + scoop * 20})`}>
          <path d="M-34 -30 V30 H34 V-30 Z" fill={C.white} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
          <path d="M34 -14 q30 14 0 34" fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
          <rect x={-30} y={30 - scoop * 46} width={60} height={scoop * 46} fill="#E9E3CF" />
        </g>
      )}
      {mode === "boil" && (
        <>
          {label(400, 64, "Plenty of water", 48, C.ink, "middle")}
          {label(400, 122, "The pasta moves freely", 40, C.teal, "middle")}
          {label(400, 540, "Small pot = sticky clump", 38, C.coral, "middle")}
        </>
      )}
      {salt && (
        <>
          {label(400, 64, "Salt seasons the pasta inside", 46, C.ink, "middle")}
          {label(400, 122, "Most of it stays in the water", 40, C.teal, "middle")}
          {label(400, 540, "Like mild seawater", 38, C.coral, "middle")}
        </>
      )}
      {starch && (
        <>
          {label(400, 64, "Cloudy water = starch and salt", 46, C.ink, "middle")}
          {label(400, 122, "Scoop out a mug before draining", 40, C.teal, "middle")}
          {label(400, 540, "It makes the sauce silky", 38, C.coral, "middle")}
        </>
      )}
    </>,
  );
};
