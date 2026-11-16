// Identité « Notice illustrée + mascotte » : Wiki (le W vivant), annotations au feutre sur les photos,
// chiffres clés, encarts « pourquoi ça marche » / « à éviter », coches du matériel, passage du W.
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import "@fontsource/caveat/700.css";
import { C, FONT } from "../theme";
import type { Fact, InfoCardData, Note, Tick } from "../types";

export const HAND = "Caveat, 'Comic Sans MS', cursive";
const IMG_ASPECT = 16 / 9;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---------- Mascotte ----------
export type Pose = "wave" | "point" | "idea" | "no" | "thumbs" | "pencil" | "wet" | "panic" | "nose" | "party" | "watch" | "plumber" | "chef";
export const Mascot: React.FC<{ pose: Pose; height: number; delay?: number; flip?: boolean; style?: React.CSSProperties }> = ({ pose, height, delay = 0, flip = false, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;
  const s = spring({ frame: f, fps, config: { damping: 10, stiffness: 170 } });
  const bob = Math.sin(f / 9) * 0.018;
  const tilt = Math.sin(f / 13) * 2.2 + (1 - Math.min(1, s)) * -14;
  return (
    <div style={{ height, transformOrigin: "50% 100%", transform: `scale(${s * (flip ? -1 : 1)}, ${s * (1 + bob)}) rotate(${tilt}deg)`, opacity: f < 0 ? 0 : 1, filter: "drop-shadow(0 14px 18px rgba(27,42,65,0.28))", ...style }}>
      <Img src={staticFile(`brand/mascot-${pose}.png`)} style={{ height: "100%", display: "block" }} />
    </div>
  );
};

// ---------- Le W de la marque, tracé au feutre ----------
const W_PATH = "M12 18 L31 84 L50 38 L69 84 L88 18";
export const WMark: React.FC<{ size: number; progress?: number; color?: string; stroke?: number }> = ({ size, progress = 1, color = C.ink, stroke = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block", overflow: "visible" }}>
    <path d={W_PATH} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress} />
  </svg>
);

/** Pastille W qui traverse l'écran entre deux scènes (p : 0 → 1 pendant la sortie, puis 1 → 2 pendant l'entrée). */
export const WBadge: React.FC<{ p: number }> = ({ p }) => {
  if (p <= 0 || p >= 2) return null;
  const scale = p <= 1 ? interpolate(p, [0, 0.7, 1], [0, 1.12, 1], clamp) : interpolate(p, [1, 2], [1, 1.5], clamp);
  const opacity = p <= 1 ? 1 : interpolate(p, [1, 1.7], [1, 0], clamp);
  const rot = p <= 1 ? interpolate(p, [0, 1], [-25, 0], clamp) : 0;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ width: 330, height: 330, borderRadius: 90, background: C.paper, border: `10px solid ${C.ink}`, boxShadow: `14px 14px 0 ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${scale}) rotate(${rot}deg)`, opacity }}>
        <WMark size={230} color={C.coral} stroke={19} />
      </div>
    </AbsoluteFill>
  );
};

// ---------- Annotations sur l'image ----------
/** Passe des coordonnées image (0-1) aux coordonnées du cadre affiché (0-1), l'image étant en `cover` centrée sur `focus`. */
export function imageToBox(u: number, v: number, box: [number, number], focus: [number, number]): [number, number] {
  const ac = box[0] / box[1];
  if (ac >= IMG_ASPECT) {
    const h = ac / IMG_ASPECT;
    return [u, -(h - 1) * focus[1] + v * h];
  }
  const w = IMG_ASPECT / ac;
  return [-(w - 1) * focus[0] + u * w, v];
}

const INK_W = 13;
const Stroke: React.FC<{ d: string; p: number; color?: string; width?: number }> = ({ d, p, color = C.sun, width = 8 }) =>
  p <= 0 ? null : (
    <>
      <path d={d} fill="none" stroke={C.ink} strokeWidth={width + INK_W - 8} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
    </>
  );

