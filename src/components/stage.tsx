// Mise en scène « plein écran » : gags de Wiki, avant/après, schémas animés en coupe, transitions signées.
import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, FONT } from "../theme";
import { HAND, Mascot, WMark, type Pose } from "./brand";
import type { Diagram, Gag } from "../types";
import { DryerVent } from "./diagrams/DryerVent";
import { WhitenSoak } from "./diagrams/WhitenSoak";
import { CabinetGrease } from "./diagrams/CabinetGrease";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Garde-fou des légendes de schéma : réduit le corps si le texte dépasserait du cadre (viewBox large de 800). */
const fitSize = (text: string, size: number, x: number, anchor: "start" | "middle" | "end", vw = 800) => {
  const room = anchor === "middle" ? 2 * Math.min(x, vw - x) - 20 : anchor === "end" ? x - 10 : vw - x - 10;
  const est = text.length * size * 0.5;
  return est > room ? Math.max(18, Math.floor((size * room) / est)) : size;
};
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
    <text x={x} y={y} fontFamily={HAND} fontWeight={700} fontSize={fitSize(text, size, x, "start")} fill={color}>
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
    <text x={x} y={y} fontFamily={HAND} fontWeight={700} fontSize={fitSize(text, size, x, "start")} fill={color}>
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

// ---------- Schéma en coupe : le steak à la poêle (surface humide, poêle chaude, saisie, arrosage, sonde, repos, sens des fibres) ----------
export const SteakPan: React.FC<{ mode: string; local: number; width?: number }> = ({ mode, local, width = 800 }) => {
  const RAW = "#D4667A", GREY = "#B5A8A2", BROWN = "#8A5A3C", CRUST = "#5E3A22", PINK = "#E9939A", BOARD = "#E3C9A6";
  const inPan = mode === "dry" || mode === "heat" || mode === "sear" || mode === "baste" || mode === "temp";
  const flame = mode === "heat" || mode === "sear" ? 1 : mode === "baste" || mode === "temp" ? 0.55 : mode === "dry" ? 0.3 : 0;
  const flick = 1 + Math.sin(local / 2.3) * 0.12;
  const pulse = 1 + Math.sin(local / 5) * 0.1;
  const grow = interpolate(local, [8, 130], [4, 24], clamp);
  const label = (x: number, y: number, text: string, size = 40, color: string = C.ink, anchor: "start" | "middle" | "end" = "start") => (
    <text x={x} y={y} fontFamily={HAND} fontWeight={700} fontSize={fitSize(text, size, x, anchor)} fill={color} textAnchor={anchor}>
      {text}
    </text>
  );
  const wisp = (x: number, i: number, color: string, top = 250) => (
    <path key={x} d={`M${x} 380 C${x - 24} ${340} ${x + 24} ${300} ${x} ${top}`} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" strokeDasharray="20 22" strokeDashoffset={-(local * 2.4) + i * 14} opacity={0.85} />
  );
  const steak = (fill: string, y = 388) => <rect x={270} y={y} width={260} height={80} rx={34} fill={fill} stroke={C.ink} strokeWidth={8} />;
  const doneness = mode === "temp" || mode === "rest";
  return (
    <svg width={width} height={(width * 560) / 800} viewBox="0 0 800 560" style={{ display: "block" }}>
      {mode === "grain" ? (
        <>
          <rect x={130} y={170} width={540} height={330} rx={26} fill={BOARD} stroke={C.ink} strokeWidth={9} />
          <clipPath id="steaktop">
            <ellipse cx={400} cy={336} rx={200} ry={112} />
          </clipPath>
          <ellipse cx={400} cy={336} rx={200} ry={112} fill={BROWN} stroke={C.ink} strokeWidth={9} />
          <g clipPath="url(#steaktop)">
            {[250, 278, 306, 334, 362, 390, 418].map((y) => (
              <path key={y} d={`M190 ${y} Q400 ${y - 14} 610 ${y}`} fill="none" stroke={C.ink} strokeWidth={4} opacity={0.4} />
            ))}
          </g>
          {[290, 345, 400, 455, 510].map((x, i) => {
            const k = interpolate(local, [12 + i * 14, 26 + i * 14], [0, 1], clamp);
            return k > 0 ? <path key={x} d={`M${x} 214 V${214 + 244 * k}`} stroke={C.coral} strokeWidth={9} strokeLinecap="round" strokeDasharray="18 12" /> : null;
          })}
          {label(400, 96, "Find the grain, then cut across it", 46, C.ink, "middle")}
          {label(400, 548, "Short fibres, tender bites", 44, C.coral, "middle")}
        </>
      ) : (
        <>
          <g transform="translate(400 466) scale(1.3) translate(-400 -500)">
          {inPan ? (
            <>
              <rect x={170} y={500} width={460} height={18} rx={9} fill={C.ink} />
              {flame > 0 &&
                [250, 325, 400, 475, 550].map((x, i) => (
                  <path key={x} d={`M${x - 15} 498 Q${x - 20} ${498 - 16 * flame} ${x} ${498 - 30 * flame * (i % 2 ? flick : 2 - flick)} Q${x + 20} ${498 - 16 * flame} ${x + 15} 498 Z`} fill={C.coral} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
                ))}
              <path d="M168 372 L188 462 Q192 478 212 478 H588 Q608 478 612 462 L632 372" fill={C.paper} stroke={C.ink} strokeWidth={11} strokeLinejoin="round" strokeLinecap="round" />
              <path d="M634 384 L688 375" stroke={C.ink} strokeWidth={22} strokeLinecap="round" />
            </>
          ) : (
            <rect x={150} y={468} width={500} height={30} rx={12} fill={BOARD} stroke={C.ink} strokeWidth={9} />
          )}
          {/* le steak */}
          {mode !== "heat" && (
            <>
              {steak(mode === "dry" ? GREY : doneness || mode === "baste" ? BROWN : RAW)}
              {doneness && <rect x={292} y={408} width={216} height={40} rx={20} fill={PINK} />}
              <clipPath id="steakcut">
                <rect x={274} y={392} width={252} height={72} rx={30} />
              </clipPath>
              <g clipPath="url(#steakcut)">
                {mode === "sear" && <rect x={270} y={468 - grow} width={260} height={grow} fill={CRUST} />}
                {mode === "baste" && (
                  <>
                    <rect x={270} y={388} width={260} height={24} fill={CRUST} />
                    <rect x={270} y={468 - grow * 0.8} width={260} height={grow} fill={CRUST} />
                  </>
                )}
              </g>
            </>
          )}
          {mode === "dry" && (
            <>
              {[310, 360, 410, 460, 500].map((x, i) => (
                <circle key={x} cx={x} cy={380 - (i % 2) * 4} r={9} fill={C.teal} stroke={C.ink} strokeWidth={4} />
              ))}
              {[320, 400, 480].map((x, i) => wisp(x, i, C.teal, 266))}
            </>
          )}
          {mode === "heat" && (
            <>
              <rect x={206} y={462} width={388} height={9} rx={4} fill={C.sun} />
              {[300, 400, 500].map((x, i) => wisp(x, i, "#9AA3B2", 266))}
            </>
          )}
          {mode === "sear" && (
            <>
              {[236, 252, 548, 564].map((x, i) => (
                <path key={x} d={`M${x} 462 l${i < 2 ? -10 : 10} ${-18 * (i % 2 ? flick : 2 - flick)}`} stroke={C.coral} strokeWidth={7} strokeLinecap="round" />
              ))}
            </>
          )}
          {mode === "baste" && (
            <>
              <ellipse cx={226} cy={466} rx={30} ry={8} fill={C.sun} stroke={C.ink} strokeWidth={4} />
              {[0, 1, 2, 3].map((i) => {
                const k = ((local / 40 + i / 4) % 1 + 1) % 1;
                const x = 226 + (400 - 226) * k;
                const y = 456 - Math.sin(k * Math.PI) * 150 - (456 - 380) * k;
                return <circle key={i} cx={x} cy={y} r={10} fill={C.sun} stroke={C.ink} strokeWidth={4} opacity={k > 0.94 ? 0.3 : 1} />;
              })}
            </>
          )}
          {mode === "temp" && (
            <>
              <path d="M668 348 L404 432" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
              <circle cx={680} cy={343} r={20} fill={C.white} stroke={C.ink} strokeWidth={7} />
              <circle cx={404} cy={432} r={9 * pulse} fill={C.coral} stroke={C.ink} strokeWidth={4} />
            </>
          )}
          {mode === "rest" && (
            <>
              {[-1, 1].map((d) =>
                [0, 1].map((r) => (
                  <path key={`${d}${r}`} d={`M${400 + d * 20} ${420 + r * 16} H${400 + d * 104}`} stroke={C.teal} strokeWidth={7} strokeLinecap="round" strokeDasharray="14 12" strokeDashoffset={d * local * 1.6} />
                )),
              )}
            </>
          )}
          </g>
        </>
      )}
      {mode === "dry" && (
        <>
          {label(400, 96, "Water turns to steam in the pan", 46, C.ink, "middle")}
          {label(400, 548, "Steamed meat turns grey, not brown", 44, C.coral, "middle")}
        </>
      )}
      {mode === "heat" && (
        <>
          {label(400, 96, "3 to 5 minutes, until really hot", 46, C.ink, "middle")}
          {label(400, 548, "The oil shimmers and just starts to smoke", 42, C.coral, "middle")}
        </>
      )}
      {mode === "sear" && (
        <>
          {label(400, 96, "Now leave it alone", 50, C.ink, "middle")}
          {label(400, 548, "Patience builds the crust", 46, C.coral, "middle")}
        </>
      )}
      {mode === "baste" && (
        <>
          {label(400, 96, "Medium heat, foaming butter", 46, C.ink, "middle")}
          {label(400, 548, "Spoon it over, again and again", 44, C.coral, "middle")}
        </>
      )}
      {mode === "temp" && (
        <>
          {label(24, 60, "Rare 125°F", 30, C.coral)}
          {label(392, 60, "Medium-rare 130–135°F", 30, C.ink, "middle")}
          {label(776, 60, "Medium 140°F", 30, BROWN, "end")}
          {label(400, 112, "Probe from the side, into the thickest part", 36, C.teal, "middle")}
          {label(400, 548, "It rises a few degrees while it rests", 42, C.coral, "middle")}
        </>
      )}
      {mode === "rest" && (
        <>
          {label(400, 96, "Rest at least 5 minutes", 48, C.ink, "middle")}
          {label(400, 548, "The juices spread back through the meat", 42, C.teal, "middle")}
        </>
      )}
    </svg>
  );
};

