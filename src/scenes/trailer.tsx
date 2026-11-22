// Accroche « bande-annonce » (v4) : quatre actes calés sur la voix, aucun logo, aucun mot qui « pop ».
//   1. Le problème  : image d'erreur en teinte froide, zoom par à-coups, bandes cinéma, croix tamponnée, titre mot à mot.
//   2. Le résultat  : panoramique filé vers la photo réussie, teinte chaude, coche, éclats.
//   3. La promesse  : une carte par étape qui tombe sur la table, compteur « N STEPS », balayage carte par carte.
//   4. Le suspense  : la carte de l'étape annoncée passe au centre, floutée, sur un soleil tournant.
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../theme";
import type { HookScene } from "../types";
import { HAND, Mascot } from "../components/brand";

const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const W = 1920;
const H = 1080;
const cover: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" };

const Sfx: React.FC<{ at: number; src: string; volume: number }> = ({ at, src, volume }) => (
  <Sequence from={Math.max(0, at)} layout="none">
    <Audio src={staticFile(src)} volume={volume} />
  </Sequence>
);

/** Pastille ronde tamponnée (croix ou coche tracée). */
const Stamp: React.FC<{ from: number; kind: "no" | "yes" }> = ({ from, kind }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - from, fps, config: { damping: 9, stiffness: 220 } });
  const draw = interpolate(frame, [from + 2, from + 10], [0, 1], CL);
  if (frame < from) return null;
  const color = kind === "no" ? C.coral : C.teal;
  return (
    <div style={{ position: "absolute", top: 150, right: 120, width: 250, height: 250, borderRadius: 125, background: color, border: `10px solid ${C.paper}`, boxShadow: "0 18px 50px rgba(0,0,0,0.45)", transform: `scale(${2.2 - s * 1.2}) rotate(${kind === "no" ? -8 : 6}deg)`, opacity: Math.min(1, s * 2), display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={150} height={150} viewBox="0 0 100 100">
        {kind === "no" ? (
          <>
            <path d="M22 22 L78 78" stroke={C.white} strokeWidth={15} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, draw * 2)} />
            <path d="M78 22 L22 78" stroke={C.white} strokeWidth={15} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.max(0, draw * 2 - 1)} />
          </>
        ) : (
          <path d="M18 54 L42 76 L84 26" fill="none" stroke={C.white} strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        )}
      </svg>
    </div>
  );
};

/** Éclats qui scintillent sur la photo réussie. */
const Sparkles: React.FC<{ from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {Array.from({ length: 9 }).map((_, i) => {
        const x = 140 + random(`sx${i}`) * (W - 280);
        const y = 120 + random(`sy${i}`) * (H - 420);
        const size = 46 + random(`ss${i}`) * 70;
        const local = frame - from - i * 3;
        const tw = local < 0 ? 0 : Math.max(0, Math.sin(local / (5 + random(`sp${i}`) * 4)));
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", left: x, top: y, opacity: tw * 0.95, transform: `scale(${0.4 + tw * 0.8}) rotate(${local * 2}deg)` }}>
            <path d="M50 0 C54 34 66 46 100 50 C66 54 54 66 50 100 C46 66 34 54 0 50 C34 46 46 34 50 0 Z" fill={i % 3 === 0 ? C.sun : C.white} />
          </svg>
        );
      })}
    </>
  );
};

/** Titre qui arrive mot à mot, chaque mot sortant d'un masque. */
const SlamTitle: React.FC<{ text: string; from: number; size: number }> = ({ text, from, size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ fontSize: size, fontWeight: 900, lineHeight: 1.04, color: C.white, textShadow: "0 6px 30px rgba(0,0,0,0.6)", display: "flex", flexWrap: "wrap", columnGap: size * 0.26 }}>
      {text.split(/\s+/).map((w, i) => {
        const s = spring({ frame: frame - from - i * 2, fps, config: { damping: 13, stiffness: 210 } });
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingBottom: size * 0.12 }}>
            <span style={{ display: "inline-block", transform: `translateY(${(1 - s) * 115}%) rotate(${(1 - s) * 6}deg)` }}>{w}</span>
          </span>
        );
      })}
    </div>
  );
};