/** Caméra du plan : zoom s autour du point (ox, oy), décalage (tx, ty), en fractions du cadre. */
export type Cam = { s: number; ox: number; oy: number; tx: number; ty: number };
const IDENT: Cam = { s: 1, ox: 0.5, oy: 0.5, tx: 0, ty: 0 };

const NoteView: React.FC<{ note: Note; box: [number, number]; focus: [number, number]; local: number; index: number; cam: Cam; file?: string }> = ({ note, box, focus, local, index, cam, file }) => {
  const { fps } = useVideoConfig();
  if (local < 0) return null;
  const [w, h] = box;
  const k = w / 1920; // échelle des traits selon la taille du cadre
  const fs = Math.max(34, 60 * Math.sqrt(k));
  const [bx0, by0] = imageToBox(note.at[0], note.at[1], box, focus);
  // La cible suit la caméra ; les étiquettes restent à leur place dans le cadre.
  const bx = cam.ox + cam.s * (bx0 + cam.tx - cam.ox);
  const by = cam.oy + cam.s * (by0 + cam.ty - cam.oy);
  const P = { x: bx * w, y: by * h };
  const L = note.label ? { x: note.label[0] * w, y: note.label[1] * h } : null;
  const draw = interpolate(local, [0, 9], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const draw2 = interpolate(local, [6, 14], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const pop = spring({ frame: local - (note.type === "arrow" ? 0 : 5), fps, config: { damping: 11, stiffness: 200 } });
  const r = (note.r ?? 0.08) * w * (note.type === "loupe" || note.type === "inset" ? 1 : cam.s);
  const isCross = note.type === "cross";
  const color = isCross ? C.coral : C.sun;
  const paths: React.ReactNode[] = [];

  // Trait de liaison étiquette → cible (flèche courbe dessinée à la main)
  const link = (target: { x: number; y: number }, gap: number, head: boolean) => {
    if (!L || !note.text) return;
    const hw = (note.text.length * fs * 0.2 + 26) * 1; // demi-largeur estimée de l'étiquette
    const hh = fs * 0.62;
    const dx = target.x - L.x;
    const dy = target.y - L.y;
    const len = Math.hypot(dx, dy) || 1;
    // point de départ : bord de l'étiquette dans la direction de la cible
    const tEdge = Math.min(hw / Math.abs(dx || 1e-6), hh / Math.abs(dy || 1e-6));
    const S = { x: L.x + dx * tEdge + (dx / len) * 12, y: L.y + dy * tEdge + (dy / len) * 12 };
    const E = { x: target.x - (dx / len) * gap, y: target.y - (dy / len) * gap };
    const mx = (S.x + E.x) / 2 + (-(E.y - S.y)) * 0.16;
    const my = (S.y + E.y) / 2 + (E.x - S.x) * 0.16;
    if (Math.hypot(E.x - S.x, E.y - S.y) < 30) return;
    paths.push(<Stroke key="l" d={`M${S.x} ${S.y} Q${mx} ${my} ${E.x} ${E.y}`} p={draw} width={8 * Math.max(0.7, k)} />);
    if (head) {
      const a = Math.atan2(E.y - my, E.x - mx);
      const hl = 34 * Math.max(0.7, k);
      const pt = (da: number) => `${E.x - Math.cos(a + da) * hl} ${E.y - Math.sin(a + da) * hl}`;
      paths.push(<Stroke key="h" d={`M${pt(0.5)} L${E.x} ${E.y} L${pt(-0.5)}`} p={draw2} width={8 * Math.max(0.7, k)} />);
    }
  };

  if (note.type === "loupe" || note.type === "inset") {
    // Loupe : la zone visée est agrandie dans une lentille, reliée à sa cible ; le reste de l'image s'assombrit.
    const Lc = { x: (note.lens?.[0] ?? 0.28) * w, y: (note.lens?.[1] ?? 0.42) * h };
    const z = note.zoom ?? 2.3;
    const ac = w / h;
    const dispW = ac >= IMG_ASPECT ? w : h * IMG_ASPECT;
    const dispH = ac >= IMG_ASPECT ? w / IMG_ASPECT : h;
    const dx = P.x - Lc.x;
    const dy = P.y - Lc.y;
    const len = Math.hypot(dx, dy) || 1;
    const ring = 0.035 * w;
    const E1 = { x: Lc.x + (dx / len) * (r + 8), y: Lc.y + (dy / len) * (r + 8) };
    const E2 = { x: P.x - (dx / len) * ring, y: P.y - (dy / len) * ring };
    const dim = note.type === "inset" ? 0 : interpolate(local, [0, 10], [0, 0.42], clamp);
    return (
      <>
        <AbsoluteFill style={{ background: C.ink, opacity: dim }} />
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <Stroke d={`M${P.x + ring} ${P.y} A${ring} ${ring} 0 1 1 ${P.x + ring - 0.1} ${P.y - 0.1}`} p={draw} width={8} />
          {len > r + ring + 20 && <Stroke d={`M${E2.x} ${E2.y} L${E1.x} ${E1.y}`} p={draw2} width={8} />}
        </svg>
        <div style={{ position: "absolute", left: Lc.x - r, top: Lc.y - r, width: 2 * r, height: 2 * r, borderRadius: "50%", overflow: "hidden", transform: `scale(${pop})`, border: `12px solid ${C.paper}`, boxSizing: "border-box", boxShadow: `0 0 0 6px ${C.ink}, 14px 16px 0 6px rgba(27,42,65,0.55)`, background: C.ink }}>
          {file && <Img src={staticFile(file)} style={{ position: "absolute", width: dispW * z, height: dispH * z, maxWidth: "none", left: -(note.at[0] * dispW * z - r) - 12, top: -(note.at[1] * dispH * z - r) - 12 }} />}
        </div>
        {note.text && (
          <div style={{ position: "absolute", left: Lc.x, top: Lc.y + r + 6, transform: `translate(-50%, 0) scale(${pop}) rotate(-2deg)`, background: C.paper, color: C.ink, fontFamily: HAND, fontWeight: 700, fontSize: fs, lineHeight: 1, padding: `${fs * 0.14}px ${fs * 0.34}px ${fs * 0.2}px`, borderRadius: 14, border: `4px solid ${C.ink}`, boxShadow: "6px 7px 0 rgba(27,42,65,0.55)", whiteSpace: "nowrap" }}>
            {note.text}
          </div>
        )}
      </>
    );
  }
  if (note.type === "arrow") link(P, 16, true);
  if (note.type === "circle") {
    const rx = r;
    const ry = r * 0.82;
    // ellipse « à main levée » : un tour et demi-recouvrement
    const d = `M${P.x - rx} ${P.y + 4} C${P.x - rx} ${P.y - ry * 1.25} ${P.x + rx * 1.05} ${P.y - ry * 1.3} ${P.x + rx} ${P.y} C${P.x + rx * 0.95} ${P.y + ry * 1.3} ${P.x - rx * 1.1} ${P.y + ry * 1.25} ${P.x - rx * 0.92} ${P.y - ry * 0.35}`;
    paths.push(<Stroke key="c" d={d} p={draw} width={9 * Math.max(0.7, k)} />);
    link(P, r + 10, false);
  }
  if (note.type === "swirl") {
    // flèche circulaire qui tourne : le geste à faire
    const rot = (local * 5) % 360;
    const a0 = (rot * Math.PI) / 180;
    const pt = (a: number, rr = r) => `${P.x + Math.cos(a) * rr} ${P.y + Math.sin(a) * rr * 0.8}`;
    const d = `M${pt(a0)} A${r} ${r * 0.8} 0 1 1 ${pt(a0 - 1.3)}`;
    paths.push(<Stroke key="s" d={d} p={draw} width={10 * Math.max(0.7, k)} />);
    const ae = a0 - 1.3;
    const tip = { x: P.x + Math.cos(ae) * r, y: P.y + Math.sin(ae) * r * 0.8 };
    const ta = ae + Math.PI / 2;
    const hl = 30 * Math.max(0.7, k);
    paths.push(<Stroke key="sh" d={`M${tip.x - Math.cos(ta + 0.6) * hl} ${tip.y - Math.sin(ta + 0.6) * hl} L${tip.x} ${tip.y} L${tip.x - Math.cos(ta - 0.6) * hl} ${tip.y - Math.sin(ta - 0.6) * hl}`} p={draw2} width={10 * Math.max(0.7, k)} />);
  }
  if (isCross) {
    paths.push(<Stroke key="x1" d={`M${P.x - r} ${P.y - r * 0.8} L${P.x + r} ${P.y + r * 0.8}`} p={draw} color={C.coral} width={20 * Math.max(0.7, k)} />);
    paths.push(<Stroke key="x2" d={`M${P.x + r} ${P.y - r * 0.8} L${P.x - r} ${P.y + r * 0.8}`} p={draw2} color={C.coral} width={20 * Math.max(0.7, k)} />);
  }
  return (
    <>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {paths}
      </svg>
      {L && note.text && (
        <div
          style={{
            position: "absolute",
            left: L.x,
            top: L.y,
            transform: `translate(-50%, -50%) scale(${pop}) rotate(${index % 2 ? 2 : -3}deg)`,
            background: isCross ? C.coral : C.paper,
            color: isCross ? C.white : C.ink,
            fontFamily: HAND,
            fontWeight: 700,
            fontSize: fs,
            lineHeight: 1,
            padding: `${fs * 0.14}px ${fs * 0.34}px ${fs * 0.2}px`,
            borderRadius: 14,
            border: `${Math.max(3, 4 * k)}px solid ${C.ink}`,
            boxShadow: `${6 * Math.max(0.7, k)}px ${7 * Math.max(0.7, k)}px 0 rgba(27,42,65,0.55)`,
            whiteSpace: "nowrap",
          }}
        >
          {note.text}
        </div>
      )}
    </>
  );
};

/** Calque d'annotations d'un plan (à placer dans le même conteneur transformé que l'image). */
export const NotesLayer: React.FC<{ notes?: Note[] | null; box: [number, number]; focus: [number, number]; fromFrame: number; cam?: Cam; file?: string }> = ({ notes, box, focus, fromFrame, cam = IDENT, file }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!notes?.length) return null;
  return (
    <AbsoluteFill>
      {notes.map((n, i) => (
        <NoteView key={i} note={n} box={box} focus={focus} index={i} cam={cam} file={file} local={frame - (Math.round((n.t ?? 0) * fps) - fromFrame)} />
      ))}
    </AbsoluteFill>
  );
};

// ---------- Élément calé sur la voix : visible de t à t + dur (s, relatifs à la scène) ----------
function useWindow<T extends { t?: number; dur?: number }>(items: T[] | undefined, defDur: number): { item: T; local: number; left: number } | null {
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

// ---------- Chiffre clé (quantité, durée) ----------
export const FactChip: React.FC<{ facts?: Fact[]; scale?: number }> = ({ facts, scale = 1 }) => {
  const { fps } = useVideoConfig();
  const win = useWindow(facts, 4);
  if (!win) return null;
  const { item, local, left } = win;
  const s = spring({ frame: local, fps, config: { damping: 10, stiffness: 190 } });
  const out = interpolate(left, [0, 7], [0, 1], clamp);
  const total = Math.round((item.dur ?? 4) * fps);
  const sweep = interpolate(local, [8, total - 6], [0, 1], clamp);
  const R = 44;
  const circ = 2 * Math.PI * R;
  return (
    <div style={{ transform: `scale(${s * out * scale}) rotate(${2 - (1 - Math.min(1, s)) * 10}deg)`, transformOrigin: "100% 0%", opacity: out, display: "inline-flex", alignItems: "center", gap: 24, background: C.paper, border: `6px solid ${C.ink}`, borderRadius: 30, padding: "20px 34px 20px 24px", boxShadow: `10px 10px 0 ${C.coral}`, fontFamily: FONT }}>
      <svg width={112} height={112} viewBox="0 0 112 112">
        {item.kind === "timer" ? (
          <>
            <circle cx={56} cy={56} r={R} fill={C.white} stroke={C.ink} strokeWidth={7} />
            <circle cx={56} cy={56} r={R - 12} fill="none" stroke={C.coral} strokeWidth={22} strokeDasharray={`${(circ * (R - 12)) / R}`} strokeDashoffset={((circ * (R - 12)) / R) * (1 - sweep)} transform="rotate(-90 56 56)" />
            <line x1={56} y1={56} x2={56 + Math.sin(sweep * 2 * Math.PI) * 30} y2={56 - Math.cos(sweep * 2 * Math.PI) * 30} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
            <rect x={48} y={0} width={16} height={12} rx={4} fill={C.ink} />
          </>
        ) : (
          <>
            <rect x={8} y={36} width={96} height={40} rx={8} fill={C.sun} stroke={C.ink} strokeWidth={7} transform="rotate(-12 56 56)" />
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1={24 + i * 16} y1={36} x2={24 + i * 16} y2={i % 2 ? 50 : 58} stroke={C.ink} strokeWidth={5} strokeLinecap="round" transform="rotate(-12 56 56)" />
            ))}
          </>
        )}
      </svg>
      <div>
        <div style={{ fontSize: 76, fontWeight: 900, color: C.ink, lineHeight: 1, letterSpacing: -1, whiteSpace: "nowrap" }}>{item.big}</div>
        {item.small && <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 50, color: C.coral, lineHeight: 1, marginTop: 4, whiteSpace: "nowrap" }}>{item.small}</div>}
      </div>
    </div>
  );
};