// ---------- Schéma en coupe : l'anneau de calcaire dans la cuvette (dépôt, niveau abaissé, acide, trempage, pierre ponce, entretien) ----------
export const ToiletRing: React.FC<{ mode: string; local: number; width?: number }> = ({ mode, local, width = 800 }) => {
  const RUST = "#C9772E", STONE = "#9AA3B2";
  const bez = (t: number) => {
    const u = 1 - t;
    return { x: u * u * u * 210 + 3 * u * u * t * 210 + 3 * u * t * t * 300 + t * t * t * 400, y: u * u * u * 170 + 3 * u * u * t * 330 + 3 * u * t * t * 462 + t * t * t * 462 };
  };
  const pts = Array.from({ length: 61 }, (_, i) => bez(i / 60));
  const seg = (y0: number, y1: number, side: 1 | -1) =>
    pts
      .filter((p) => p.y >= y0 && p.y <= y1)
      .map((p) => `${side === 1 ? p.x : 800 - p.x},${p.y}`)
      .join(" ");
  const wallX = (y: number) => pts.reduce((b, p) => (Math.abs(p.y - y) < Math.abs(b.y - y) ? p : b)).x;
  const lowered = mode === "low" || mode === "acid" || mode === "soak" || mode === "pumice";
  const level = mode === "low" ? interpolate(local, [10, 60], [318, 410], { ...clamp, easing: Easing.inOut(Easing.cubic) }) : lowered ? 410 : 318;
  const fade = mode === "soak" ? interpolate(local, [20, 150], [1, 0.45], clamp) : mode === "pumice" ? interpolate(local, [30, 140], [1, 0.15], clamp) : mode === "weekly" ? 0 : 1;
  const pulse = 1 + Math.sin(local / 5) * 0.1;
  const rub = Math.sin(local / 3) * 9;
  const label = (x: number, y: number, text: string, size = 40, color: string = C.ink, anchor: "start" | "middle" | "end" = "start") => (
    <text x={x} y={y} fontFamily={HAND} fontWeight={700} fontSize={fitSize(text, size, x, anchor)} fill={color} textAnchor={anchor}>
      {text}
    </text>
  );
  return (
    <svg width={width} height={(width * 560) / 800} viewBox="0 0 800 560" style={{ display: "block" }}>
      {/* cuvette en coupe */}
      <path d="M210 170 C210 330 300 462 400 462 C500 462 590 330 590 170" fill={C.white} stroke={C.ink} strokeWidth={11} strokeLinecap="round" />
      <rect x={176} y={146} width={448} height={30} rx={15} fill={C.paper} stroke={C.ink} strokeWidth={9} />
      <path d="M372 466 V496 H428 V466" fill={C.paper} stroke={C.ink} strokeWidth={9} strokeLinejoin="round" />
      <clipPath id="bowlin">
        <path d="M216 176 C216 330 302 456 400 456 C498 456 584 330 584 176 Z" />
      </clipPath>
      <g clipPath="url(#bowlin)">
        <rect x={200} y={level} width={400} height={300} fill={C.teal} opacity={0.42} />
        <path d={`M200 ${level} H600`} stroke={C.teal} strokeWidth={6} />
        {mode === "ring" &&
          [0, 1, 2, 3, 4, 5].map((i) => {
            const k = ((local / 70 + i / 6) % 1 + 1) % 1;
            const side = i % 2 ? 1 : -1;
            return <circle key={i} cx={400 + side * (30 + k * 120)} cy={400 - k * 70 + (i % 3) * 8} r={6} fill={RUST} opacity={0.9 - k * 0.3} />;
          })}
      </g>
      {/* l'anneau, des deux côtés */}
      {fade > 0 && (
        <g opacity={fade}>
          <polyline points={seg(300, 336, 1)} fill="none" stroke={RUST} strokeWidth={mode === "ring" ? 17 * pulse : 17} strokeLinecap="round" />
          <polyline points={seg(300, 336, -1)} fill="none" stroke={RUST} strokeWidth={mode === "ring" ? 17 * pulse : 17} strokeLinecap="round" />
        </g>
      )}
      {/* film d'acide qui recouvre la paroi */}
      {(mode === "acid" || mode === "soak") &&
        ([1, -1] as const).map((side) => <polyline key={side} points={seg(196, 404, side)} fill="none" stroke={C.sun} strokeWidth={8} strokeLinecap="round" strokeDasharray="22 14" strokeDashoffset={-local * (mode === "acid" ? 2.2 : 0.5)} transform={`translate(${side * 13} 0)`} />)}
      {mode === "acid" &&
        [0, 1, 2].map((i) => {
          const k = ((local / 30 + i / 3) % 1 + 1) % 1;
          return <circle key={i} cx={wallX(318) + 26 + i * 9} cy={318 - k * 46} r={5 + i} fill="none" stroke={C.coral} strokeWidth={4} opacity={1 - k} />;
        })}
      {mode === "soak" && (
        <g transform="translate(400 300)">
          <circle r={52} fill={C.white} stroke={C.ink} strokeWidth={8} />
          <path d="M0 0 V-34" stroke={C.coral} strokeWidth={8} strokeLinecap="round" transform={`rotate(${local * 2.4})`} />
          <circle r={6} fill={C.ink} />
        </g>
      )}
      {mode === "pumice" && (
        <g transform={`translate(${wallX(318) + 14} ${300 + rub})`}>
          <rect x={0} y={0} width={70} height={36} rx={12} fill={STONE} stroke={C.ink} strokeWidth={7} transform="rotate(24)" />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={84 + i * 16} cy={-6 + i * 10} r={6} fill={C.teal} stroke={C.ink} strokeWidth={3} />
          ))}
        </g>
      )}
      {mode === "weekly" &&
        [
          [300, 260],
          [500, 240],
          [400, 300],
        ].map(([x, y], i) => (
          <path key={i} d={`M${x} ${y - 20} L${x + 6} ${y - 6} L${x + 20} ${y} L${x + 6} ${y + 6} L${x} ${y + 20} L${x - 6} ${y + 6} L${x - 20} ${y} L${x - 6} ${y - 6} Z`} fill={C.sun} stroke={C.ink} strokeWidth={4} transform={`scale(${1 + Math.sin(local / 6 + i) * 0.18})`} style={{ transformOrigin: `${x}px ${y}px` }} />
        ))}
      {/* légendes */}
      {mode === "ring" && (
        <>
          {label(400, 96, "Minerals settle at the water line", 46, C.ink, "middle")}
          {label(400, 546, "They harden, and a brush glides over them", 40, C.coral, "middle")}
        </>
      )}
      {mode === "low" && (
        <>
          {label(400, 96, "Lower the water level", 48, C.ink, "middle")}
          {label(400, 546, "Now the cleaner touches the stain directly", 40, C.coral, "middle")}
        </>
      )}
      {mode === "acid" && (
        <>
          {label(400, 96, "Vinegar or citric acid", 48, C.ink, "middle")}
          {label(400, 546, "Acid dissolves limescale and rust", 44, C.coral, "middle")}
        </>
      )}
      {mode === "soak" && (
        <>
          {label(400, 96, "At least 30 minutes", 48, C.ink, "middle")}
          {label(400, 546, "Time softens the mineral layer", 44, C.teal, "middle")}
        </>
      )}
      {mode === "pumice" && (
        <>
          {label(400, 96, "Wet stone, very light pressure", 46, C.ink, "middle")}
          {label(400, 546, "A dry stone scratches", 46, C.coral, "middle")}
        </>
      )}
      {mode === "weekly" && (
        <>
          {label(400, 96, "Once a week", 50, C.ink, "middle")}
          {label(400, 546, "A cup of vinegar, one hour, then flush", 42, C.teal, "middle")}
        </>
      )}
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
    <text x={x} y={y} fontFamily={HAND} fontWeight={700} fontSize={fitSize(text, size, x, anchor)} fill={color} textAnchor={anchor}>
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

