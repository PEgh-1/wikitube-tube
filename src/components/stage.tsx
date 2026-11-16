// Mise en scène « plein écran » : gags de Wiki, avant/après, schémas animés en coupe, transitions signées.
import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, FONT } from "../theme";
import { HAND, Mascot, WMark, type Pose } from "./brand";
import type { Diagram, Gag } from "../types";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.inOut(Easing.cubic);

/** Élément actif à l'instant courant parmi une liste calée sur la voix (t, dur en secondes relatives à la scène). */
export function useCue<T extends { t?: number; dur?: number }>(items: T[] | undefined, defDur: number): { item: T; local: number; left: number } | null {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!items?.length) return null;
  let cur: T | null = null;
  for (const it of items) if (frame >= Math.round((it.t ?? 0) * fps)) cur = it;
  if (!cur) return null;
  const from = Math.round((cur.t ?? 0) * fps);
  const len = Math.round((cur.dur ?? defDur) * fps);
  if (frame >= from + len) return null;
  return { item: cur, local: frame - from, left: from + len - frame };
}

// ---------- Gags de Wiki : il surgit d'un bord de l'écran et réagit à ce qui se passe ----------
export const WikiGag: React.FC<{ gags?: Gag[]; height?: number }> = ({ gags, height = 400 }) => {
  const { fps } = useVideoConfig();
  const cue = useCue(gags, 3);
  if (!cue) return null;
  const { item, local, left } = cue;
  const side = item.side ?? "right";
  const inS = spring({ frame: local, fps, config: { damping: 9, stiffness: 150 } });
  const out = interpolate(left, [0, 8], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const p = inS * out;
  const shake = item.pose === "panic" || item.pose === "wet" ? Math.sin(local * 1.9) * 5 * Math.max(0, 1 - local / 40) : 0;
  const hop = item.pose === "party" ? -Math.abs(Math.sin(local / 5)) * 46 : 0;
  const pos: React.CSSProperties =
    side === "left"
      ? { left: -30 - (1 - p) * 520, top: 330, transform: `rotate(${10 - p * 4}deg) translate(${shake}px, ${hop}px)` }
      : side === "bottom"
        ? { left: 760, bottom: -40 - (1 - p) * 520, transform: `translate(${shake}px, ${hop}px)` }
        : { right: 30 - (1 - p) * 560, top: 320, transform: `rotate(${-10 + p * 4}deg) translate(${shake}px, ${hop}px)` };
  return (
    <div style={{ position: "absolute", ...pos }}>
      <Mascot pose={item.pose as Pose} height={height} flip={side === "left" && item.pose !== "nose" ? false : false} />
    </div>
  );
};

// ---------- Avant / après : curseur qui balaie entre deux images ----------
export const BeforeAfter: React.FC<{ before: string; after: string; labels?: [string, string]; len: number }> = ({ before, after, labels = ["Before", "After"], len }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Le curseur part à droite (tout « avant »), balaie vers la gauche, revient, puis se pose au milieu.
  const x = interpolate(frame, [0, 10, 0.34 * len, 0.6 * len, 0.82 * len, len], [100, 100, 24, 70, 50, 50], { ...clamp, easing: ease });
  const pop = spring({ frame: frame - 6, fps, config: { damping: 12, stiffness: 180 } });
  const media: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" };
  const chip = (text: string, right: boolean, color: string) => (
    <div style={{ position: "absolute", top: 170, ...(right ? { right: 90 } : { left: 90 }), transform: `scale(${pop}) rotate(${right ? 2 : -2}deg)`, background: color, color: C.white, border: `5px solid ${C.ink}`, borderRadius: 16, padding: "8px 30px 12px", fontFamily: HAND, fontWeight: 700, fontSize: 64, lineHeight: 1, boxShadow: "7px 7px 0 rgba(27,42,65,0.55)" }}>
      {text}
    </div>
  );
  return (
    <AbsoluteFill>
      <Img src={staticFile(after)} style={media} />
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${100 - x}% 0 0)` }}>
        <Img src={staticFile(before)} style={{ ...media, filter: "saturate(0.75)" }} />
      </div>
      {x < 99 && chip(labels[1], true, C.teal)}
      {x > 30 && chip(labels[0], false, C.coral)}
      <div style={{ position: "absolute", top: 0, bottom: 0, left: `${x}%`, width: 10, marginLeft: -5, background: C.paper, boxShadow: "0 0 0 3px rgba(27,42,65,0.9)" }} />
      <div style={{ position: "absolute", top: "50%", left: `${x}%`, width: 104, height: 104, margin: "-52px 0 0 -52px", borderRadius: 52, background: C.paper, border: `6px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "6px 6px 0 rgba(27,42,65,0.5)" }}>
        <svg width={64} height={40} viewBox="0 0 64 40">
          <path d="M22 6 L6 20 L22 34 M42 6 L58 20 L42 34" fill="none" stroke={C.coral} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Schéma en coupe : cuvette, siphon et bouchon ----------