// ---------- Encart « pourquoi ça marche » / « à éviter », présenté par Wiki ----------
export const InfoCard: React.FC<{ cards?: InfoCardData[]; width?: number }> = ({ cards, width = 720 }) => {
  const { fps } = useVideoConfig();
  const win = useWindow(cards, 4.8);
  if (!win) return null;
  const { item, local, left } = win;
  const avoid = item.kind === "avoid";
  const s = spring({ frame: local, fps, config: { damping: 13, stiffness: 150 } });
  const out = interpolate(left, [0, 8], [0, 1], clamp);
  const stamp = spring({ frame: local - 8, fps, config: { damping: 9, stiffness: 260 } });
  const accent = avoid ? C.coral : C.teal;
  return (
    <div style={{ position: "relative", width, transform: `translateX(${(1 - s) * 120}px) rotate(${-1.5 + (1 - s) * 4}deg)`, opacity: Math.min(1, s * 1.4) * out, fontFamily: FONT }}>
      <div style={{ background: avoid ? C.blush : C.white, border: `6px solid ${C.ink}`, borderRadius: 30, padding: "22px 30px 26px 236px", boxShadow: `10px 10px 0 ${accent}`, minHeight: 150 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {avoid ? (
            <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: 5, color: C.coral, border: `5px solid ${C.coral}`, borderRadius: 10, padding: "0 16px", transform: `rotate(-6deg) scale(${interpolate(stamp, [0, 1], [2.4, 1])})`, opacity: Math.min(1, stamp * 2), textTransform: "uppercase" }}>
              ✕ {item.title}
            </div>
          ) : (
            <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: 4, color: C.teal, textTransform: "uppercase" }}>{item.title}</div>
          )}
        </div>
        <div style={{ fontSize: 38, fontWeight: 800, color: C.ink, lineHeight: 1.18, marginTop: 10 }}>{item.text}</div>
      </div>
      <div style={{ position: "absolute", left: -46, bottom: -16 }}>
        <Mascot pose={avoid ? "no" : "idea"} height={avoid ? 236 : 220} delay={3} />
      </div>
    </div>
  );
};