// ---------- Schéma : la machine à laver vue de face (joint, tiroir, cycle, filtre, séchage) ----------
export const Washer: React.FC<{ mode: string; local: number; width?: number }> = ({ mode, local, width = 800 }) => {
  const pulse = 1 + Math.sin(local / 5) * 0.08;
  const hot = (m: string) => mode === m || mode === "spots";
  const drawerOut = mode === "drawer" ? interpolate(local, [4, 22], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }) : 0;
  const ajar = mode === "dry" ? interpolate(local, [4, 24], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }) : 0;
  const capOut = mode === "filter" ? interpolate(local, [6, 30], [0, 1], clamp) : 0;
  const label = (x: number, y: number, text: string, size = 40, color: string = C.ink, anchor: "start" | "middle" | "end" = "start") => (
    <text x={x} y={y} fontFamily={HAND} fontWeight={700} fontSize={fitSize(text, size, x, anchor)} fill={color} textAnchor={anchor}>
      {text}
    </text>
  );
  const ring = (cx: number, cy: number, r: number) => <circle cx={cx} cy={cy} r={r * pulse} fill="none" stroke={C.coral} strokeWidth={9} strokeDasharray="16 12" />;
  return (
    <svg width={width} height={(width * 560) / 800} viewBox="0 0 800 560" style={{ display: "block" }}>
      {/* carrosserie */}
      <rect x={250} y={30} width={300} height={496} rx={22} fill={C.white} stroke={C.ink} strokeWidth={9} />
      <path d="M250 112 H550" stroke={C.ink} strokeWidth={7} />
      <rect x={284} y={526} width={36} height={14} rx={5} fill={C.ink} />
      <rect x={480} y={526} width={36} height={14} rx={5} fill={C.ink} />
      {/* bandeau : tiroir, programmateur */}
      <g transform={`translate(${-drawerOut * 70} ${-drawerOut * 6})`}>
        <rect x={268} y={50} width={100} height={44} rx={9} fill={hot("drawer") ? C.sun : C.paper} stroke={C.ink} strokeWidth={7} />
        <path d="M290 72 H346" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
      </g>
      <circle cx={486} cy={72} r={24} fill={C.paper} stroke={C.ink} strokeWidth={7} />
      <path d="M486 72 L486 54" stroke={C.coral} strokeWidth={7} strokeLinecap="round" transform={`rotate(${mode === "cycle" ? local * 2 : 30} 486 72)`} />
      {/* hublot : joint, vitre, tambour */}
      <circle cx={400} cy={296} r={128} fill={hot("seal") ? C.sun : "#AEB6C4"} stroke={C.ink} strokeWidth={8} />
      <clipPath id="drum">
        <circle cx={400} cy={296} r={98} />
      </clipPath>
      <circle cx={400} cy={296} r={98} fill={C.paper} stroke={C.ink} strokeWidth={7} />
      {mode === "cycle" && (
        <g clipPath="url(#drum)">
          <path d={`M290 ${318 + Math.sin(local / 6) * 8} Q345 ${296 + Math.cos(local / 5) * 14} 400 ${318 + Math.sin(local / 7) * 8} T510 ${316 + Math.cos(local / 6) * 8} V410 H290 Z`} fill={C.teal} opacity={0.6} />
          {[0, 1, 2, 3, 4].map((i) => {
            const k = ((local / 24 + i / 5) % 1 + 1) % 1;
            return <circle key={i} cx={330 + i * 34} cy={380 - k * 70} r={6 + (i % 3) * 3} fill="none" stroke={C.white} strokeWidth={4} opacity={1 - k} />;
          })}
        </g>
      )}
      {mode === "cycle" && <path d="M400 216 A80 80 0 1 1 330 256" fill="none" stroke={C.coral} strokeWidth={8} strokeLinecap="round" strokeDasharray="22 16" strokeDashoffset={-local * 3} />}
      {/* moisissures dans le pli du joint */}
      {(mode === "seal" || mode === "spots") && [352, 384, 418, 448].map((x, i) => <circle key={x} cx={x} cy={404 + (i % 2) * 8} r={6 + (i % 2) * 2} fill={C.ink} />)}
      {/* porte entrouverte + air qui circule */}
      {ajar > 0 && (
        <>
          <ellipse cx={400 + ajar * 96} cy={296} rx={128 - ajar * 82} ry={128} fill="rgba(174,182,196,0.55)" stroke={C.ink} strokeWidth={8} />
          {[250, 296, 342].map((y, i) => (
            <path key={y} d={`M120 ${y} q26 -18 52 0 t52 0 t52 0`} fill="none" stroke={C.teal} strokeWidth={8} strokeLinecap="round" strokeDasharray="20 14" strokeDashoffset={-local * 3 + i * 9} />
          ))}
        </>
      )}
      {/* filtre de vidange */}
      <rect x={470} y={452} width={62} height={46} rx={8} fill={hot("filter") ? C.sun : C.paper} stroke={C.ink} strokeWidth={7} />
      <g transform={`translate(${capOut * 78} ${capOut * 6}) rotate(${-capOut * 200} 501 475)`}>
        <circle cx={501} cy={475} r={14} fill={C.white} stroke={C.ink} strokeWidth={6} />
        <path d="M491 475 H511" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
      </g>
      {mode === "filter" && capOut > 0.5 && (
        <>
          <path d="M506 486 Q560 500 600 532" fill="none" stroke={C.teal} strokeWidth={10} strokeLinecap="round" strokeDasharray="16 12" strokeDashoffset={-local * 3} />
          <path d="M560 532 H680 L668 548 H572 Z" fill={C.white} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
        </>
      )}
      {/* zones à problème */}
      {mode === "spots" && (
        <>
          {ring(318, 72, 66)}
          {ring(400, 404, 74)}
          {ring(501, 475, 52)}
        </>
      )}
      {/* légendes */}
      {(mode === "drawer" || mode === "spots") && label(176, 60, "Drawer", 44, C.coral, "end")}
      {(mode === "seal" || mode === "spots") && label(228, 414, "Door seal", 44, C.coral, "end")}
      {(mode === "filter" || mode === "spots") && label(580, 436, "Drain filter", 44, C.coral)}
      {mode === "cycle" && label(572, 300, "Hot + vinegar", 44, C.coral)}
      {mode === "dry" && label(226, 404, "Air dries", 40, C.teal, "end")}
      {mode === "dry" && label(226, 448, "the drum", 40, C.teal, "end")}
    </svg>
  );
};