type Slot = { x: number; y: number; w: number; h: number };
/** Mosaïque plein cadre : la première case est le compteur « N STEPS », puis une carte par étape. */
const layout = (n: number): Slot[] => {
  const tiles = n + 1;
  const cols = tiles <= 4 ? tiles : tiles <= 6 ? 3 : tiles <= 8 ? 4 : 5;
  const rows = Math.ceil(tiles / cols);
  const gap = 30;
  const mx = 70;
  const my = 64;
  const w = (W - 2 * mx - (cols - 1) * gap) / cols;
  const h = Math.min((H - 2 * my - (rows - 1) * gap) / rows, w * 0.96);
  const y0 = (H - (rows * h + (rows - 1) * gap)) / 2;
  return Array.from({ length: tiles }).map((_, i) => {
    const r = Math.floor(i / cols);
    const inRow = r === rows - 1 ? tiles - cols * (rows - 1) : cols;
    const rowW = inRow * w + (inRow - 1) * gap;
    return { x: (W - rowW) / 2 + (i - r * cols) * (w + gap), y: y0 + r * (h + gap), w, h };
  });
};

export const HookTrailer: React.FC<{ scene: HookScene; durationInFrames: number }> = ({ scene, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tr = scene.trailer!;
  const F = (s: number) => Math.round(s * fps);
  const fTurn = F(tr.turn);
  const fProm = F(tr.promise);
  const fTease = F(tr.tease);
  const n = tr.cards.length;

  // ---------- Acte 1 : le problème ----------
  const jump = frame < 6 ? 1.02 : frame < 12 ? 1.2 : 1.4; // zoom par à-coups
  const push1 = jump + interpolate(frame, [12, fTurn], [0, 0.12], CL);
  const hit = (f0: number, amp: number) => (frame >= f0 && frame < f0 + 5 ? (1 - (frame - f0) / 5) * amp : 0);
  const shake = hit(6, 16) + hit(12, 22);
  const sx = Math.sin(frame * 7.3) * shake;
  const sy = Math.cos(frame * 5.1) * shake;
  const whip = interpolate(frame, [fTurn - 4, fTurn + 5], [0, 1], { ...CL, easing: Easing.inOut(Easing.cubic) }); // panoramique filé
  const whipBlur = Math.sin(whip * Math.PI) * 34;
  const bars = interpolate(frame, [0, 7, fTurn - 3, fTurn + 5], [0, 112, 112, 0], CL);

  // ---------- Acte 2 : le résultat ----------
  const settle = interpolate(frame, [fTurn - 4, fTurn + 16], [1.34, 1.08], { ...CL, easing: Easing.out(Easing.cubic) });
  const push2 = settle + interpolate(frame, [fTurn + 16, fProm], [0, 0.07], CL);
  const through = interpolate(frame, [fProm - 3, fProm + 8], [0, 1], { ...CL, easing: Easing.in(Easing.cubic) }); // traversée vers les cartes
  const flash = interpolate(frame, [fTurn - 1, fTurn + 2, fTurn + 10], [0, 0.75, 0], CL);

  // ---------- Acte 3 : les cartes ----------
  const slots = layout(n);
  const land = (k: number) => fProm + 5 + k * 4;
  const landed = Math.max(0, Math.min(n, Math.floor((frame - fProm - 5) / 4) + 1));
  const scanFrom = land(n - 1) + 12;
  const per = Math.max(6, Math.min(12, Math.floor((fTease - scanFrom) / n)));
  const active = frame >= scanFrom && frame < fTease ? Math.floor((frame - scanFrom) / per) % n : -1;
  const drift = interpolate(frame, [fProm, fTease], [-5, 5], CL);
  const tilt = interpolate(frame, [fProm, fTease], [4, -2], CL);
  const boardIn = interpolate(frame, [fProm - 2, fProm + 8], [0, 1], CL);

  // ---------- Acte 4 : le suspense ----------
  const tp = spring({ frame: frame - fTease, fps, config: { damping: 14, stiffness: 120 } });
  const others = interpolate(frame, [fTease, fTease + 9], [1, 0], CL);
  const boom = hit(fTease + 2, 20);
  const big: Slot = { w: 1040, h: 585, x: (W - 1040) / 2 + 150, y: 120 };
  const pulse = 1 + Math.sin((frame - fTease) / 6) * 0.05;
  const stick = spring({ frame: frame - fTease - 8, fps, config: { damping: 10, stiffness: 190 } });
  const inTease = frame >= fTease;

  const resultMedia =
    tr.result.kind === "video" ? <OffthreadVideo src={staticFile(tr.result.file)} muted style={cover} /> : <Img src={staticFile(tr.result.file)} style={cover} />;

  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden", fontFamily: "Nunito, system-ui, sans-serif" }}>
      {/* Acte 2 (dessous) : la photo réussie */}
      {frame >= fTurn - 5 && frame < fProm + 10 && (
        <AbsoluteFill style={{ transform: `translateX(${(1 - whip) * 100}%) scale(${push2 * (1 + through * 1.3)})`, filter: `blur(${whipBlur + through * 26}px) saturate(1.2) contrast(1.05) brightness(1.04)`, opacity: 1 - through }}>
          {resultMedia}
          <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(255,201,77,0.16) 0%, rgba(27,42,65,0) 55%, rgba(27,42,65,0.4) 100%)" }} />
        </AbsoluteFill>
      )}
      {frame >= fTurn + 4 && frame < fProm + 2 && (
        <AbsoluteFill style={{ opacity: 1 - through }}>
          <Sparkles from={fTurn + 4} />
          <Stamp from={fTurn + 7} kind="yes" />
          <div style={{ position: "absolute", right: 110, bottom: 40 }}>
            <Mascot pose="thumbs" height={400} delay={fTurn + 9} />
          </div>
        </AbsoluteFill>
      )}

      {/* Acte 1 : le problème (part en panoramique filé) */}
      {frame < fTurn + 6 && (
        <AbsoluteFill style={{ transform: `translateX(${-whip * 100}%)`, filter: `blur(${whipBlur}px)` }}>
          <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(${push1})`, transformOrigin: "50% 46%", filter: "saturate(0.5) contrast(1.16) brightness(0.8)" }}>
            <Img src={staticFile(tr.problem.file)} style={cover} />
          </AbsoluteFill>
          <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(27,42,65,0) 38%, rgba(110,16,6,0.5) 100%)" }} />
          <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(27,42,65,0) 45%, rgba(20,28,44,0.88) 100%)" }} />
          <Stamp from={13} kind="no" />
          <div style={{ position: "absolute", left: 100, right: 560, bottom: 150 }}>
            <div style={{ display: "inline-block", background: C.coral, color: C.white, fontSize: 34, fontWeight: 900, letterSpacing: 5, padding: "8px 24px", borderRadius: 12, border: `4px solid ${C.paper}`, transform: `rotate(-2deg) scale(${spring({ frame: frame - 4, fps, config: { damping: 11 } })})`, marginBottom: 20 }}>
              {scene.category.toUpperCase()}
            </div>
            <SlamTitle text={scene.title} from={7} size={Math.min(100, Math.round(1500 / Math.sqrt(scene.title.length)) / 2 + 40)} />
          </div>
          <div style={{ position: "absolute", right: 130, bottom: 120 }}>
            <Mascot pose="panic" height={440} delay={16} />
          </div>
        </AbsoluteFill>
      )}

      {/* Acte 3 : le plateau de cartes, puis acte 4 : la carte mystère */}
      {frame >= fProm - 2 && (
        <AbsoluteFill style={{ opacity: boardIn }}>
          <AbsoluteFill style={{ transform: `scale(${1.2 + interpolate(frame, [fProm, durationInFrames], [0, 0.1], CL)})`, filter: "blur(30px) saturate(1.1)" }}>
            <Img src={staticFile(tr.result.kind === "video" ? tr.cards[0].file : tr.result.file)} style={cover} />
          </AbsoluteFill>
          <AbsoluteFill style={{ background: "rgba(27,42,65,0.72)" }} />
          {inTease && (
            <div style={{ position: "absolute", left: big.x + big.w / 2 - 1100, top: big.y + big.h / 2 - 1100, width: 2200, height: 2200, borderRadius: 1100, opacity: 0.34 * Math.min(1, tp), transform: `rotate(${(frame - fTease) * 0.7}deg)`, background: `repeating-conic-gradient(${C.sun} 0deg 9deg, rgba(255,201,77,0) 9deg 18deg)`, maskImage: "radial-gradient(circle, black 0%, black 30%, transparent 68%)", WebkitMaskImage: "radial-gradient(circle, black 0%, black 30%, transparent 68%)" }} />
          )}
          <AbsoluteFill style={{ perspective: 1700 }}>
            <AbsoluteFill style={{ transform: inTease ? `translate(${Math.sin(frame * 6.1) * boom}px, ${Math.cos(frame * 4.7) * boom}px)` : `rotateY(${drift}deg) rotateX(${tilt}deg)`, transformStyle: "preserve-3d" }}>
              {(() => {
                const t0 = slots[0];
                const s0 = spring({ frame: frame - fProm - 1, fps, config: { damping: 12, stiffness: 150 } });
                const bump = 1 + hit(land(Math.max(0, landed - 1)), 0.05);
                return (
                  <div style={{ position: "absolute", left: t0.x, top: t0.y + (1 - s0) * -500 + (1 - others) * -90, width: t0.w, height: t0.h, opacity: others, transform: `rotate(${-3 + (1 - s0) * -14}deg) scale(${0.6 + s0 * 0.4})`, background: C.coral, border: `9px solid ${C.paper}`, borderRadius: 30, boxShadow: "12px 14px 0 rgba(13,22,36,0.7)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: C.white }}>
                    <div style={{ fontSize: t0.h * 0.62, fontWeight: 900, lineHeight: 0.9, transform: `scale(${bump})`, textShadow: `8px 9px 0 ${C.ink}` }}>{Math.max(1, landed)}</div>
                    <div style={{ fontSize: t0.h * 0.2, fontWeight: 900, letterSpacing: 8, lineHeight: 1, marginTop: 6 }}>STEPS</div>
                  </div>
                );
              })()}
              {tr.cards.map((c, k) => {
                const slot = slots[k + 1];
                const isStar = c.n === tr.teaseStep;
                const s = spring({ frame: frame - land(k), fps, config: { damping: 12, stiffness: 150 } });
                if (frame < land(k)) return null;
                const t = inTease && isStar ? tp : 0;
                const x = slot.x + (big.x - slot.x) * t;
                const y = slot.y + (big.y - slot.y) * t + (1 - s) * 700;
                const w = slot.w + (big.w - slot.w) * t;
                const h = slot.h + (big.h - slot.h) * t;
                const on = k === active;
                const fade = inTease && !isStar ? others : 1;
                const rot = (1 - s) * (k % 2 ? 16 : -16) + (inTease ? 0 : (random(`r${k}`) - 0.5) * 3.4);
                const zoom = 1.04 + interpolate(frame, [land(k), durationInFrames], [0, 0.14], CL);
                const badge = 88 + t * 60;
                return (
                  <div key={k} style={{ position: "absolute", left: x, top: y + (inTease && !isStar ? (1 - others) * 90 : 0), width: w, height: h, opacity: fade, zIndex: isStar && inTease ? 5 : on ? 3 : 1, transform: `rotate(${rot}deg) scale(${(0.55 + s * 0.45) * (on ? 1.09 : 1) * (t ? 1 + (pulse - 1) * 0.4 : 1)})` }}>
                    <div style={{ position: "absolute", inset: 0, borderRadius: 30, overflow: "hidden", border: `9px solid ${on || (isStar && inTease) ? C.sun : C.paper}`, boxShadow: on || (isStar && inTease) ? `0 0 0 6px ${C.ink}, 0 0 70px rgba(255,201,77,0.75)` : `12px 14px 0 rgba(13,22,36,0.7)`, background: C.ink }}>
                      <Img src={staticFile(c.file)} style={{ ...cover, transform: `scale(${zoom})`, filter: t ? `blur(${t * 20}px) brightness(${1 - t * 0.35})` : undefined }} />
                      {t > 0.3 && (
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HAND, fontWeight: 700, fontSize: 400, lineHeight: 1, color: C.paper, textShadow: `8px 10px 0 ${C.ink}`, transform: `scale(${pulse * Math.min(1, (t - 0.3) * 2.4)}) rotate(${Math.sin((frame - fTease) / 9) * 5}deg)` }}>?</div>
                      )}
                    </div>
                    <div style={{ position: "absolute", left: -20 - t * 14, top: -22 - t * 14, width: badge, height: badge, borderRadius: badge, background: isStar && inTease ? C.sun : C.coral, color: isStar && inTease ? C.ink : C.white, border: `6px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: badge * 0.6, fontWeight: 900, lineHeight: 1, boxShadow: "5px 6px 0 rgba(13,22,36,0.6)" }}>{c.n}</div>
                  </div>
                );
              })}
            </AbsoluteFill>
          </AbsoluteFill>
          {inTease && (
            <>
              <div style={{ position: "absolute", left: big.x, width: big.w, top: big.y + big.h + 50, display: "flex", justifyContent: "center" }}>
                <div style={{ background: C.sun, color: C.ink, border: `8px solid ${C.ink}`, borderRadius: 30, padding: "16px 54px 20px", fontSize: 96, fontWeight: 900, letterSpacing: 3, whiteSpace: "nowrap", boxShadow: `12px 12px 0 ${C.ink}`, transform: `scale(${stick}) rotate(${-2 + Math.sin(frame / 8) * 1.1}deg)` }}>STAY FOR STEP {tr.teaseStep}</div>
              </div>
              <div style={{ position: "absolute", left: 50, bottom: 60 }}>
                <Mascot pose="point" height={450} delay={fTease + 6} />
              </div>
            </>
          )}
        </AbsoluteFill>
      )}

      {/* Bandes cinéma (acte 1) et éclair du panoramique */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: bars, background: "#0B111C" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: bars, background: "#0B111C" }} />
      <AbsoluteFill style={{ background: C.white, opacity: flash, pointerEvents: "none" }} />

      {/* Habillage sonore */}
      <Sfx at={6} src="sfx/impact.mp3" volume={0.3} />
      <Sfx at={12} src="sfx/impact.mp3" volume={0.42} />
      <Sfx at={13} src="brand/sfx-stamp.mp3" volume={0.4} />
      <Sfx at={fTurn - 5} src="sfx/whoosh.mp3" volume={0.5} />
      <Sfx at={fTurn + 7} src="sfx/pop.mp3" volume={0.35} />
      <Sfx at={fProm - 4} src="sfx/whoosh.mp3" volume={0.42} />
      {tr.cards.map((_, k) => (
        <Sfx key={k} at={land(k)} src="brand/sfx-tick.mp3" volume={0.3} />
      ))}
      <Sfx at={fTease} src="sfx/impact.mp3" volume={0.5} />
      <Sfx at={durationInFrames - 34} src="sfx/riser.mp3" volume={0.3} />
    </AbsoluteFill>
  );
};