const TRAP = "M330 292 C330 400 372 446 430 424 C486 402 474 286 528 268 C584 250 604 322 604 420 L604 548";
type TrapMode = "clog" | "plunge" | "auger" | "flow";

export const ToiletTrap: React.FC<{ mode: TrapMode; local: number; width?: number }> = ({ mode, local, width = 800 }) => {
  const cleared = mode === "flow" ? 1 : mode === "plunge" ? interpolate(local, [70, 100], [0, 1], clamp) : mode === "auger" ? interpolate(local, [80, 105], [0, 1], clamp) : 0;
  const level = interpolate(cleared, [0, 1], [150, 232]); // niveau d'eau dans la cuvette : haut quand c'est bouché
  const pulse = 1 + Math.sin(local / 5) * 0.07;
  const stroke = Math.sin(local / 3.2); // va-et-vient de la ventouse
  const jitter = mode === "plunge" && cleared < 1 ? stroke * 7 : 0;
  const cable = mode === "auger" ? interpolate(local, [12, 72], [0, 0.4], { ...clamp, easing: Easing.out(Easing.quad) }) : 0;
  const flowDash = -(local * 6) % 60;
  const clogX = 432 + jitter + cleared * 150;
  const clogY = 424 - cleared * 60;
  const label = (x: number, y: number, text: string, size = 40, color: string = C.ink) => (
    <text x={x} y={y} fontFamily={HAND} fontWeight={700} fontSize={size} fill={color}>
      {text}
    </text>
  );
  return (
    <svg width={width} height={(width * 560) / 800} viewBox="0 0 800 560" style={{ display: "block" }}>
      {/* porcelaine */}
      <path d="M96 96 H492 Q504 176 566 208 L700 208 L700 548 L236 548 Q222 430 164 330 Q104 232 96 96 Z" fill={C.white} stroke={C.ink} strokeWidth={9} strokeLinejoin="round" />
      {/* cuvette */}
      <clipPath id="bowl">
        <path d="M140 116 H452 Q452 250 372 312 L288 312 Q164 246 140 116 Z" />
      </clipPath>
      <path d="M140 116 H452 Q452 250 372 312 L288 312 Q164 246 140 116 Z" fill={C.paper} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
      <rect x={130} y={level} width={340} height={220} fill={C.teal} opacity={0.55} clipPath="url(#bowl)" />
      {/* siphon : conduit, puis eau jusqu'au déversoir */}
      <path d={TRAP} fill="none" stroke={C.ink} strokeWidth={86} strokeLinecap="butt" />
      <path d={TRAP} fill="none" stroke={C.paper} strokeWidth={70} strokeLinecap="butt" />
      <path d={TRAP} fill="none" stroke={C.teal} strokeOpacity={0.55} strokeWidth={70} pathLength={1} strokeDasharray={`${0.5 + cleared * 0.5} 1`} />
      {(mode === "flow" || cleared > 0.5) && <path d={TRAP} fill="none" stroke={C.white} strokeOpacity={0.9} strokeWidth={8} strokeLinecap="round" strokeDasharray="22 38" strokeDashoffset={flowDash} />}
      {/* bouchon */}
      {mode !== "flow" && (
        <g transform={`translate(${clogX} ${clogY}) scale(${mode === "clog" ? pulse : 1 - cleared * 0.55})`} opacity={1 - cleared * 0.85}>
          <circle cx={-14} cy={4} r={24} fill="#C9A47A" stroke={C.ink} strokeWidth={6} />
          <circle cx={16} cy={-8} r={20} fill="#E3C9A6" stroke={C.ink} strokeWidth={6} />
          <circle cx={10} cy={16} r={17} fill="#B98B5E" stroke={C.ink} strokeWidth={6} />
        </g>
      )}
      {/* ventouse + ondes de pression */}
      {mode === "plunge" && (
        <g transform={`translate(0 ${stroke * 16})`}>
          <rect x={322} y={70} width={16} height={190} rx={8} fill="#C99A5B" stroke={C.ink} strokeWidth={6} />
          <path d="M282 300 Q282 246 330 246 Q378 246 378 300 Z" fill={C.ink} />
        </g>
      )}
      {mode === "plunge" &&
        [0, 1, 2].map((i) => {
          const k = ((local / 16 + i / 3) % 1 + 1) % 1;
          return <path key={i} d={TRAP} fill="none" stroke={C.coral} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray="0.035 1" strokeDashoffset={-(0.04 + k * 0.3)} opacity={1 - k} />;
        })}
      {/* câble du furet */}
      {mode === "auger" && (
        <>
          <path d="M330 60 L330 292" stroke="#8A93A3" strokeWidth={16} strokeLinecap="round" />
          <path d={TRAP} fill="none" stroke={C.ink} strokeWidth={13} strokeLinecap="round" pathLength={1} strokeDasharray={`${cable} 1`} />
          <path d={TRAP} fill="none" stroke="#C3CAD6" strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={`${cable} 1`} />
        </>
      )}
      {/* légendes */}
      {label(196, 84, "Bowl", 44)}
      {label(618, 190, "To the drain", 38)}
      {mode !== "flow" && cleared < 0.5 && (
        <>
          <path d="M176 500 Q300 520 394 454" fill="none" stroke={C.coral} strokeWidth={7} strokeLinecap="round" />
          <path d="M374 452 L395 453 L390 474" fill="none" stroke={C.coral} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
          {label(14, 512, "The clog", 46, C.coral)}
        </>
      )}
      {label(262, 534, "First bend (trap)", 36)}
    </svg>
  );
};