// ---------- Schéma en coupe : la plaque vitrocéramique (tache cuite, pâte + serviette chaude, grattoir à plat, crème, grain sous la casserole) ----------
export const GlassCooktop: React.FC<{ mode: string; local: number; width?: number }> = ({ mode, local, width = 800 }) => {
  const BURNT = "#5A3A22";
  const pulse = 1 + Math.sin(local / 5) * 0.08;
  const soft = mode === "soften" ? interpolate(local, [20, 140], [0, 1], clamp) : 0;
  const push = mode === "scrape" ? interpolate(local % 110, [10, 80], [0, 1], { ...clamp, easing: ease }) : 0;
  const steep = mode === "steep";
  const slide = mode === "grit" ? interpolate(local % 120, [10, 90], [0, 1], { ...clamp, easing: ease }) : 0;
  const buff = Math.sin(local / 4) * 60;
  const label = (x: number, y: number, text: string, size = 40, color: string = C.ink, anchor: "start" | "middle" | "end" = "start") => (
    <text x={x} y={y} fontFamily={HAND} fontWeight={700} fontSize={fitSize(text, size, x, anchor)} fill={color} textAnchor={anchor}>
      {text}
    </text>
  );
  const stainOn = mode === "bake" || mode === "soften" || mode === "scrape" || mode === "steep";
  const stainW = mode === "scrape" ? 150 * (1 - push * 0.85) : 150;
  return (
    <svg width={width} height={(width * 560) / 800} viewBox="0 0 800 560" style={{ display: "block" }}>
      {/* plan de travail, verre, résistance */}
      <rect x={60} y={370} width={680} height={120} rx={14} fill={C.paper} stroke={C.ink} strokeWidth={9} />
      <rect x={90} y={330} width={620} height={44} rx={8} fill={C.ink} />
      <path d="M100 338 H700" stroke="rgba(255,255,255,0.45)" strokeWidth={5} strokeLinecap="round" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <circle key={i} cx={250 + i * 50} cy={420} r={15} fill="none" stroke={mode === "bake" ? C.coral : "#AEB6C4"} strokeWidth={8} opacity={mode === "bake" ? 0.6 + Math.sin(local / 5 + i) * 0.4 : 1} />
      ))}
      {/* chaleur qui cuit la tache */}
      {mode === "bake" &&
        [300, 400, 500].map((x, i) => {
          const k = ((local / 30 + i / 3) % 1 + 1) % 1;
          return <path key={x} d={`M${x} ${318 - k * 120} q-16 -20 0 -40 q16 -20 0 -40`} fill="none" stroke={C.coral} strokeWidth={8} strokeLinecap="round" opacity={1 - k} />;
        })}
      {/* la tache cuite sur le verre */}
      {stainOn && (
        <path d={`M${400 - stainW / 2} 330 q${stainW / 4} ${-30 * (1 - soft * 0.5)} ${stainW / 2} ${-26 * (1 - soft * 0.5)} t${stainW / 2} ${26 * (1 - soft * 0.5)} Z`} fill={BURNT} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" opacity={1 - soft * 0.35} transform={mode === "scrape" ? `translate(${push * 60} 0)` : undefined} />
      )}
      {/* pâte de bicarbonate + serviette chaude */}
      {mode === "soften" && (
        <>
          <path d="M290 300 q110 -34 220 0 v10 h-220 Z" fill={C.white} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
          <path d="M230 270 q170 -40 340 0 v24 q-170 -34 -340 0 Z" fill={C.sun} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
          {[310, 400, 490].map((x, i) => {
            const k = ((local / 40 + i / 3) % 1 + 1) % 1;
            return <path key={x} d={`M${x} ${282 + k * 40} v16`} stroke={C.teal} strokeWidth={8} strokeLinecap="round" opacity={1 - k * 0.6} />;
          })}
        </>
      )}
      {/* grattoir : à plat (bon) ou sur le coin (mauvais) */}
      {(mode === "scrape" || steep) && (
        <g transform={`translate(${steep ? 330 : 250 + push * 110} 330) rotate(${steep ? 78 : 30})`}>
          <rect x={-150} y={-16} width={120} height={32} rx={10} fill={C.teal} stroke={C.ink} strokeWidth={7} />
          <path d="M-30 -22 H0 V22 H-30 Z" fill="#DDE3EC" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        </g>
      )}
      {mode === "scrape" && (
        <>
          <path d={`M${150 + push * 110} 330 A100 100 0 0 1 ${163 + push * 110} 280`} fill="none" stroke={C.coral} strokeWidth={7} strokeDasharray="10 8" />
          {label(120, 250, "30–45°", 44, C.coral, "middle")}
        </>
      )}
      {steep && (
        <>
          <path d="M318 344 l10 16 M334 344 l-4 18" stroke={C.coral} strokeWidth={7} strokeLinecap="round" />
          <circle cx={330} cy={338} r={38 * pulse} fill="none" stroke={C.coral} strokeWidth={8} strokeDasharray="14 10" />
        </>
      )}
      {/* crème : film protecteur, chiffon qui lustre */}
      {mode === "polish" && (
        <>
          <path d="M100 328 H700" stroke={C.teal} strokeWidth={9} strokeLinecap="round" opacity={0.85} />
          <g transform={`translate(${400 + buff} 296)`}>
            <path d="M-70 26 q0 -44 70 -44 t70 44 Z" fill={C.white} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
          </g>
          {[180, 320, 560].map((x, i) => (
            <path key={x} d="M0 -16 V16 M-16 0 H16" stroke={C.sun} strokeWidth={7} strokeLinecap="round" transform={`translate(${x} ${240 - (i % 2) * 40}) scale(${0.7 + Math.abs(Math.sin(local / 7 + i)) * 0.6})`} />
          ))}
        </>
      )}
      {/* grain coincé sous la casserole */}
      {mode === "grit" && (
        <g transform={`translate(${slide * 130} 0)`}>
          <path d="M240 318 V200 H470 V318 Z" fill="#DDE3EC" stroke={C.ink} strokeWidth={9} strokeLinejoin="round" />
          <path d="M470 220 H560" stroke={C.ink} strokeWidth={14} strokeLinecap="round" />
          <circle cx={300} cy={324} r={8} fill={C.sun} stroke={C.ink} strokeWidth={4} />
        </g>
      )}
      {mode === "grit" && <path d={`M300 332 H${300 + slide * 130}`} stroke={C.coral} strokeWidth={6} strokeLinecap="round" />}
      {/* légendes */}
      {mode === "bake" && label(400, 110, "Heat bakes the spill onto the glass", 44, C.ink, "middle")}
      {mode === "bake" && label(520, 300, "Burnt-on spill", 40, C.coral)}
      {mode === "soften" && label(400, 110, "Warm moisture softens it", 46, C.ink, "middle")}
      {mode === "soften" && label(590, 270, "Hot damp towel", 38, C.teal)}
      {mode === "soften" && label(210, 318, "Paste", 38, C.coral, "end")}
      {mode === "scrape" && label(400, 110, "Blade flat, light pressure", 46, C.ink, "middle")}
      {steep && label(400, 110, "The corner digs into the glass", 46, C.coral, "middle")}
      {mode === "polish" && label(400, 110, "A thin protective layer", 46, C.ink, "middle")}
      {mode === "grit" && label(400, 110, "A trapped grain scratches the glass", 44, C.ink, "middle")}
      {mode === "grit" && label(400, 540, "Lift, never slide", 44, C.teal, "middle")}
      {label(700, 362, "Glass", 28, C.white, "end")}
    </svg>
  );
};

