// Schéma de face : une vitre et ce qui laisse (ou enlève) les traces.
// Modes : "sun" (le soleil sèche le liquide, les traces restent), "film" (trop de savon : voile et peluches),
// "squeegee" (passes de raclette de haut en bas qui se chevauchent), "sides" (dedans à l'horizontale, dehors à la verticale).
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
const GLASS = "#CFE9F5";
const TOP = 160;
const H = 300;

/** Une fenêtre : cadre, vitre, appui. */
const Pane: React.FC<{ x: number; w: number; children?: React.ReactNode; id: string }> = ({ x, w, children, id }) => (
  <g>
    <clipPath id={id}>
      <rect x={x} y={TOP} width={w} height={H} />
    </clipPath>
    <rect x={x} y={TOP} width={w} height={H} fill={GLASS} />
    <g clipPath={`url(#${id})`}>{children}</g>
    <rect x={x} y={TOP} width={w} height={H} fill="none" stroke={C.ink} strokeWidth={10} strokeLinejoin="round" />
    <rect x={x - 22} y={TOP + H} width={w + 44} height={20} rx={8} fill={C.white} stroke={C.ink} strokeWidth={8} />
  </g>
);

export const WindowSqueegee: React.FC<{ mode: string; local: number; width?: number }> = ({ mode, local, width = 800 }) => {
  const label = (x: number, y: number, text: string, size = 40, color: string = C.ink, anchor: "start" | "middle" | "end" = "middle") => (
    <text x={x} y={y} fontFamily={HAND} fontWeight={700} fontSize={fitSize(text, size, x, anchor)} fill={color} textAnchor={anchor}>
      {text}
    </text>
  );
  const X = 250;
  const W = 300;
  if (mode === "sides") {
    const k = interpolate(local, [8, 90], [0, 1], { ...clamp, easing: ease });
    const rows = [0, 1, 2, 3];
    return (
      <svg width={width} height={(width * 560) / 800} viewBox="0 0 800 560" style={{ display: "block" }}>
        <Pane x={90} w={250} id="ws-in">
          {rows.map((i) => (
            <path key={i} d={`M105 ${TOP + 45 + i * 70} H${105 + 220 * Math.min(1, Math.max(0, k * 4 - i))}`} stroke={C.coral} strokeWidth={9} strokeLinecap="round" opacity={0.85} />
          ))}
        </Pane>
        <Pane x={460} w={250} id="ws-out">
          {rows.map((i) => (
            <path key={i} d={`M${495 + i * 60} ${TOP + 18} V${TOP + 18 + 264 * Math.min(1, Math.max(0, k * 4 - i))}`} stroke={C.teal} strokeWidth={9} strokeLinecap="round" opacity={0.85} />
          ))}
        </Pane>
        {label(400, 64, "Inside across, outside down", 46)}
        {label(400, 122, "The direction shows the side", 38, C.coral)}
        {label(215, 536, "Inside", 40, C.coral)}
        {label(585, 536, "Outside", 40, C.teal)}
      </svg>
    );
  }
  const sun = mode === "sun";
  const film = mode === "film";
  const sq = mode === "squeegee";
  // sun : les gouttes s'évaporent, les traces apparaissent
  const dry = sun ? interpolate(local, [20, 90], [0, 1], { ...clamp, easing: ease }) : 0;
  // film : le voile monte
  const haze = film ? interpolate(local, [10, 80], [0, 0.75], { ...clamp, easing: ease }) : 0;
  // squeegee : trois passes verticales
  const stroke = (i: number) => interpolate(local, [10 + i * 34, 40 + i * 34], [0, 1], { ...clamp, easing: ease });
  const drops = Array.from({ length: 14 }, (_, i) => ({ x: X + 24 + ((i * 67) % (W - 48)), y: TOP + 26 + ((i * 97) % (H - 60)) }));
  const lint = Array.from({ length: 9 }, (_, i) => ({ x: X + 30 + ((i * 83) % (W - 60)), y: TOP + 34 + ((i * 59) % (H - 70)), r: (i * 37) % 180 }));
  const colW = 110;
  return (
    <svg width={width} height={(width * 560) / 800} viewBox="0 0 800 560" style={{ display: "block" }}>
      {sun && (
        <g>
          <circle cx={680} cy={210} r={46} fill={C.sun} stroke={C.ink} strokeWidth={8} />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const a = (i * Math.PI) / 4 + local / 60;
            return <path key={i} d={`M${680 + Math.cos(a) * 62} ${210 + Math.sin(a) * 62} L${680 + Math.cos(a) * 86} ${210 + Math.sin(a) * 86}`} stroke={C.sun} strokeWidth={9} strokeLinecap="round" />;
          })}
          <path d={`M620 240 L${X + W + 14} 300 M626 270 L${X + W + 14} 360`} stroke={C.sun} strokeWidth={7} strokeLinecap="round" strokeDasharray="4 16" />
        </g>
      )}
      {film && (
        <g>
          <path d="M70 380 h130 l-14 96 h-102 Z" fill={C.white} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <circle key={i} cx={84 + ((i * 41) % 110)} cy={372 - ((i * 29) % 46) - Math.sin(local / 12 + i) * 5} r={13 + (i % 3) * 6} fill={C.white} stroke={C.teal} strokeWidth={5} />
          ))}
        </g>
      )}
      <Pane x={X} w={W} id="ws-main">
        {sun && (
          <>
            {drops.map((d, i) => (
              <ellipse key={i} cx={d.x} cy={d.y} rx={8} ry={11} fill={C.teal} opacity={0.75 * (1 - dry)} />
            ))}
            {[0, 1, 2, 3, 4].map((i) => (
              <path key={i} d={`M${X + 20} ${TOP + 40 + i * 56} q${W / 4 - 10} ${i % 2 ? 22 : -22} ${W / 2 - 20} 0 t${W / 2 - 20} 0`} stroke={C.white} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.95 * dry} />
            ))}
          </>
        )}
        {film && (
          <>
            <rect x={X} y={TOP} width={W} height={H} fill={C.white} opacity={haze} />
            {lint.map((l, i) => (
              <path key={i} d="M-9 0 q4 -7 9 0 t9 0" transform={`translate(${l.x} ${l.y}) rotate(${l.r})`} stroke={C.muted} strokeWidth={4} fill="none" strokeLinecap="round" opacity={interpolate(local, [50 + i * 5, 70 + i * 5], [0, 1], clamp)} />
            ))}
          </>
        )}
        {sq && (
          <>
            <rect x={X} y={TOP} width={W} height={H} fill={C.white} opacity={0.7} />
            {[0, 1, 2].map((i) => {
              const s = stroke(i);
              const x0 = X + i * (colW - 15);
              return <rect key={i} x={x0} y={TOP} width={colW} height={(H - 26) * s} fill={GLASS} />;
            })}
            {[0, 1, 2].map((i) => {
              const s = stroke(i);
              if (s <= 0 || (s >= 1 && i < 2 && stroke(i + 1) > 0)) return null;
              const x0 = X + i * (colW - 15);
              const y = TOP + (H - 26) * s;
              return (
                <g key={`b${i}`}>
                  <rect x={x0 - 4} y={y - 8} width={colW + 8} height={14} rx={5} fill={C.ink} />
                  <path d={`M${x0 + colW / 2} ${y - 8} v-46`} stroke={C.coral} strokeWidth={12} strokeLinecap="round" />
                </g>
              );
            })}
          </>
        )}
      </Pane>
      {sq && <path d={`M${X + 95} ${TOP - 26} h-15 m0 -12 v24 M${X + 110} ${TOP - 26} h15 m0 -12 v24`} stroke={C.coral} strokeWidth={6} strokeLinecap="round" opacity={interpolate(local, [50, 64], [0, 1], clamp)} />}
      {sun && (
        <>
          {label(400, 64, "Direct sun dries it too fast", 46)}
          {label(400, 122, "The streaks stay on the glass", 38, C.coral)}
          {label(400, 536, "Work in the shade", 40, C.teal)}
        </>
      )}
      {film && (
        <>
          {label(400, 64, "Too much soap leaves a film", 46)}
          {label(400, 122, "A few drops are enough", 40, C.teal)}
          {label(400, 536, "The wrong cloth leaves lint", 38, C.coral)}
        </>
      )}
      {sq && (
        <>
          {label(400, 64, "Top to bottom, straight strokes", 46)}
          {label(400, 122, "Overlap each stroke by an inch", 38, C.coral)}
          {label(400, 536, "Wipe the blade after every pass", 38, C.teal)}
        </>
      )}
    </svg>
  );
};