// ---------- Schéma en coupe : les évacuations de la maison et la canalisation principale ----------
const MAIN = "M150 250 L150 430 L790 430";
export const HouseDrain: React.FC<{ mode: string; local: number; width?: number }> = ({ local, width = 800 }) => {
  const flush = interpolate(local, [8, 60], [0, 0.86], { ...clamp, easing: Easing.inOut(Easing.quad) }); // l'eau de la chasse descend puis file vers le bouchon
  const back = interpolate(local, [60, 108], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) }); // elle remonte dans les autres évacuations
  const pool = interpolate(local, [100, 132], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const pulse = 1 + Math.sin(local / 5) * 0.07;
  const pipe = (d: string) => (
    <>
      <path d={d} fill="none" stroke={C.ink} strokeWidth={50} strokeLinejoin="round" />
      <path d={d} fill="none" stroke={C.paper} strokeWidth={36} strokeLinejoin="round" />
    </>
  );
  const label = (x: number, y: number, text: string, size = 40, color: string = C.ink) => (
    <text x={x} y={y} fontFamily={HAND} fontWeight={700} fontSize={size} fill={color}>
      {text}
    </text>
  );
  return (
    <svg width={width} height={(width * 560) / 800} viewBox="0 0 800 560" style={{ display: "block" }}>
      {/* sol de la salle de bain */}
      <rect x={20} y={250} width={760} height={14} rx={7} fill={C.ink} />
      {/* conduits */}
      {pipe("M420 256 L420 430")}
      {pipe("M650 256 L650 430")}
      {pipe(MAIN)}
      {/* eau : chasse, puis refoulement */}
      <path d={MAIN} fill="none" stroke={C.teal} strokeOpacity={0.7} strokeWidth={36} strokeLinejoin="round" pathLength={1} strokeDasharray={`${flush} 1`} />
      <path d="M420 430 L420 256" fill="none" stroke={C.teal} strokeOpacity={0.7} strokeWidth={36} pathLength={1} strokeDasharray={`${back} 1`} />
      <path d="M650 430 L650 256" fill="none" stroke={C.teal} strokeOpacity={0.7} strokeWidth={36} pathLength={1} strokeDasharray={`${back * 0.8} 1`} />
      {/* toilettes */}
      <rect x={92} y={104} width={40} height={96} rx={8} fill={C.white} stroke={C.ink} strokeWidth={7} />
      <path d="M120 190 H214 Q212 244 168 250 H132 Z" fill={C.white} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
      {/* douche */}
      <path d="M500 250 V70 Q500 44 474 44 H452" fill="none" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
      <path d="M430 44 H472 L462 66 H440 Z" fill={C.white} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
      <rect x={346} y={232} width={160} height={20} rx={8} fill={C.white} stroke={C.ink} strokeWidth={7} />
      <ellipse cx={424} cy={230} rx={76 * pool} ry={15 * pool} fill={C.teal} opacity={0.8} />
      {/* lavabo */}
      <path d="M600 160 H700 Q700 204 650 204 Q600 204 600 160 Z" fill={C.white} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
      <rect x={638} y={204} width={24} height={46} fill={C.white} stroke={C.ink} strokeWidth={7} />
      {/* bouchon dans la canalisation principale */}
      <g transform={`translate(726 430) scale(${pulse})`}>
        <circle cx={-12} cy={3} r={21} fill="#C9A47A" stroke={C.ink} strokeWidth={6} />
        <circle cx={14} cy={-7} r={18} fill="#E3C9A6" stroke={C.ink} strokeWidth={6} />
        <circle cx={9} cy={14} r={15} fill="#B98B5E" stroke={C.ink} strokeWidth={6} />
      </g>
      {/* alerte : l'eau ressort dans la douche */}
      {pool > 0.2 && (
        <g transform={`translate(426 162) scale(${0.6 + 0.4 * pool})`}>
          <circle r={34} fill={C.coral} stroke={C.ink} strokeWidth={6} />
          <path d="M0 -18 V6" stroke={C.white} strokeWidth={9} strokeLinecap="round" />
          <circle cy={19} r={5} fill={C.white} />
        </g>
      )}
      {/* légendes */}
      {label(70, 86, "Toilet", 42)}
      {label(262, 132, "Shower", 42)}
      {label(606, 140, "Sink", 42)}
      {label(196, 400, "Main line", 42)}
      <path d="M560 520 Q650 530 706 474" fill="none" stroke={C.coral} strokeWidth={7} strokeLinecap="round" />
      <path d="M686 472 L707 473 L702 494" fill="none" stroke={C.coral} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
      {label(424, 534, "The clog", 46, C.coral)}
    </svg>
  );
};

