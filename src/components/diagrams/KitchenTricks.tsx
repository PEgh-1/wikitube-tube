// Schémas des astuces de cuisine.
// Modes : "board" (planche posée sur un torchon humide : elle ne glisse plus), "egg" (test de l'œuf dans l'eau froide :
// à plat = très frais, incliné = plus vieux, flotte = à jeter), "bread" (pain rassis : eau + chaleur, l'humidité devient vapeur),
// "herbs" (herbes tendres comme des fleurs : tiges coupées, un fond d'eau, sac posé dessus), "ice" (œuf dur dans l'eau glacée :
// l'œuf se rétracte et la coquille se détache).
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
const WATER = "#CFE9F2";
const SHELL = "#E8C9A0";
const CRUST = "#D9A05B";
const LEAF = "#5BAA6A";

export const KitchenTricks: React.FC<{ mode: string; local: number; width?: number }> = ({ mode, local, width = 800 }) => {
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

  // ---------- test de l'œuf : trois verres ----------
  if (mode === "egg") {
    const drop = (from: number) => interpolate(local, [from, from + 26], [0, 1], { ...clamp, easing: ease });
    const glasses = [
      { x: 170, text: "Very fresh", color: C.teal, rot: 90, rest: 398 },
      { x: 400, text: "Older", color: C.ink, rot: 0, rest: 380 },
      { x: 630, text: "Throw away", color: C.coral, rot: 0, rest: 236 },
    ];
    return svg(
      <>
        {label(400, 64, "The cold water test", 48, C.ink, "middle")}
        {label(400, 122, "Sinks flat: very fresh. Floats: too old", 38, C.teal, "middle")}
        {glasses.map((g, i) => {
          const k = drop(8 + i * 22);
          const y = 190 + (g.rest - 190) * k + (i === 2 ? Math.sin(local / 8) * 4 * k : 0);
          return (
            <g key={i}>
              <rect x={g.x - 76} y={216} width={152} height={214} fill={WATER} />
              <path d={`M${g.x - 80} 170 V434 H${g.x + 80} V170`} fill="none" stroke={C.ink} strokeWidth={9} strokeLinejoin="round" />
              <path d={`M${g.x - 76} 216 q19 -7 38 0 t38 0 t38 0 t38 0`} stroke={C.teal} strokeWidth={5} fill="none" strokeLinecap="round" />
              <ellipse cx={g.x} cy={y} rx={30} ry={40} fill={SHELL} stroke={C.ink} strokeWidth={7} transform={`rotate(${g.rot * k} ${g.x} ${y})`} />
              {label(g.x, 492, g.text, 38, g.color, "middle")}
            </g>
          );
        })}
      </>,
    );
  }

  // ---------- pain rassis : eau + chaleur ----------
  if (mode === "bread") {
    const wet = interpolate(local, [6, 40], [0, 1], clamp);
    const heat = interpolate(local, [40, 80], [0, 1], { ...clamp, easing: ease });
    return svg(
      <>
        {label(400, 64, "Water plus heat", 48, C.ink, "middle")}
        {label(400, 122, "The moisture turns to steam", 40, C.teal, "middle")}
        {/* four */}
        <rect x={170} y={186} width={460} height={270} rx={22} fill={C.white} stroke={C.ink} strokeWidth={9} />
        <path d="M200 424 H600" stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
        <path d="M230 448 q12 -22 24 0 M388 448 q12 -22 24 0 M546 448 q12 -22 24 0" stroke={C.coral} strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.25 + heat * 0.75} />
        {/* pain */}
        <path d="M270 418 Q262 318 400 314 Q538 318 530 418 Z" fill={CRUST} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
        <path d="M330 350 l22 26 M390 342 l22 26 M450 350 l22 26" stroke={C.ink} strokeWidth={6} strokeLinecap="round" opacity={0.55} />
        {/* gouttes sur la croûte */}
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx={300 + i * 50} cy={330 + (i % 2) * 14} r={7} fill={WATER} stroke={C.ink} strokeWidth={3} opacity={wet * (1 - heat)} />
        ))}
        {/* vapeur */}
        {[0, 1, 2].map((i) => {
          const k = frac(local / 50 + i / 3);
          return <path key={i} d={`M${330 + i * 70} ${300 - k * 70} q14 -16 0 -32 q-14 -16 0 -32`} stroke={C.teal} strokeWidth={6} fill="none" strokeLinecap="round" opacity={heat * (1 - k)} />;
        })}
        {label(400, 528, "Soft inside, crisp crust", 40, C.coral, "middle")}
      </>,
    );
  }

  // ---------- herbes tendres comme des fleurs ----------
  if (mode === "herbs") {
    const fill = interpolate(local, [8, 46], [0, 1], { ...clamp, easing: ease });
    const bag = interpolate(local, [50, 90], [0, 1], { ...clamp, easing: ease });
    const sway = Math.sin(local / 14) * 3;
    return svg(
      <>
        {label(400, 64, "Treat soft herbs like flowers", 46, C.ink, "middle")}
        {label(400, 122, "Trimmed stems, an inch of water", 40, C.teal, "middle")}
        {/* eau */}
        <rect x={326} y={440 - fill * 46} width={148} height={fill * 46} fill={WATER} />
        {/* tiges et feuilles */}
        {[-2, -1, 0, 1, 2].map((i) => (
          <g key={i} transform={`rotate(${i * 7 + sway} 400 440)`}>
            <path d="M400 436 V250" stroke={LEAF} strokeWidth={7} strokeLinecap="round" />
            <circle cx={400} cy={236} r={26} fill={LEAF} stroke={C.ink} strokeWidth={6} />
            <circle cx={378} cy={270} r={18} fill={LEAF} stroke={C.ink} strokeWidth={6} />
            <circle cx={422} cy={278} r={18} fill={LEAF} stroke={C.ink} strokeWidth={6} />
          </g>
        ))}
        {/* bocal */}
        <path d="M322 330 V444 H478 V330" fill="none" stroke={C.ink} strokeWidth={9} strokeLinejoin="round" />
        {/* sac posé sans serrer */}
        <path d="M250 330 Q240 170 400 166 Q560 170 550 330" fill="rgba(255,255,255,0.35)" stroke={C.ink} strokeWidth={6} strokeDasharray="14 10" strokeLinecap="round" opacity={bag} />
        {label(400, 528, "Change the water every couple of days", 38, C.coral, "middle")}
      </>,
    );
  }

  // ---------- œuf dur dans l'eau glacée ----------
  if (mode === "ice") {
    const shrink = interpolate(local, [20, 90], [0, 1], { ...clamp, easing: ease });
    const cubes = [
      { x: 250, y: 300, r: -12 },
      { x: 540, y: 290, r: 16 },
      { x: 300, y: 392, r: 20 },
      { x: 520, y: 386, r: -8 },
    ];
    return svg(
      <>
        {label(400, 64, "Straight into ice water", 48, C.ink, "middle")}
        {label(400, 122, "The egg shrinks away from the shell", 38, C.teal, "middle")}
        {/* bol */}
        <path d="M170 236 Q180 460 400 460 Q620 460 630 236 Z" fill={WATER} stroke={C.ink} strokeWidth={9} strokeLinejoin="round" />
        {cubes.map((c, i) => (
          <rect key={i} x={c.x - 26} y={c.y - 26 + Math.sin(local / 10 + i) * 4} width={52} height={52} rx={8} fill={C.white} stroke={C.ink} strokeWidth={6} opacity={0.9} transform={`rotate(${c.r} ${c.x} ${c.y})`} />
        ))}
        {/* coquille puis œuf qui se rétracte */}
        <ellipse cx={400} cy={338} rx={74} ry={94} fill={C.white} stroke={C.ink} strokeWidth={8} />
        <ellipse cx={400} cy={338} rx={74} ry={94} fill="none" stroke={SHELL} strokeWidth={14} opacity={0.9} />
        <ellipse cx={400} cy={338} rx={64 - shrink * 12} ry={84 - shrink * 12} fill="#FFF7E6" stroke={C.ink} strokeWidth={6} />
        <path d="M400 258 l-10 18 l16 12 l-12 16" stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={shrink} />
        {label(400, 528, "The shell comes off in large pieces", 38, C.coral, "middle")}
      </>,
    );
  }

  // ---------- planche sur torchon humide (mode par défaut : "board") ----------
  const push = Math.sin(local / 9) * interpolate(local, [0, 40, 70], [26, 26, 0], clamp);
  const towel = interpolate(local, [40, 70], [0, 1], { ...clamp, easing: ease });
  return svg(
    <>
      {label(400, 64, "A damp towel under the board", 46, C.ink, "middle")}
      {label(400, 122, "It grips the counter", 40, C.teal, "middle")}
      {/* plan de travail */}
      <path d="M90 430 H710" stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
      {/* torchon humide */}
      <rect x={216} y={404} width={368} height={22} rx={8} fill={C.teal} stroke={C.ink} strokeWidth={6} opacity={towel} />
      {/* planche */}
      <g transform={`translate(${push} 0)`}>
        <rect x={200} y={364} width={400} height={36} rx={10} fill={CRUST} stroke={C.ink} strokeWidth={8} />
        {/* couteau */}
        <path d="M330 356 L470 300 L484 326 L352 364 Z" fill={C.white} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
        <path d="M470 300 L540 270 L556 300 L484 326 Z" fill={C.ink} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
      </g>
      {/* flèches de glissement, puis coche */}
      <g opacity={1 - towel}>
        <path d="M150 382 H110 M110 382 l16 -12 M110 382 l16 12 M650 382 H690 M690 382 l-16 -12 M690 382 l-16 12" stroke={C.coral} strokeWidth={7} fill="none" strokeLinecap="round" />
      </g>
      <g opacity={towel}>
        <circle cx={660} cy={330} r={34} fill={C.teal} stroke={C.ink} strokeWidth={7} />
        <path d="M644 330 l12 12 l22 -24" stroke={C.white} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {label(400, 528, "A stable board, a safer knife", 40, C.coral, "middle")}
    </>,
  );
};