// ---------- Schéma en coupe : le blanc de poulet à la poêle (épaisseur inégale / égale, saisie, couvercle, thermomètre, repos) ----------
export const ChickenPan: React.FC<{ mode: string; local: number; width?: number }> = ({ mode, local, width = 800 }) => {
  const MEAT = "#F2C9A0", GOLD = "#C98A3A";
  const pulse = 1 + Math.sin(local / 5) * 0.08;
  const flat = mode === "uneven" ? 0 : mode === "even" ? interpolate(local, [15, 70], [0, 1], { ...clamp, easing: ease }) : 1;
  const hump = 96 - flat * 40; // hauteur du côté épais
  const tail = 22 + flat * 34; // hauteur du côté mince
  const lidOn = mode === "steam";
  const probe = mode === "temp" ? interpolate(local, [8, 40], [0, 1], { ...clamp, easing: ease }) : 0;
  const onBoard = mode === "rest";
  const baseY = onBoard ? 400 : 372;
  const label = (x: number, y: number, text: string, size = 40, color: string = C.ink, anchor: "start" | "middle" | "end" = "start") => (
    <text x={x} y={y} fontFamily={HAND} fontWeight={700} fontSize={fitSize(text, size, x, anchor)} fill={color} textAnchor={anchor}>
      {text}
    </text>
  );
  const seared = mode === "sear" || mode === "steam" || mode === "temp" || mode === "rest";
  return (
    <svg width={width} height={(width * 560) / 800} viewBox="0 0 800 560" style={{ display: "block" }}>
      {/* poêle ou planche */}
      {onBoard ? (
        <rect x={150} y={400} width={500} height={34} rx={12} fill="#E3C08F" stroke={C.ink} strokeWidth={9} />
      ) : (
        <>
          <path d="M170 330 V372 Q170 396 200 396 H600 Q630 396 630 372 V330" fill="#DDE3EC" stroke={C.ink} strokeWidth={9} strokeLinejoin="round" />
          <path d="M630 350 H760" stroke={C.ink} strokeWidth={16} strokeLinecap="round" />
          {[250, 330, 410, 490, 570].map((x, i) => (
            <path key={x} d={`M${x} 470 q-12 -24 0 -44 q12 20 0 44 Z`} fill={mode === "steam" ? C.teal : C.coral} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" transform={`translate(0 ${Math.sin(local / 4 + i) * 3}) scale(1 ${mode === "steam" ? 0.6 : 1})`} style={{ transformOrigin: `${x}px 470px` }} />
          ))}
        </>
      )}
      {/* le blanc de poulet en coupe */}
      <path d={`M230 ${baseY} Q226 ${baseY - hump} 330 ${baseY - hump} Q470 ${baseY - hump + (hump - tail) * 0.5} 570 ${baseY - tail} Q582 ${baseY - tail / 2} 570 ${baseY} Z`} fill={MEAT} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
      {seared && <path d={`M236 ${baseY - 5} H566`} stroke={GOLD} strokeWidth={10} strokeLinecap="round" />}
      {(mode === "steam" || mode === "temp" || mode === "rest") && <path d={`M250 ${baseY - hump + 6} Q400 ${baseY - hump + 6} 560 ${baseY - tail + 5}`} fill="none" stroke={GOLD} strokeWidth={9} strokeLinecap="round" />}
      {/* épaisseur inégale : le bout mince sèche, le bout épais reste cru */}
      {mode === "uneven" && (
        <>
          <circle cx={540} cy={baseY - 18} r={44 * pulse} fill="none" stroke={C.coral} strokeWidth={8} strokeDasharray="14 10" />
          <circle cx={310} cy={baseY - 50} r={50 * pulse} fill="none" stroke={C.teal} strokeWidth={8} strokeDasharray="14 10" />
          {label(640, 250, "Dry", 46, C.coral)}
          {label(160, 220, "Still raw", 46, C.teal, "end")}
          {label(400, 110, "Uneven thickness", 48, C.ink, "middle")}
        </>
      )}
      {mode === "even" && (
        <>
          <path d={`M600 ${baseY - 56} V${baseY}`} stroke={C.coral} strokeWidth={8} strokeLinecap="round" />
          {label(640, baseY - 84, "¾ inch", 42, C.coral)}
          {label(400, 110, "Same thickness, same speed", 46, C.ink, "middle")}
        </>
      )}
      {mode === "sear" && (
        <>
          {[280, 400, 520].map((x, i) => {
            const k = ((local / 26 + i / 3) % 1 + 1) % 1;
            return <path key={x} d={`M${x} ${250 - k * 80} q-14 -18 0 -36 q14 -18 0 -36`} fill="none" stroke={C.coral} strokeWidth={8} strokeLinecap="round" opacity={1 - k} />;
          })}
          {label(400, 110, "Leave it alone: 5–6 min", 46, C.ink, "middle")}
          {label(400, 540, "The crust is the flavor", 42, GOLD, "middle")}
        </>
      )}
      {lidOn && (
        <>
          <path d="M160 328 Q400 180 640 328 Z" fill="rgba(174,182,196,0.35)" stroke={C.ink} strokeWidth={9} strokeLinejoin="round" />
          <rect x={376} y={228} width={48} height={24} rx={10} fill={C.ink} />
          {[290, 400, 510].map((x, i) => (
            <path key={x} d={`M${x} 300 q-16 -16 0 -32 q16 -16 0 -32`} fill="none" stroke={C.teal} strokeWidth={8} strokeLinecap="round" strokeDasharray="18 14" strokeDashoffset={-local * 2.2 + i * 10} />
          ))}
          {label(400, 110, "Trapped steam, low heat", 46, C.ink, "middle")}
          {label(400, 540, "Cooks the center gently", 42, C.teal, "middle")}
        </>
      )}
      {mode === "temp" && (
        <>
          <g transform={`translate(${-(1 - probe) * 160} 0)`}>
            <path d={`M60 ${baseY - 34} H330`} stroke="#8D97A8" strokeWidth={7} strokeLinecap="round" />
            <rect x={20} y={baseY - 64} width={70} height={60} rx={12} fill={C.white} stroke={C.ink} strokeWidth={8} />
          </g>
          <circle cx={330} cy={baseY - 34} r={16 * pulse} fill={C.coral} opacity={probe} />
          {label(400, 110, "165°F / 74°C in the thickest part", 44, C.ink, "middle")}
          {label(400, 540, "Not touching the pan", 42, C.coral, "middle")}
        </>
      )}
      {onBoard && (
        <>
          {[300, 400, 500].map((x, i) => (
            <path key={x} d={`M${x} ${baseY - 20} q${Math.sin(local / 8 + i) * 14} -14 0 -28`} fill="none" stroke={C.teal} strokeWidth={8} strokeLinecap="round" />
          ))}
          {label(400, 110, "Rest 5–10 min", 48, C.ink, "middle")}
          {label(400, 500, "The juices spread back", 42, C.teal, "middle")}
        </>
      )}
    </svg>
  );
};