// ---------- Schéma en coupe : la casserole de riz (proportions, ébullition, vapeur, couvercle levé, repos) ----------
export const RicePot: React.FC<{ mode: string; local: number; width?: number }> = ({ mode, local, width = 800 }) => {
  const lidOn = mode === "steam" || mode === "rest";
  const peek = mode === "peek";
  const cooked = mode === "rest" ? 1 : mode === "steam" ? interpolate(local, [10, 150], [0.15, 0.9], clamp) : mode === "peek" ? 0.5 : 0;
  const riceH = 56 + cooked * 96; // le riz gonfle en absorbant l'eau
  const waterH = mode === "rest" ? 0 : mode === "ratio" ? 84 : (1 - cooked) * 84;
  const riceTop = 450 - riceH;
  const flame = mode === "boil" ? 1 : mode === "steam" || mode === "peek" ? 0.38 : 0;
  const flick = 1 + Math.sin(local / 2.3) * 0.12;
  const lidY = peek ? interpolate(local, [0, 14], [0, -70], { ...clamp, easing: Easing.out(Easing.cubic) }) : 0;
  const lidRot = peek ? interpolate(local, [0, 14], [0, -16], clamp) : 0;
  const label = (x: number, y: number, text: string, size = 40, color: string = C.ink, anchor: "start" | "middle" | "end" = "start") => (
    <text x={x} y={y} fontFamily={HAND} fontWeight={700} fontSize={size} fill={color} textAnchor={anchor}>
      {text}
    </text>
  );
  const grains = [];
  for (let r = 0; r * 17 < riceH - 8; r++) for (let c = 0; c < 16; c++) grains.push(<ellipse key={`${r}-${c}`} cx={236 + c * 22 + (r % 2) * 11} cy={440 - r * 17} rx={8} ry={4.4} fill={C.white} stroke={C.ink} strokeWidth={2.2} transform={`rotate(${((r * 7 + c * 13) % 5) * 14 - 28} ${236 + c * 22 + (r % 2) * 11} ${440 - r * 17})`} />);
  const steamPath = (x: number, k: number) => `M${x} ${riceTop - 8} C${x - 26} ${riceTop - 50} ${x + 26} ${riceTop - 86} ${x} ${Math.max(214, riceTop - 130 - k)}`;
  return (
    <svg width={width} height={(width * 560) / 800} viewBox="0 0 800 560" style={{ display: "block" }}>
      {/* plaque et flamme */}
      <rect x={170} y={500} width={460} height={18} rx={9} fill={C.ink} />
      {flame > 0 &&
        [270, 335, 400, 465, 530].map((x, i) => (
          <path key={x} d={`M${x - 16} 498 Q${x - 22} ${498 - 30 * flame} ${x} ${498 - 62 * flame * (i % 2 ? flick : 2 - flick)} Q${x + 22} ${498 - 30 * flame} ${x + 16} 498 Z`} fill={C.coral} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        ))}
      {/* casserole */}
      <path d="M196 190 V452 Q196 476 220 476 H580 Q604 476 604 452 V190" fill={C.paper} stroke={C.ink} strokeWidth={10} strokeLinejoin="round" />
      <path d="M604 236 H700" stroke={C.ink} strokeWidth={22} strokeLinecap="round" />
      <clipPath id="potin">
        <path d="M204 196 V450 Q204 468 222 468 H578 Q596 468 596 450 V196 Z" />
      </clipPath>
      <g clipPath="url(#potin)">
        {waterH > 0 && <rect x={200} y={riceTop - waterH} width={400} height={waterH + riceH + 30} fill={C.teal} opacity={0.5} />}
        <rect x={200} y={riceTop} width={400} height={riceH + 30} fill="#F3EBDD" opacity={0.9} />
        {grains}
        {mode === "boil" &&
          [0, 1, 2, 3, 4, 5, 6].map((i) => {
            const k = ((local / 22 + i / 7) % 1 + 1) % 1;
            return <circle key={i} cx={240 + i * 54 + Math.sin(local / 6 + i) * 6} cy={440 - k * (riceH + waterH - 14)} r={7 + (i % 3) * 3} fill="none" stroke={C.white} strokeWidth={5} opacity={1 - k * 0.7} />;
          })}
        {(mode === "steam" || mode === "rest") &&
          [270, 400, 530].map((x, i) => <path key={x} d={steamPath(x, 0)} fill="none" stroke={mode === "rest" ? C.teal : C.coral} strokeWidth={8} strokeLinecap="round" strokeDasharray="20 22" strokeDashoffset={-(local * 2.4) + i * 14} opacity={0.85} />)}
      </g>
      {/* vapeur qui s'échappe quand on soulève le couvercle */}
      {peek &&
        [300, 400, 500].map((x, i) => {
          const k = ((local / 26 + i / 3) % 1 + 1) % 1;
          return <path key={x} d={`M${x} ${170 - k * 90} q-18 -22 0 -44 q18 -22 0 -44`} fill="none" stroke={C.coral} strokeWidth={9} strokeLinecap="round" opacity={1 - k} />;
        })}
      {/* couvercle */}
      {(lidOn || peek) && (
        <g transform={`translate(0 ${lidY}) rotate(${lidRot} 610 186)`}>
          <path d="M180 186 Q400 132 620 186 Z" fill={C.white} stroke={C.ink} strokeWidth={9} strokeLinejoin="round" />
          <rect x={376} y={126} width={48} height={26} rx={10} fill={C.ink} />
        </g>
      )}
      {/* légendes */}
      {mode === "ratio" && (
        <>
          <path d={`M172 ${riceTop - waterH} V${riceTop}`} stroke={C.teal} strokeWidth={8} strokeLinecap="round" />
          {label(160, riceTop - waterH / 2 + 12, "1½ water", 40, C.teal, "end")}
          <path d={`M172 ${riceTop + 6} V450`} stroke={C.coral} strokeWidth={8} strokeLinecap="round" />
          {label(160, riceTop + riceH / 2 + 16, "1 rice", 40, C.coral, "end")}
          {label(400, 110, "Measured, never by eye", 44, C.ink, "middle")}
        </>
      )}
      {mode === "boil" && label(400, 110, "High heat, lid off, one stir", 46, C.ink, "middle")}
      {mode === "steam" && label(400, 96, "Trapped steam cooks the rice", 46, C.ink, "middle")}
      {mode === "peek" && label(250, 548, "Every peek lets the steam out", 44, C.coral)}
      {mode === "rest" && (
        <>
          {label(400, 96, "Heat off, lid on", 46, C.ink, "middle")}
          {label(400, 548, "The moisture evens out", 44, C.teal, "middle")}
        </>
      )}
    </svg>
  );
};

