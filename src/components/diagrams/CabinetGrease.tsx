// Schéma en coupe : la surface d'une porte de placard (bois, finition, film de graisse).
// Modes : "film" (vapeur d'huile + buée + poussière), "scrub" (frotter use la finition),
// "dwell" (le savon ramollit la graisse pendant la pose), "rinse" (eau claire puis séchage).
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

const GREASE = "#D9952B";
const WOOD = "#E3C08F";
const FINISH = "#A8CDB0";
const STEAM = "#BFE3EE";
const X0 = 50; // bord gauche de la coupe
const X1 = 560; // bord droit de la coupe (les légendes des couches sont à droite)
const TOP = 352; // dessus de la finition = surface de la porte

export const CabinetGrease: React.FC<{ mode: string; local: number; width?: number }> = ({ mode, local, width = 800 }) => {
  const label = (x: number, y: number, text: string, size = 40, color: string = C.ink, anchor: "start" | "middle" | "end" = "start") => (
    <text x={x} y={y} fontFamily={HAND} fontWeight={700} fontSize={fitSize(text, size, x, anchor)} fill={color} textAnchor={anchor}>
      {text}
    </text>
  );
  const film = mode === "film";
  const scrub = mode === "scrub";
  const dwell = mode === "dwell";
  const rinse = mode === "rinse";

  // "dwell" : la graisse ramollit et s'amincit pendant que le chiffon savonneux repose dessus
  const soften = dwell ? interpolate(local, [20, 120], [0, 1], { ...clamp, easing: ease }) : 0;
  // "scrub" : le tampon va et vient, la finition s'use
  const padX = 150 + (Math.sin(local / 7) * 0.5 + 0.5) * 250;
  const wear = scrub ? interpolate(local, [10, 90], [0, 1], clamp) : 0;
  // "rinse" : le second chiffon traverse la surface de gauche à droite
  const pass = rinse ? interpolate(local % 150, [10, 105], [0, 1], { ...clamp, easing: ease }) : 0;
  const clothX = 60 + pass * 370; // bord gauche du chiffon de rinçage (largeur 130)

  const greaseH = film ? 46 : scrub ? 30 : dwell ? 46 - soften * 22 : 0;
  const gy = TOP - greaseH;
  // dessus ondulé du film de graisse
  const wavy = `M${X0} ${TOP} V${gy + 6} Q${X0 + 40} ${gy - 8} ${X0 + 85} ${gy + 4} T${X0 + 170} ${gy + 2} T${X0 + 255} ${gy + 5} T${X0 + 340} ${gy + 1} T${X0 + 425} ${gy + 4} T${X1} ${gy + 3} V${TOP} Z`;

  return (
    <svg width={width} height={(width * 560) / 800} viewBox="0 0 800 560" style={{ display: "block" }}>
      {/* la porte en coupe : bois */}
      <rect x={X0} y={TOP + 34} width={X1 - X0} height={110} rx={10} fill={WOOD} stroke={C.ink} strokeWidth={9} />
      <path d={`M${X0 + 30} ${TOP + 70} q120 -14 240 0 t210 0 M${X0 + 30} ${TOP + 108} q110 12 220 0 t230 0`} fill="none" stroke="#B88A4E" strokeWidth={5} strokeLinecap="round" />
      {/* finition (peinture ou vernis) */}
      <rect x={X0} y={TOP} width={X1 - X0} height={34} rx={6} fill={FINISH} stroke={C.ink} strokeWidth={8} />
      {/* usure de la finition sous le tampon abrasif */}
      {scrub &&
        [130, 200, 270, 340, 410, 480].map((x, i) => (
          <g key={x} opacity={interpolate(wear, [i * 0.12, i * 0.12 + 0.3], [0, 1], clamp)}>
            <path d={`M${x - 16} ${TOP + 3} L${x - 4} ${TOP + 28} L${x + 6} ${TOP + 8} L${x + 18} ${TOP + 30}`} fill="none" stroke={WOOD} strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" />
            <path d={`M${x - 16} ${TOP + 3} L${x - 4} ${TOP + 28} L${x + 6} ${TOP + 8} L${x + 18} ${TOP + 30}`} fill="none" stroke={C.coral} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
          </g>
        ))}
      {/* film de graisse et poussière collée */}
      {greaseH > 0 && (
        <g opacity={dwell ? 1 - soften * 0.35 : 1}>
          <path d={wavy} fill={GREASE} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
          {[95, 160, 232, 300, 371, 440, 512].map((x, i) => (
            <circle key={x} cx={x} cy={TOP - greaseH * (0.35 + (i % 3) * 0.15)} r={6} fill={C.muted} stroke={C.ink} strokeWidth={3} />
          ))}
        </g>
      )}

      {/* ---- film : la vapeur d'huile, la buée et la poussière se déposent ---- */}
      {film && (
        <>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
            const k = ((local / 70 + i / 9) % 1 + 1) % 1;
            const x = 95 + i * 52;
            const y = 110 + k * 185;
            const o = interpolate(k, [0, 0.15, 0.85, 1], [0, 1, 1, 0], clamp);
            if (i % 3 === 0) return <path key={i} d={`M${x} ${y - 14} q-11 14 0 22 q11 -8 0 -22 Z`} fill={GREASE} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" opacity={o} />;
            if (i % 3 === 1) return <path key={i} d={`M${x} ${y + 14} q-12 -10 0 -20 q12 -10 0 -20`} fill="none" stroke={STEAM} strokeWidth={9} strokeLinecap="round" opacity={o} />;
            return <circle key={i} cx={x} cy={y} r={6} fill={C.muted} stroke={C.ink} strokeWidth={3} opacity={o} />;
          })}
          {label(400, 62, "Oil vapor, steam and dust", 46, C.ink, "middle")}
          {label(305, 546, "Stuck to every surface", 42, C.coral, "middle")}
        </>
      )}

      {/* ---- scrub : frotter fort use la finition ---- */}
      {scrub && (
        <>
          <g transform={`translate(${padX} 0)`}>
            <rect x={-70} y={TOP - 82} width={140} height={54} rx={12} fill="#7FA36B" stroke={C.ink} strokeWidth={8} />
            <path d={`M-62 ${TOP - 28} l10 12 l10 -12 l10 12 l10 -12 l10 12 l10 -12 l10 12 l10 -12 l10 12 l10 -12 l10 12 l10 -12 l4 5`} fill="none" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
            <path d={`M-40 ${TOP - 55} H40`} stroke={C.ink} strokeWidth={5} strokeLinecap="round" opacity={0.35} />
          </g>
          <path d={`M150 ${TOP - 120} H400 M150 ${TOP - 120} l22 -14 M150 ${TOP - 120} l22 14 M400 ${TOP - 120} l-22 -14 M400 ${TOP - 120} l-22 14`} fill="none" stroke={C.coral} strokeWidth={8} strokeLinecap="round" />
          {label(400, 62, "Hard scrubbing wears the finish", 46, C.ink, "middle")}
          {label(305, 546, "A degreaser, not scrubbing", 42, C.teal, "middle")}
        </>
      )}

      {/* ---- dwell : le chiffon humide et savonneux repose, le savon ramollit la graisse ---- */}
      {dwell && (
        <>
          {/* gouttes d'huile qui remontent dans le chiffon */}
          {[0, 1, 2, 3].map((i) => {
            const k = ((local / 50 + i / 4) % 1 + 1) % 1;
            return <circle key={i} cx={170 + i * 90} cy={TOP - 8 - k * (greaseH + 6)} r={7} fill={GREASE} stroke={C.ink} strokeWidth={3} opacity={soften * (1 - k)} />;
          })}
          {/* chiffon */}
          <rect x={110} y={gy - 50} width={380} height={50} rx={22} fill={C.sun} stroke={C.ink} strokeWidth={9} />
          <path d={`M150 ${gy - 25} H450`} stroke={C.ink} strokeWidth={5} strokeLinecap="round" strokeDasharray="4 22" opacity={0.45} />
          {/* bulles de savon qui descendent dans la graisse */}
          {[0, 1, 2, 3, 4].map((i) => {
            const k = ((local / 45 + i / 5) % 1 + 1) % 1;
            return <circle key={i} cx={140 + i * 80} cy={gy + 4 + k * (greaseH - 12)} r={8 - k * 3} fill={C.white} stroke={C.ink} strokeWidth={3} opacity={1 - k * 0.6} />;
          })}
          {/* horloge : on attend */}
          <g>
            <circle cx={690} cy={190} r={50} fill={C.white} stroke={C.ink} strokeWidth={9} />
            <path d="M690 190 V156" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
            <path d="M690 190 V150" stroke={C.coral} strokeWidth={7} strokeLinecap="round" transform={`rotate(${local * 3} 690 190)`} />
            <circle cx={690} cy={190} r={7} fill={C.ink} />
          </g>
          {label(400, 62, "Wait: the soap softens the grease", 46, C.ink, "middle")}
          {label(305, 546, "No need to scrub", 42, C.teal, "middle")}
        </>
      )}

      {/* ---- rinse : eau claire pour enlever le savon, puis on sèche ---- */}
      {rinse && (
        <>
          {/* résidu de savon encore à droite du chiffon */}
          {[90, 135, 180, 225, 270, 315, 360, 405, 450, 495, 535].map((x, i) =>
            x > clothX + 130 ? <circle key={x} cx={x} cy={TOP - 10 - (i % 2) * 5} r={8 - (i % 3)} fill={C.white} stroke={C.ink} strokeWidth={3} /> : null,
          )}
          {/* surface propre à gauche du chiffon */}
          {[100, 190, 280, 370].map((x, i) =>
            x < clothX - 10 ? (
              <path key={x} d={`M${x} ${TOP - 44} v28 M${x - 14} ${TOP - 30} h28`} stroke={C.teal} strokeWidth={6} strokeLinecap="round" opacity={0.6 + Math.sin(local / 6 + i) * 0.4} />
            ) : null,
          )}
          {/* second chiffon, humidifié à l'eau claire */}
          <g transform={`translate(${clothX} 0)`}>
            <rect x={0} y={TOP - 54} width={130} height={50} rx={20} fill={STEAM} stroke={C.ink} strokeWidth={9} />
            <path d={`M28 ${TOP - 29} H102`} stroke={C.ink} strokeWidth={5} strokeLinecap="round" strokeDasharray="4 20" opacity={0.45} />
          </g>
          <path d={`M90 ${TOP - 110} H450 l-24 -15 M450 ${TOP - 110} l-24 15`} fill="none" stroke={C.teal} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="18 12" strokeDashoffset={-local * 2} />
          {label(400, 62, "Plain water removes the soap", 46, C.ink, "middle")}
          {label(305, 546, "Then dry immediately", 42, C.teal, "middle")}
        </>
      )}

      {/* légendes des couches, à droite de la coupe */}
      {(film || scrub || dwell) && label(582, TOP - 12, "Grease", 38, GREASE)}
      {label(582, TOP + 29, "Finish", 36, scrub ? C.coral : C.ink)}
      {label(582, TOP + 100, "Door", 38, C.muted)}
    </svg>
  );
};
