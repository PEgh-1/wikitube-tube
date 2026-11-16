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

const DIAGRAMS: Record<string, React.FC<{ mode: string; local: number; width?: number }>> = {
  "toilet-trap": ({ mode, local, width }) => <ToiletTrap mode={mode as TrapMode} local={local} width={width} />,
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