const DIAGRAMS: Record<string, React.FC<{ mode: string; local: number; width?: number }>> = {
  "toilet-trap": ({ mode, local, width }) => <ToiletTrap mode={mode as TrapMode} local={local} width={width} />,
  "rice-pot": ({ mode, local, width }) => <RicePot mode={mode} local={local} width={width} />,
  "house-drain": ({ mode, local, width }) => <HouseDrain mode={mode} local={local} width={width} />,
};

export const DiagramView: React.FC<{ name: string; mode: string; local: number; width?: number }> = ({ name, mode, local, width }) => {
  const D = DIAGRAMS[name];
  return D ? <D mode={mode} local={local} width={width} /> : null;
};

/** Panneau « notice » qui glisse sur la photo avec un schéma animé. */
export const DiagramPanel: React.FC<{ diagrams?: Diagram[]; width?: number }> = ({ diagrams, width = 880 }) => {
  const { fps } = useVideoConfig();
  const cue = useCue(diagrams, 6);
  if (!cue) return null;
  const { item, local, left } = cue;
  const s = spring({ frame: local, fps, config: { damping: 14, stiffness: 120 } });
  const out = interpolate(left, [0, 9], [0, 1], clamp);
  return (
    <div style={{ width, transform: `translateX(${(1 - s * out) * (width + 140)}px) rotate(${1.5 - (1 - s) * 5}deg)`, background: C.paper, backgroundImage: `linear-gradient(rgba(27,42,65,0.07) 2px, transparent 2px), linear-gradient(90deg, rgba(27,42,65,0.07) 2px, transparent 2px)`, backgroundSize: "40px 40px", border: `7px solid ${C.ink}`, borderRadius: 30, boxShadow: `12px 12px 0 ${C.teal}`, padding: "18px 22px 10px", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 2 }}>
        <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 26, letterSpacing: 4, color: C.teal }}>HOW IT WORKS</span>
        <span style={{ fontFamily: HAND, fontWeight: 700, fontSize: 46, color: C.ink, lineHeight: 1 }}>{item.title}</span>
      </div>
      <DiagramView name={item.name} mode={item.mode} local={local} width={width - 58} />
      <div style={{ position: "absolute", top: -26, left: 90, width: 170, height: 46, background: "rgba(255,201,77,0.88)", transform: "rotate(-4deg)" }} />
    </div>
  );
};