// ---------- Schéma en coupe : la porte du four vue de côté (graisse par les aérations, baguette du haut, vitres qui coulissent, ordre de remontage) ----------
export const OvenDoor: React.FC<{ mode: string; local: number; width?: number }> = ({ mode, local, width = 800 }) => {
  const GREASE = "#B9772E";
  const pulse = 1 + Math.sin(local / 5) * 0.08;
  const trimUp = mode === "trim" || mode === "slide" ? (mode === "trim" ? interpolate(local, [10, 50], [0, 1], { ...clamp, easing: ease }) : 1) : 0;
  const slide = mode === "slide" ? interpolate(local % 130, [15, 90], [0, 1], { ...clamp, easing: ease }) : 0;
  const order = mode === "order";
  const label = (x: number, y: number, text: string, size = 40, color: string = C.ink, anchor: "start" | "middle" | "end" = "start") => (
    <text x={x} y={y} fontFamily={HAND} fontWeight={700} fontSize={fitSize(text, size, x, anchor)} fill={color} textAnchor={anchor}>
      {text}
    </text>
  );
  const panes = [300, 400, 500];
  return (
    <svg width={width} height={(width * 560) / 800} viewBox="0 0 800 560" style={{ display: "block" }}>
      {/* cadre de la porte (coupe verticale) */}
      <rect x={250} y={150} width={300} height={360} rx={14} fill={C.paper} stroke={C.ink} strokeWidth={9} />
      <rect x={236} y={300} width={22} height={70} rx={8} fill={C.ink} />
      {/* les trois vitres */}
      {panes.map((x, i) => (
        <g key={x} transform={i === 1 ? `translate(0 ${-slide * 190})` : undefined}>
          <rect x={x - 9} y={176} width={18} height={308} rx={5} fill="#BFE3EE" stroke={C.ink} strokeWidth={6} />
          {order && <circle cx={x} cy={330} r={30} fill={C.white} stroke={C.ink} strokeWidth={6} />}
          {order && label(x, 345, String(i + 1), 44, C.coral, "middle")}
        </g>
      ))}
      {/* graisse entre les vitres */}
      {(mode === "vents" || mode === "trim") &&
        [0, 1, 2, 3, 4].map((i) => {
          const k = mode === "vents" ? ((local / 60 + i / 5) % 1 + 1) % 1 : 0.5 + i * 0.1;
          return <circle key={i} cx={350 + (i % 2) * 100} cy={170 + k * 280} r={9} fill={GREASE} opacity={0.9} />;
        })}
      {mode === "vents" && (
        <>
          <path d="M350 96 V160 M450 96 V160" stroke={GREASE} strokeWidth={8} strokeLinecap="round" strokeDasharray="14 12" strokeDashoffset={-local * 2} />
          {label(400, 70, "Grease gets in through the top vents", 44, C.ink, "middle")}
          {label(590, 340, "Trapped", 44, GREASE)}
          {label(590, 384, "between panes", 36, GREASE)}
        </>
      )}
      {/* baguette du haut et ses vis */}
      <g transform={`translate(0 ${-trimUp * 70})`}>
        <rect x={240} y={128} width={320} height={34} rx={10} fill="#DDE3EC" stroke={C.ink} strokeWidth={8} />
        {[290, 510].map((x) => (
          <g key={x} transform={`translate(0 ${-trimUp * 34})`}>
            <circle cx={x} cy={145} r={11 * (mode === "trim" ? pulse : 1)} fill={C.sun} stroke={C.ink} strokeWidth={5} />
            <path d={`M${x - 6} 145 H${x + 6} M${x} 139 V151`} stroke={C.ink} strokeWidth={4} />
          </g>
        ))}
      </g>
      {mode === "trim" && (
        <>
          {label(400, 40, "Screws out, trim off", 46, C.ink, "middle")}
          {label(590, 150, "Top trim", 40, C.coral)}
        </>
      )}
      {mode === "slide" && (
        <>
          <path d="M400 150 V60" stroke={C.coral} strokeWidth={8} strokeLinecap="round" strokeDasharray="16 12" strokeDashoffset={local * 2} />
          {label(590, 250, "By the edges,", 40, C.coral)}
          {label(590, 294, "both hands", 40, C.coral)}
          {label(210, 500, "Never force glass", 40, C.teal, "end")}
        </>
      )}
      {order && (
        <>
          {label(400, 70, "Same order, same side", 46, C.ink, "middle")}
          {label(400, 548, "Screws snug, not tight", 42, C.teal, "middle")}
        </>
      )}
    </svg>
  );
};

