// Scènes « liste » dans la charte plein écran : matériel, erreurs à éviter, récap.
// Chaque élément apparaît au moment où la voix le nomme (scene.cues, en secondes relatives à la scène).
import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, FONT } from "../theme";
import { Frame, LogoCorner, SlideUp, KenBurns } from "../components/ui";
import { Mascot, CueSfx, HAND } from "../components/brand";
import { MultiShot } from "../components/motion";
import { useShake } from "../components/fx";
import type { YouNeedScene, MistakesScene, RecapScene } from "../types";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const GRID = `linear-gradient(rgba(27,42,65,0.06) 2px, transparent 2px), linear-gradient(90deg, rgba(27,42,65,0.06) 2px, transparent 2px)`;

/** Index de l'élément en cours (-1 avant le premier) et image locale depuis son apparition. */
function useActive(cues: number[] | undefined, n: number, durationInFrames: number) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = (i: number) => (cues?.[i] !== undefined ? Math.round(cues[i] * fps) : Math.round(12 + (i * durationInFrames * 0.8) / Math.max(1, n)));
  let active = -1;
  for (let i = 0; i < n; i++) if (frame >= at(i)) active = i;
  return { frame, fps, at, active, local: active >= 0 ? frame - at(active) : 0 };
}

const Check: React.FC<{ p: number; size?: number; color?: string }> = ({ p, size = 62, color = C.teal }) => (
  <svg width={size} height={size} viewBox="0 0 52 52" style={{ flexShrink: 0 }}>
    <rect x={5} y={5} width={42} height={42} rx={11} fill={C.white} stroke={C.ink} strokeWidth={5} />
    <path d="M13 27 L23 37 L41 14" fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
  </svg>
);

// ---------- Matériel : la page de notice à gauche, la photo du matériel en grand à droite ----------
export const YouNeed: React.FC<{ scene: YouNeedScene; durationInFrames: number }> = ({ scene, durationInFrames }) => {
  const n = scene.items.length;
  const { frame, fps, at, active } = useActive(scene.cues, n, durationInFrames);
  const rowH = Math.min(124, Math.floor(690 / Math.max(1, n)));
  const size = n <= 4 ? 64 : n <= 6 ? 56 : 48;
  return (
    <Frame bg={C.ink} dots={false}>
      {/* photo : tout l'espace à droite, bord incliné */}
      <div style={{ position: "absolute", left: 700, top: 0, right: 0, bottom: 0, clipPath: "polygon(7% 0, 100% 0, 100% 100%, 0 100%)" }}>
        <KenBurns image={scene.image ?? undefined} durationInFrames={durationInFrames} direction={2} zoomFrom={1.02} zoomTo={1.1} />
        <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(27,42,65,0.35) 0%, rgba(27,42,65,0) 22%, rgba(27,42,65,0) 70%, rgba(27,42,65,0.35) 100%)" }} />
      </div>
      {/* page de notice */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 790, background: C.paper, backgroundImage: GRID, backgroundSize: "48px 48px", clipPath: "polygon(0 0, 100% 0, 89.5% 100%, 0 100%)" }} />
      <LogoCorner top={50} />
      <div style={{ position: "absolute", left: 80, top: 132 }}>
        <SlideUp delay={3} style={{ fontSize: 30, fontWeight: 900, letterSpacing: 6, color: C.teal, fontFamily: FONT }}>BEFORE YOU START</SlideUp>
        <SlideUp delay={7} style={{ fontFamily: HAND, fontWeight: 700, fontSize: 118, lineHeight: 0.95, color: C.ink }}>You'll need</SlideUp>
      </div>
      <div style={{ position: "absolute", left: 80, top: 318, width: 600 }}>
        {scene.items.map((it, i) => {
          const f = frame - at(i);
          const on = f >= 0;
          const sp = spring({ frame: f, fps, config: { damping: 11, stiffness: 190 } });
          const tick = interpolate(f, [3, 12], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
          const hl = interpolate(f, [2, 14], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
          const cur = i === active;
          return (
            <div key={it} style={{ height: rowH, display: "flex", alignItems: "center", gap: 22, opacity: on ? 1 : 0.28, transform: `translateX(${on ? (1 - sp) * -30 : 0}px) scale(${cur ? 1.04 : 1})`, transformOrigin: "0% 50%" }}>
              <Check p={on ? tick : 0} size={size + 8} />
              <div style={{ position: "relative", fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.05, color: C.ink }}>
                {cur && <div style={{ position: "absolute", left: -8, right: -10, bottom: 2, height: "46%", background: C.sun, borderRadius: 8, transform: `scaleX(${hl}) rotate(-1deg)`, transformOrigin: "0% 50%" }} />}
                <span style={{ position: "relative" }}>{it}</span>
              </div>
            </div>
          );
        })}
      </div>
      {/* compteur + Wiki dans l'angle de la photo */}
      <div style={{ position: "absolute", right: 60, top: 56, background: C.coral, color: C.white, border: `5px solid ${C.paper}`, borderRadius: 18, padding: "6px 26px 10px", fontFamily: HAND, fontWeight: 700, fontSize: 60, lineHeight: 1, transform: "rotate(3deg)", boxShadow: "7px 7px 0 rgba(27,42,65,0.55)" }}>
        {Math.max(0, active + 1)} / {n}
      </div>
      <div style={{ position: "absolute", right: 40, bottom: 20 }}>
        <Mascot pose="point" height={330} delay={10} flip />
      </div>
      <CueSfx cues={scene.items.map((_, i) => ({ t: at(i) / fps + 0.1, sfx: "tick" as const, volume: 0.3 }))} />
    </Frame>
  );
};