/** Vrai quand un encart est à l'écran (pour laisser la place à l'astuce de Wiki le reste du temps). */
export function useCardActive(cards?: InfoCardData[]): boolean {
  return useWindow(cards, 4.8) !== null;
}

/** Wiki donne l'astuce de l'étape dans une bulle (occupe l'espace libre quand aucun encart n'est affiché). */
export const TipBubble: React.FC<{ text: string; delay?: number; width?: number }> = ({ text, delay = 20, width = 420 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay - 8, fps, config: { damping: 12, stiffness: 170 } });
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
      <Mascot pose="point" height={230} delay={delay} />
      <div style={{ width, marginBottom: 70, transform: `scale(${s}) rotate(-2deg)`, transformOrigin: "0% 100%", background: C.white, border: `5px solid ${C.ink}`, borderRadius: "26px 26px 26px 6px", padding: "14px 24px 18px", boxShadow: `8px 8px 0 ${C.sun}` }}>
        <div style={{ fontFamily: FONT, fontSize: 24, fontWeight: 900, letterSpacing: 4, color: C.coral }}>TIP</div>
        <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 46, lineHeight: 1.02, color: C.ink }}>{text}</div>
      </div>
    </div>
  );
};

// ---------- Coche du matériel ----------
export const TickNote: React.FC<{ ticks?: Tick[] }> = ({ ticks }) => {
  const { fps } = useVideoConfig();
  const win = useWindow(ticks, 2.8);
  if (!win) return null;
  const { item, local, left } = win;
  const s = spring({ frame: local, fps, config: { damping: 11, stiffness: 200 } });
  const out = interpolate(left, [0, 7], [0, 1], clamp);
  const check = interpolate(local, [5, 13], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 16, background: C.sun, border: `5px solid ${C.ink}`, borderRadius: 16, padding: "10px 26px 12px 16px", transform: `scale(${s * out}) rotate(-3deg)`, transformOrigin: "0% 50%", opacity: out, boxShadow: "7px 7px 0 rgba(27,42,65,0.5)" }}>
      <svg width={52} height={52} viewBox="0 0 52 52">
        <rect x={5} y={5} width={42} height={42} rx={10} fill={C.white} stroke={C.ink} strokeWidth={5} />
        <path d="M13 27 L23 37 L41 14" fill="none" stroke={C.teal} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - check} />
      </svg>
      <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 52, color: C.ink, lineHeight: 1, whiteSpace: "nowrap" }}>{item.label}</div>
    </div>
  );
};

