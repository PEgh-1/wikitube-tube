// Schéma en coupe : pourquoi le blanc jaunit et comment le trempage, l'oxygène actif et le soleil le rattrapent.
// Modes : "buildup" (dépôts dans les fibres), "soak" (bassine, les dépôts se détachent), "oxygen" (bulles, couvercle posé), "sun" (séchage au soleil).
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

const YELLOW = "#E3B23C";
const WATER = "#BFE3EE";
const frac = (x: number) => ((x % 1) + 1) % 1;

export const WhitenSoak: React.FC<{ mode: string; local: number; width?: number }> = ({ mode, local, width = 800 }) => {
  const label = (x: number, y: number, text: string, size = 40, color: string = C.ink, anchor: "start" | "middle" | "end" = "start") => (
    <text x={x} y={y} fontFamily={HAND} fontWeight={700} fontSize={fitSize(text, size, x, anchor)} fill={color} textAnchor={anchor}>
      {text}
    </text>
  );
  const basin = mode === "soak" || mode === "oxygen";
  const threads = [215, 305, 395];
  const thread = (y: number) => `M90 ${y} Q165 ${y - 30} 240 ${y} T390 ${y} T540 ${y} T690 ${y}`;
  // dépôts : 12 grains qui apparaissent l'un après l'autre sur les fibres
  const grains = Array.from({ length: 12 }, (_, i) => ({ x: 170 + ((i * 137) % 460), y: threads[i % 3] + ((i * 53) % 24) - 12, at: 8 + i * 9 }));
  const fade = mode === "sun" ? interpolate(local % 170, [25, 120], [0.85, 0], { ...clamp, easing: ease }) : 0;
  return (
    <svg width={width} height={(width * 560) / 800} viewBox="0 0 800 560" style={{ display: "block" }}>
      {mode === "buildup" && (
        <>
          <defs>
            <clipPath id="ws-swatch">
              <rect x={110} y={150} width={580} height={310} rx={26} />
            </clipPath>
          </defs>
          <rect x={110} y={150} width={580} height={310} rx={26} fill={C.mint} />
          <g clipPath="url(#ws-swatch)">
            {threads.map((y) => (
              <g key={y}>
                <path d={thread(y)} stroke={C.ink} strokeWidth={46} fill="none" strokeLinecap="round" />
                <path d={thread(y)} stroke={C.white} strokeWidth={30} fill="none" strokeLinecap="round" />
              </g>
            ))}
            {grains.map((g, i) => {
              const s = interpolate(local, [g.at, g.at + 10], [0, 1], { ...clamp, easing: ease });
              return <circle key={i} cx={g.x} cy={g.y} r={(11 + (i % 3) * 3) * s} fill={YELLOW} stroke={C.ink} strokeWidth={4} />;
            })}
          </g>
          <rect x={110} y={150} width={580} height={310} rx={26} fill="none" stroke={C.ink} strokeWidth={9} />
          {label(400, 62, "Sweat, deodorant, detergent residue", 42, C.ink, "middle")}
          {label(400, 116, "build up in the fibres", 42, C.coral, "middle")}
          {label(400, 528, "Washing doesn't remove it", 44, C.teal, "middle")}
        </>
      )}
      {basin && (
        <>
          {/* bassine en coupe et eau */}
          <path d="M172 232 L196 470 Q198 486 216 486 H584 Q602 486 604 470 L628 232 Z" fill={WATER} />
          <path d="M150 190 L190 470 Q194 492 216 492 H584 Q606 492 610 470 L650 190" fill="none" stroke={C.ink} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M172 232 H628" stroke={C.ink} strokeWidth={5} strokeDasharray="18 12" strokeDashoffset={local} />
          {/* linge immergé */}
          <path d="M250 440 Q250 380 320 372 Q400 350 480 372 Q552 380 552 440 Q552 468 500 468 H300 Q250 468 250 440 Z" fill={C.white} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
          <path d="M300 420 Q400 396 500 420" stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.5} />
          {mode === "soak" &&
            [0, 1, 2, 3, 4, 5, 6].map((i) => {
              const k = frac(local / 80 + i / 7);
              return <circle key={i} cx={290 + i * 37 + Math.sin(local / 12 + i) * 8} cy={380 - k * 125} r={10 - k * 3} fill={YELLOW} stroke={C.ink} strokeWidth={3} opacity={1 - k * 0.85} />;
            })}
          {mode === "soak" && (
            <>
              {label(400, 66, "A soak removes the buildup", 46, C.ink, "middle")}
              {label(400, 128, "Washing alone doesn't", 40, C.coral, "middle")}
              {label(400, 546, "Then rinse well", 42, C.teal, "middle")}
            </>
          )}
          {mode === "oxygen" && (
            <>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
                const k = frac(local / 55 + i / 9);
                return <circle key={i} cx={270 + i * 32 + Math.sin(local / 9 + i * 2) * 7} cy={372 - k * 135} r={6 + (i % 3) * 3} fill={C.white} stroke={C.ink} strokeWidth={4} opacity={1 - k * 0.5} />;
              })}
              {/* couvercle simplement posé : il reste un jour à droite */}
              <g transform="rotate(-5 150 178)">
                <rect x={132} y={156} width={540} height={24} rx={10} fill="#DDE3EC" stroke={C.ink} strokeWidth={8} />
                <rect x={370} y={136} width={64} height={22} rx={8} fill={C.ink} />
              </g>
              <path d="M690 176 Q716 150 694 124 Q676 104 700 84" stroke={C.teal} strokeWidth={7} fill="none" strokeLinecap="round" strokeDasharray="12 12" strokeDashoffset={local * 1.6} />
              {label(400, 56, "Oxygen breaks down the stains", 44, C.ink, "middle")}
              {label(400, 546, "Loose lid, never closed", 44, C.coral, "middle")}
            </>
          )}
        </>
      )}
      {mode === "sun" && (
        <>
          {/* soleil */}
          <g transform={`rotate(${local * 0.8} 120 150)`}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <path key={i} d="M120 72 V52" stroke={C.ink} strokeWidth={8} strokeLinecap="round" transform={`rotate(${i * 45} 120 150)`} />
            ))}
          </g>
          <circle cx={120} cy={150} r={52} fill={C.sun} stroke={C.ink} strokeWidth={9} />
          {/* rayons vers le linge */}
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M190 ${176 + i * 22} L${372 - i * 14} ${262 + i * 62}`} stroke={C.sun} strokeWidth={9} strokeLinecap="round" strokeDasharray="18 16" strokeDashoffset={-local * 2.4} />
          ))}
          {/* corde et chemise */}
          <path d="M250 172 H790" stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
          <path d="M440 190 L400 190 L330 240 L365 292 L400 268 L400 440 L640 440 L640 268 L675 292 L710 240 L640 190 L600 190 Q520 240 440 190 Z" fill={C.white} stroke={C.ink} strokeWidth={9} strokeLinejoin="round" />
          <path d="M440 190 L400 190 L330 240 L365 292 L400 268 L400 440 L640 440 L640 268 L675 292 L710 240 L640 190 L600 190 Q520 240 440 190 Z" fill={YELLOW} opacity={fade} />
          {[412, 628].map((x) => (
            <rect key={x} x={x - 8} y={150} width={16} height={48} rx={5} fill="#E9C08A" stroke={C.ink} strokeWidth={5} />
          ))}
          {label(770, 70, "Direct sun, a couple of hours", 38, C.coral, "end")}
          {label(400, 530, "UV light fades yellow tones", 46, C.ink, "middle")}
        </>
      )}
    </svg>
  );
};