// ---------- Erreurs à éviter : une photo plein écran par erreur, tampon rouge, Wiki dit non ----------
export const Mistakes: React.FC<{ scene: MistakesScene; durationInFrames: number }> = ({ scene, durationInFrames }) => {
  const n = scene.items.length;
  const { frame, fps, at, active, local } = useActive(scene.cues, n, durationInFrames);
  const photos = (scene.images?.length ?? 0) === n;
  const starts = scene.items.map((_, i) => (i === 0 ? 0 : Math.max(0, at(i) / fps - 0.15)));
  const intro = active < 0;
  const card = spring({ frame: local, fps, config: { damping: 12, stiffness: 170 } });
  const stampIn = spring({ frame: local - 2, fps, config: { damping: 9, stiffness: 240 } });
  const stampOp = interpolate(local, [2, 5, 34, 52], [0, 0.95, 0.95, 0], clamp);
  const titleOut = intro ? 1 : interpolate(local, [0, 8], [1, 0], clamp);
  const shake = useShake(scene.items.map((_, i) => at(i) / fps + 0.14), 12);
  return (
    <Frame bg={C.ink} dots={false}>
      <AbsoluteFill style={{ transform: shake }}>
        {photos ? (
          <MultiShot shots={scene.images ?? []} durationInFrames={durationInFrames} seed={5} starts={starts} box={[1920, 1080]} overlay="linear-gradient(180deg, rgba(27,42,65,0.6) 0%, rgba(27,42,65,0) 20%, rgba(27,42,65,0) 58%, rgba(27,42,65,0.85) 100%)" />
        ) : (
          <AbsoluteFill style={{ background: C.coral, backgroundImage: `radial-gradient(rgba(27,42,65,0.12) 2px, transparent 2px)`, backgroundSize: "44px 44px" }} />
        )}
        <AbsoluteFill style={{ background: C.ink, opacity: 0.55 * titleOut }} />
        <AbsoluteFill style={{ boxShadow: `inset 0 0 0 14px ${C.coral}` }} />
      </AbsoluteFill>
      <LogoCorner top={64} onDark />
      <div style={{ position: "absolute", top: 60, right: 80, background: C.coral, color: C.white, fontFamily: FONT, fontWeight: 900, fontSize: 30, letterSpacing: 5, padding: "8px 24px", borderRadius: 12, border: `4px solid ${C.paper}`, transform: "rotate(2deg)" }}>MISTAKES TO AVOID</div>
      {/* titre d'entrée, le temps de la phrase d'introduction */}
      {titleOut > 0 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: titleOut }}>
          <SlideUp delay={4} style={{ fontFamily: HAND, fontWeight: 700, fontSize: 190, lineHeight: 0.95, color: C.white, textShadow: `6px 7px 0 ${C.ink}`, textAlign: "center" }}>
            {n} mistakes
          </SlideUp>
          <SlideUp delay={9} style={{ fontFamily: FONT, fontWeight: 900, fontSize: 64, color: C.sun, marginTop: 6, textShadow: `3px 4px 0 ${C.ink}` }}>
            {scene.subtitle ?? "that ruin the result"}
          </SlideUp>
        </AbsoluteFill>
      )}
      {/* tampon */}
      {!intro && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: stampOp }}>
          <svg width={560} height={560} viewBox="0 0 100 100" style={{ transform: `translate(120px, -90px) scale(${2.3 - 1.3 * stampIn}) rotate(${-8 + (1 - stampIn) * 14}deg)`, overflow: "visible" }}>
            <path d="M16 16 L84 84 M84 16 L16 84" fill="none" stroke={C.ink} strokeWidth={17} strokeLinecap="round" />
            <path d="M16 16 L84 84 M84 16 L16 84" fill="none" stroke={C.coral} strokeWidth={11} strokeLinecap="round" />
          </svg>
        </AbsoluteFill>
      )}
      {/* carte de l'erreur en cours */}
      {!intro && (
        <div key={active} style={{ position: "absolute", left: 80, bottom: 64, maxWidth: 1240, display: "flex", alignItems: "center", gap: 30, background: C.paper, border: `7px solid ${C.ink}`, borderRadius: 30, padding: "20px 44px 24px 24px", boxShadow: `12px 12px 0 ${C.coral}`, transform: `translateY(${(1 - card) * 120}px) rotate(-1.5deg)`, opacity: Math.min(1, card * 1.6) }}>
          <div style={{ width: 128, height: 128, borderRadius: 30, background: C.coral, border: `6px solid ${C.ink}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width={76} height={76} viewBox="0 0 100 100">
              <path d="M16 16 L84 84 M84 16 L16 84" fill="none" stroke={C.white} strokeWidth={18} strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 30, letterSpacing: 5, color: C.coral }}>
              MISTAKE {active + 1} / {n}
            </div>
            <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 96, lineHeight: 0.98, color: C.ink }}>{scene.items[active]}</div>
          </div>
        </div>
      )}
      {!intro && (
        <div style={{ position: "absolute", right: 70, bottom: 30, transform: `translateY(${Math.sin(frame / 6) * 6}px)` }}>
          <Mascot pose="no" height={390} delay={at(0)} />
        </div>
      )}
      <CueSfx cues={scene.items.map((_, i) => ({ t: at(i) / fps + 0.08, sfx: "stamp" as const, volume: 0.5 }))} />
    </Frame>
  );
};

// ---------- Récap : la planche des étapes, chaque vignette se valide quand la voix la cite ----------
export const Recap: React.FC<{ scene: RecapScene }> = ({ scene }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const n = scene.items.length;
  const dur = Math.round(scene.duration * fps) || durationInFrames;
  const { frame, at, active } = useActive(scene.cues, n, dur);
  const cols = n <= 4 ? 2 : n <= 6 ? 3 : 4;
  const rows = Math.ceil((n + 1) / cols);
  const gap = 30;
  const w = Math.floor((1920 - 140 - (cols - 1) * gap) / cols);
  const availH = 1080 - 232 - 44;
  const h = Math.floor((availH - (rows - 1) * gap) / rows);
  const imgH = h - 104;
  return (
    <Frame bg={C.paper} dots={false}>
      <AbsoluteFill style={{ backgroundImage: GRID, backgroundSize: "48px 48px" }} />
      <LogoCorner top={50} />
      <div style={{ position: "absolute", left: 80, top: 112, display: "flex", alignItems: "baseline", gap: 26 }}>
        <SlideUp delay={3} style={{ fontFamily: HAND, fontWeight: 700, fontSize: 112, lineHeight: 0.95, color: C.ink }}>Recap</SlideUp>
        <SlideUp delay={8} style={{ fontFamily: FONT, fontWeight: 900, fontSize: 30, letterSpacing: 6, color: C.teal }}>
          {n} STEPS · {Math.max(0, active + 1)} / {n}
        </SlideUp>
      </div>
      <div style={{ position: "absolute", left: 70, top: 232, width: 1780, display: "flex", flexWrap: "wrap", gap }}>
        {scene.items.map((it, i) => {
          const f = frame - at(i);
          const on = f >= 0;
          const sp = spring({ frame: f, fps, config: { damping: 11, stiffness: 180 } });
          const tick = interpolate(f, [4, 13], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
          const img = scene.images?.[i];
          const tilt = [-1.4, 1, -0.6, 1.5, 0.8, -1.2, 1.1, -0.9][i % 8];
          return (
            <div key={i} style={{ width: w, height: h, boxSizing: "border-box", background: C.white, border: `6px solid ${C.ink}`, borderRadius: 24, overflow: "hidden", position: "relative", boxShadow: on ? `9px 9px 0 ${[C.coral, C.teal, C.sun][i % 3]}` : "none", opacity: on ? 1 : 0.3, transform: `rotate(${on ? tilt : 0}deg) scale(${on ? 0.9 + 0.1 * sp : 0.96})` }}>
              <div style={{ height: imgH, background: C.mint, overflow: "hidden", filter: on ? "none" : "grayscale(1)" }}>{img?.file ? <Img src={staticFile(img.file)} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}</div>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 92, display: "flex", alignItems: "center", gap: 14, padding: "0 16px" }}>
                <div style={{ width: 60, height: 60, borderRadius: 16, background: [C.coral, C.teal, C.ink][i % 3], color: C.white, fontFamily: FONT, fontWeight: 900, fontSize: 34, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
                <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: it.length > 22 ? 32 : 38, lineHeight: 1.05, color: C.ink }}>{it}</div>
              </div>
              {on && (
                <div style={{ position: "absolute", right: 12, top: 12, width: 76, height: 76, borderRadius: 38, background: C.teal, border: `5px solid ${C.ink}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${sp})` }}>
                  <svg width={48} height={48} viewBox="0 0 52 52">
                    <path d="M10 27 L22 39 L43 13" fill="none" stroke={C.white} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tick} />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
        {/* case libre : Wiki valide */}
        {n % cols !== 0 && (
          <div style={{ width: w, height: h, position: "relative" }}>
            <div style={{ position: "absolute", left: "50%", bottom: -6, transform: "translateX(-50%)" }}>
              <Mascot pose={active >= n - 1 ? "party" : "thumbs"} height={Math.min(h + 6, 350)} delay={14} />
            </div>
          </div>
        )}
      </div>
      <CueSfx cues={scene.items.map((_, i) => ({ t: at(i) / fps + 0.1, sfx: "tick" as const, volume: 0.3 }))} />
    </Frame>
  );
};
