// Schéma : nettoyer un portable sans l'abîmer.
// Modes : "liquid" (profil : le liquide vaporisé coule le long de l'écran jusque dans le clavier),
// "cloth" (face : chiffon à peine humide, passes de haut en bas), "tilt" (profil : portable incliné, air en courtes rafales).
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
const ALU = "#D9DEE3";
const SCREEN = "#1B2A41";
const WATER = "#7CC4E0";

/** Portable vu de profil, charnière à l'origine : base vers la droite, écran relevé vers le haut à gauche. */
const SideLaptop: React.FC = () => (
  <>
    {/* base */}
    <rect x={0} y={0} width={300} height={26} rx={10} fill={ALU} stroke={C.ink} strokeWidth={8} />
    {/* touches */}
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <rect key={i} x={36 + i * 36} y={-12} width={26} height={12} rx={3} fill={SCREEN} />
    ))}
    {/* écran */}
    <g transform="rotate(-105)">
      <rect x={0} y={-9} width={250} height={18} rx={8} fill={SCREEN} stroke={C.ink} strokeWidth={8} />
    </g>
  </>
);

export const LaptopClean: React.FC<{ mode: string; local: number; width?: number }> = ({ mode, local, width = 800 }) => {
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

  // ---------- face : chiffon à peine humide, de haut en bas ----------
  if (mode === "cloth") {
    const cols = 4;
    const t = interpolate(local, [10, 130], [0, cols], clamp);
    const col = Math.min(cols - 1, Math.floor(t));
    const k = ease(Math.min(1, t - col));
    const X0 = 190;
    const W = 420;
    const Y0 = 160;
    const H = 270;
    const cw = W / cols;
    const smudges = [
      [250, 230], [330, 350], [420, 260], [470, 380], [540, 220], [570, 330], [290, 300],
    ];
    return svg(
      <>
        {label(400, 64, "Barely damp cloth", 48, C.ink, "middle")}
        {label(400, 122, "Top to bottom, light pressure", 40, C.teal, "middle")}
        <rect x={X0 - 14} y={Y0 - 14} width={W + 28} height={H + 28} rx={18} fill={ALU} stroke={C.ink} strokeWidth={8} />
        <rect x={X0} y={Y0} width={W} height={H} rx={8} fill={SCREEN} />
        {smudges.map(([x, y], i) => {
          const c = Math.floor((x - X0) / cw);
          const wiped = c < col || (c === col && y < Y0 + k * H);
          return <ellipse key={i} cx={x} cy={y} rx={22} ry={14} fill={C.white} opacity={wiped ? 0 : 0.35} transform={`rotate(${i * 40} ${x} ${y})`} />;
        })}
        {/* trace propre de la passe en cours */}
        <rect x={X0 + col * cw + 8} y={Y0} width={cw - 16} height={k * H} fill={C.white} opacity={0.08} />
        {/* chiffon */}
        <g transform={`translate(${X0 + col * cw + cw / 2} ${Y0 + k * H})`}>
          <rect x={-cw / 2 + 4} y={-26} width={cw - 8} height={52} rx={12} fill={C.teal} stroke={C.ink} strokeWidth={7} />
          <path d={`M${-cw / 2 + 20} -6 H${cw / 2 - 20} M${-cw / 2 + 20} 10 H${cw / 2 - 20}`} stroke={C.ink} strokeWidth={4} opacity={0.4} strokeLinecap="round" />
        </g>
        {/* flèche de haut en bas */}
        <path d="M680 180 V400" stroke={C.coral} strokeWidth={8} strokeLinecap="round" />
        <path d="M680 400 l-16 -22 M680 400 l16 -22" stroke={C.coral} strokeWidth={8} strokeLinecap="round" />
        {label(400, 528, "Water only on the screen", 40, C.coral, "middle")}
      </>,
    );
  }

  // ---------- profil incliné : air en courtes rafales ----------
  if (mode === "tilt") {
    const tilt = interpolate(local, [6, 50], [0, -50], { ...clamp, easing: ease });
    const burst = frac(local / 26);
    const on = local > 50 && burst < 0.45;
    const crumbs = [0, 1, 2, 3, 4];
    return svg(
      <>
        {label(400, 64, "Tilt the keyboard toward you", 46, C.ink, "middle")}
        {label(400, 122, "Short bursts, left to right", 40, C.teal, "middle")}
        <g transform={`translate(300 440) rotate(${tilt})`}>
          <SideLaptop />
        </g>
        {/* bombe d'air, bien droite */}
        <g transform="translate(650 300)">
          <rect x={-34} y={-70} width={68} height={170} rx={14} fill={C.white} stroke={C.ink} strokeWidth={8} />
          <rect x={-18} y={-96} width={36} height={28} rx={6} fill={C.coral} stroke={C.ink} strokeWidth={6} />
          <path d="M-18 -84 H-130" stroke={C.coral} strokeWidth={7} strokeLinecap="round" />
        </g>
        {/* rafale */}
        {on && (
          <path d="M508 216 l-46 -8 M508 232 l-52 10 M508 248 l-40 26" stroke={C.teal} strokeWidth={7} strokeLinecap="round" opacity={1 - burst * 2} />
        )}
        {/* miettes chassées */}
        {local > 50 &&
          crumbs.map((i) => {
            const k = frac((local - 50) / 60 + i / 5);
            return <rect key={i} x={430 - k * (110 + i * 22)} y={300 + i * 14 + k * k * 150} width={11} height={11} rx={3} fill="#C99A5B" stroke={C.ink} strokeWidth={3} opacity={1 - k} transform={`rotate(${local * 5 + i * 40} ${435 - k * (110 + i * 22)} ${305 + i * 14 + k * k * 150})`} />;
          })}
        {label(400, 528, "Keep the can upright", 40, C.coral, "middle")}
      </>,
    );
  }

  // ---------- profil : le liquide vaporisé coule dans le clavier ----------
  const drops = [0, 1, 2, 3, 4];
  const pool = interpolate(local, [50, 120], [0, 1], { ...clamp, easing: ease });
  const cross = interpolate(local, [70, 90], [0, 1], clamp);
  return svg(
    <>
      {label(400, 64, "Never spray the laptop", 48, C.ink, "middle")}
      {label(400, 122, "Liquid runs down into the keyboard", 40, C.teal, "middle")}
      <g transform="translate(330 440)">
        <SideLaptop />
        {/* flaque qui s'infiltre à la charnière et sous les touches */}
        <rect x={6} y={4} width={pool * 170} height={16} rx={8} fill={WATER} opacity={0.9} />
      </g>
      {/* gouttes le long de l'écran (incliné à 105°) */}
      {drops.map((i) => {
        const k = frac(local / 55 + i / 5);
        const x = 330 - 62 * (1 - k) - 14;
        const y = 440 - 232 * (1 - k);
        return <path key={i} d={`M${x} ${y - 12} q10 14 0 20 q-10 -6 0 -20 Z`} fill={WATER} stroke={C.ink} strokeWidth={4} opacity={0.4 + 0.6 * k} />;
      })}
      {/* vaporisateur */}
      <g transform="translate(96 250)">
        <rect x={-30} y={0} width={60} height={110} rx={12} fill={C.white} stroke={C.ink} strokeWidth={8} />
        <path d="M-14 0 V-30 H36 V-12 H14 V0" fill={C.coral} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
        {[0, 1, 2].map((i) => {
          const k = frac(local / 22 + i / 3);
          return <circle key={i} cx={46 + k * 110} cy={-22 + (i - 1) * k * 34} r={5} fill={WATER} opacity={1 - k} />;
        })}
      </g>
      {/* croix */}
      <g opacity={cross} transform="translate(96 300)">
        <path d="M-52 -52 L52 52 M52 -52 L-52 52" stroke={C.coral} strokeWidth={14} strokeLinecap="round" />
      </g>
      {label(400, 528, "Dampen the cloth instead", 40, C.coral, "middle")}
    </>,
  );
};
