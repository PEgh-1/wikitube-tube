// Schéma en coupe : le sèche-linge, son conduit et la sortie extérieure (peluches qui s'accumulent, chaleur piégée, brossage, air qui sort).
import React from "react";
import { interpolate, Easing } from "remotion";
import { C } from "../../theme";
import { HAND } from "../brand";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Garde-fou des légendes de schéma : réduit le corps si le texte dépasserait du cadre (viewBox large de 800). */
const fitSize = (text: string, size: number, x: number, anchor: "start" | "middle" | "end", vw = 800) => {
  const room = anchor === "middle" ? 2 * Math.min(x, vw - x) - 20 : anchor === "end" ? x - 10 : vw - x - 10;
  const est = text.length * size * 0.5;
  return est > room ? Math.max(18, Math.floor((size * room) / est)) : size;
};
const ease = Easing.inOut(Easing.cubic);

/** Modes : "lint" (les peluches passent le filtre et s'accumulent), "heat" (conduit bouché, chaleur piégée), "brush" (brosse sur perceuse), "flow" (conduit propre, air qui sort). */
export const DryerVent: React.FC<{ mode: string; local: number; width?: number }> = ({ mode, local, width = 800 }) => {
  const LINT = "#8D97A8", METAL = "#DDE3EC";
  const pulse = 1 + Math.sin(local / 5) * 0.08;
  const lint = mode === "lint", heat = mode === "heat", brush = mode === "brush", flow = mode === "flow";
  const label = (x: number, y: number, text: string, size = 40, color: string = C.ink, anchor: "start" | "middle" | "end" = "start") => (
    <text x={x} y={y} fontFamily={HAND} fontWeight={700} fontSize={fitSize(text, size, x, anchor)} fill={color} textAnchor={anchor}>
      {text}
    </text>
  );
  // quantité de peluches dans le conduit (0 → 1)
  const amount = lint ? interpolate(local, [0, 150], [0.25, 1], { ...clamp, easing: ease }) : heat ? 1 : brush ? interpolate(local, [20, 200], [1, 0.12], clamp) : 0;
  // va-et-vient de la brosse
  const p = (((local % 120) + 120) % 120) / 120;
  const tri = p < 0.6 ? p / 0.6 : 1 - (p - 0.6) / 0.4;
  const bx = 300 + 220 * ease(tri);
  // clapet extérieur : fermé quand c'est bouché, grand ouvert quand l'air passe
  const flap = flow ? -62 + Math.sin(local / 6) * 5 : lint ? -16 * (1 - amount) - 4 : brush ? -8 : 0;
  return (
    <svg width={width} height={(width * 560) / 800} viewBox="0 0 800 560" style={{ display: "block" }}>
      {/* sol */}
      {!brush && <path d="M30 476 H560" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />}
      {/* mur extérieur (coupe) */}
      <rect x={560} y={130} width={50} height={380} fill={C.blush} stroke={C.ink} strokeWidth={9} />
      {[170, 230, 290, 350, 480].map((y) => (
        <path key={y} d={`M566 ${y + 14} L604 ${y - 14}`} stroke={C.ink} strokeWidth={4} strokeLinecap="round" opacity={0.35} />
      ))}
      {/* conduit qui traverse le mur */}
      <rect x={260} y={395} width={352} height={50} fill={METAL} />
      <path d="M260 395 H612 M260 445 H612" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
      {/* sortie extérieure et son clapet */}
      <path d="M610 386 H694" stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
      <path d="M610 454 H640" stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
      <g transform={`rotate(${flap} 688 392)`}>
        <path d="M688 392 V452" stroke={flow ? C.teal : C.coral} strokeWidth={10} strokeLinecap="round" />
      </g>
      <circle cx={688} cy={390} r={8} fill={C.ink} />
      {/* peluches accumulées dans le conduit */}
      {amount > 0 && <path d={`M${330 - amount * 40} 441 Q430 ${441 - amount * 58} ${530 + amount * 24} 441 Z`} fill={LINT} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />}
      {heat && <ellipse cx={500} cy={420} rx={34 * pulse} ry={21} fill={LINT} stroke={C.ink} strokeWidth={5} />}
      {/* sèche-linge (absent quand on brosse : le conduit est débranché) */}
      {!brush && (
        <>
          <rect x={60} y={220} width={200} height={252} rx={18} fill={heat ? C.blush : C.white} stroke={C.ink} strokeWidth={9} />
          <path d="M60 262 H260" stroke={C.ink} strokeWidth={6} />
          <circle cx={92} cy={241} r={8} fill={C.sun} stroke={C.ink} strokeWidth={4} />
          <circle cx={160} cy={352} r={64} fill={C.mint} stroke={C.ink} strokeWidth={8} />
          <circle cx={160} cy={352} r={40} fill={heat ? C.coral : C.paper} stroke={C.ink} strokeWidth={6} opacity={heat ? 0.55 + Math.sin(local / 5) * 0.2 : 1} />
          {/* filtre à peluches devant la sortie */}
          <path d="M246 400 V440" stroke={C.teal} strokeWidth={9} strokeLinecap="round" strokeDasharray="6 8" />
        </>
      )}
      {lint && (
        <>
          {[0, 1, 2, 3, 4].map((i) => {
            const k = ((local / 70 + i / 5) % 1 + 1) % 1;
            return <circle key={i} cx={236 + k * 220} cy={420 + Math.sin(local / 7 + i * 2) * 9} r={8} fill={LINT} stroke={C.ink} strokeWidth={3} opacity={1 - k * 0.5} />;
          })}
          {label(400, 70, "Not all lint stops in the trap", 44, C.ink, "middle")}
          {label(410, 300, "It builds up", 40, C.coral, "middle")}
          {label(410, 344, "in the duct", 40, C.coral, "middle")}
        </>
      )}
      {heat && (
        <>
          {[110, 160, 210].map((x, i) => {
            const k = ((local / 30 + i / 3) % 1 + 1) % 1;
            return <path key={x} d={`M${x} ${212 - k * 30} q-12 -11 0 -22 q12 -11 0 -22`} fill="none" stroke={C.coral} strokeWidth={8} strokeLinecap="round" opacity={1 - k * 0.7} />;
          })}
          {label(400, 70, "A blocked vent traps heat", 46, C.ink, "middle")}
          {label(410, 300, "Lint is highly", 38, C.coral, "middle")}
          {label(410, 344, "flammable", 38, C.coral, "middle")}
        </>
      )}
      {brush && (
        <>
          {/* perceuse */}
          <rect x={95} y={440} width={40} height={64} rx={10} fill={C.ink} />
          <rect x={70} y={395} width={120} height={50} rx={14} fill={C.sun} stroke={C.ink} strokeWidth={8} />
          <rect x={190} y={408} width={24} height={24} rx={5} fill={C.ink} />
          {/* sens des aiguilles d'une montre */}
          <path d="M106 340 A34 34 0 1 1 140 374" fill="none" stroke={C.coral} strokeWidth={8} strokeLinecap="round" />
          <path d="M156 362 L138 374 L156 388" fill="none" stroke={C.coral} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
          {/* tige souple, rallonges, brosse qui tourne */}
          <path d={`M214 420 H${bx}`} stroke={C.white} strokeWidth={12} strokeLinecap="round" />
          <path d={`M214 420 H${bx}`} stroke={C.ink} strokeWidth={5} strokeLinecap="round" strokeDasharray="60 8" strokeDashoffset={-bx} />
          <g transform={`rotate(${local * 12} ${bx} 420)`}>
            {[0, 30, 60, 90, 120, 150].map((a) => (
              <path key={a} d={`M${bx - 21} 420 H${bx + 21}`} stroke={C.teal} strokeWidth={6} strokeLinecap="round" transform={`rotate(${a} ${bx} 420)`} />
            ))}
          </g>
          <circle cx={bx} cy={420} r={7} fill={C.ink} />
          {/* peluches qui tombent du conduit */}
          {[0, 1, 2].map((i) => {
            const k = ((local / 40 + i / 3) % 1 + 1) % 1;
            return <circle key={i} cx={240 + i * 8} cy={452 + k * 40} r={7} fill={LINT} stroke={C.ink} strokeWidth={3} opacity={1 - k} />;
          })}
          {label(400, 70, "Clockwise, slowly", 48, C.ink, "middle")}
          {label(410, 300, "Add rods", 40, C.teal, "middle")}
          {label(410, 344, "as you go", 40, C.teal, "middle")}
          {label(400, 544, "Then vacuum up the lint", 42, C.coral, "middle")}
        </>
      )}
      {flow && (
        <>
          <path d="M276 420 H600" stroke={C.teal} strokeWidth={8} strokeLinecap="round" strokeDasharray="26 18" strokeDashoffset={-local * 3} />
          {[0, 1, 2].map((i) => {
            const k = ((local / 34 + i / 3) % 1 + 1) % 1;
            return <path key={i} d={`M${700 + k * 50} ${414 + i * 22} q10 -8 20 0`} fill="none" stroke={C.teal} strokeWidth={7} strokeLinecap="round" opacity={1 - k} />;
          })}
          {/* colliers aux deux raccords */}
          {[274, 546].map((x) => (
            <rect key={x} x={x - 7} y={389} width={14} height={62} rx={5} fill={C.sun} stroke={C.ink} strokeWidth={5} transform={`scale(${pulse})`} style={{ transformOrigin: `${x}px 420px` }} />
          ))}
          {label(400, 70, "Short, straight, metal", 48, C.ink, "middle")}
          {label(410, 300, "Strong airflow", 38, C.teal, "middle")}
          {label(410, 344, "outside", 38, C.teal, "middle")}
          {label(400, 544, "Clamps or foil tape, not screws", 42, C.coral, "middle")}
        </>
      )}
    </svg>
  );
};