const DIAGRAMS: Record<string, React.FC<{ mode: string; local: number; width?: number }>> = {
  "toilet-trap": ({ mode, local, width }) => <ToiletTrap mode={mode as TrapMode} local={local} width={width} />,
  "washer": ({ mode, local, width }) => <Washer mode={mode} local={local} width={width} />,
  "rice-pot": ({ mode, local, width }) => <RicePot mode={mode} local={local} width={width} />,
  "steak-pan": ({ mode, local, width }) => <SteakPan mode={mode} local={local} width={width} />,
  "toilet-ring": ({ mode, local, width }) => <ToiletRing mode={mode} local={local} width={width} />,
  "glass-cooktop": ({ mode, local, width }) => <GlassCooktop mode={mode} local={local} width={width} />,
  "chicken-pan": ({ mode, local, width }) => <ChickenPan mode={mode} local={local} width={width} />,
  "oven-door": ({ mode, local, width }) => <OvenDoor mode={mode} local={local} width={width} />,
  "dryer-vent": ({ mode, local, width }) => <DryerVent mode={mode} local={local} width={width} />,
  "whiten-soak": ({ mode, local, width }) => <WhitenSoak mode={mode} local={local} width={width} />,
  "cabinet-grease": ({ mode, local, width }) => <CabinetGrease mode={mode} local={local} width={width} />,
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