/** Bruitages des éléments calés sur la voix. */
export const CueSfx: React.FC<{ cues: { t: number; sfx: "pencil" | "stamp" | "tick" | "pop" | "boing"; volume?: number }[] }> = ({ cues }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {cues.map((c, i) => (
        <Sequence key={i} from={Math.max(0, Math.round(c.t * fps))} durationInFrames={fps} layout="none">
          <Audio src={staticFile(c.sfx === "pop" ? "sfx/pop.mp3" : `brand/sfx-${c.sfx}.mp3`)} volume={c.volume ?? 0.3} />
        </Sequence>
      ))}
    </>
  );
};

/** Morceaux de ruban adhésif en haut d'une photo (esprit notice / carnet), à l'écart du logo et du compteur d'étapes. */
export const Tape: React.FC<{ side: "l" | "r"; width?: number; inset?: number }> = ({ side, width = 190, inset }) => (
  <div
    style={{
      position: "absolute",
      top: -24,
      ...(side === "l" ? { left: inset ?? 430, transform: "rotate(-5deg)" } : { right: inset ?? 470, transform: "rotate(4deg)" }),
      width,
      height: 48,
      background: "rgba(255,201,77,0.85)",
      borderLeft: `3px dashed rgba(27,42,65,0.25)`,
      borderRight: `3px dashed rgba(27,42,65,0.25)`,
      boxShadow: "0 3px 8px rgba(27,42,65,0.18)",
    }}
  />
);