// ---------- Transitions signées (3 variantes qui tournent) ----------
/** p : 0 → 1 pendant la sortie de la scène, puis 1 → 2 pendant l'entrée de la suivante. */
export const SignedTransition: React.FC<{ p: number; variant: number }> = ({ p, variant }) => {
  if (p <= 0 || p >= 2) return null;
  const v = ((variant % 3) + 3) % 3;
  if (v === 0) {
    // Page de notice qui se tourne : une feuille arrive par la droite, repart par la gauche.
    const x = p <= 1 ? interpolate(p, [0, 1], [104, 0]) : interpolate(p, [1, 2], [0, -104]);
    const rot = p <= 1 ? interpolate(p, [0, 1], [5, 0]) : interpolate(p, [1, 2], [0, -5]);
    return (
      <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-6%", bottom: "-6%", left: "-3%", width: "106%", transform: `translateX(${x}%) rotate(${rot}deg)`, background: C.paper, backgroundImage: `radial-gradient(rgba(27,42,65,0.10) 2px, transparent 2px)`, backgroundSize: "44px 44px", boxShadow: "-40px 0 70px rgba(27,42,65,0.35), 40px 0 70px rgba(27,42,65,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 300, height: 300, borderRadius: 80, background: C.coral, border: `10px solid ${C.ink}`, boxShadow: `12px 12px 0 ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${-rot * 2}deg)` }}>
            <WMark size={210} color={C.paper} stroke={19} />
          </div>
        </div>
      </AbsoluteFill>
    );
  }
  if (v === 1) {
    // Wiki tire un rideau corail à travers l'écran.
    const x = p <= 1 ? interpolate(p, [0, 1], [-112, 0]) : interpolate(p, [1, 2], [0, 112]);
    return (
      <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "100%", transform: `translateX(${x}%)` }}>
          <div style={{ position: "absolute", inset: 0, background: C.coral, boxShadow: "30px 0 60px rgba(27,42,65,0.35)" }} />
          <div style={{ position: "absolute", right: -90, top: 0, bottom: 0, width: 90, background: C.sun, clipPath: "polygon(0 0, 100% 6%, 60% 50%, 100% 94%, 0 100%)" }} />
          <div style={{ position: "absolute", right: -330, bottom: 150 + Math.abs(Math.sin(p * 16)) * 26 }}>
            <Img src={staticFile("brand/mascot-point.png")} style={{ height: 420, display: "block", transform: `rotate(${6 + Math.sin(p * 16) * 4}deg)`, filter: "drop-shadow(0 14px 18px rgba(27,42,65,0.3))" }} />
          </div>
        </div>
      </AbsoluteFill>
    );
  }
  // Iris : un cercle encre se referme sur le centre, puis se rouvre sur la scène suivante.
  const r = p <= 1 ? interpolate(p, [0, 1], [78, 0], { easing: Easing.in(Easing.quad), ...clamp }) : interpolate(p, [1, 2], [0, 78], { easing: Easing.out(Easing.quad), ...clamp });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, transparent ${r}vmax, ${C.coral} ${r}vmax, ${C.coral} ${r + 1.4}vmax, ${C.ink} ${r + 1.4}vmax)` }} />
    </AbsoluteFill>
  );
};
