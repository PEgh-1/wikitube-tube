import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, FONT } from "../theme";
import { Frame, Logo, LogoCorner, Pop, SlideUp, ProgressBar, StepBadge, KenBurns, TipPill } from "../components/ui";
import type { HookScene, YouNeedScene, StepScene, MistakesScene, RecapScene } from "../types";

// ---------- Pré-roll logo (3 s) ----------
export const PreRoll: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 12 } });
  const ring = interpolate(frame, [0, 40], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <Frame bg={C.ink} dots={false}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", width: 900 * ring, height: 900 * ring, borderRadius: "50%", border: `6px solid ${C.coral}`, opacity: 1 - ring }} />
        <div style={{ transform: `scale(${s})`, background: C.paper, padding: "40px 70px", borderRadius: 40 }}>
          <Logo size={120} />
        </div>
        <SlideUp delay={12} style={{ marginTop: 40, color: C.paper, fontSize: 44, fontWeight: 700, opacity: 0.9 }}>
          How-to videos, step by step.
        </SlideUp>
      </AbsoluteFill>
    </Frame>
  );
};

// ---------- Hook / titre ----------
export const Hook: React.FC<{ scene: HookScene; durationInFrames: number }> = ({ scene, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tilt = spring({ frame, fps, config: { damping: 16, stiffness: 90 } });
  return (
    <Frame>
      <LogoCorner />
      <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: "0 110px", gap: 80 }}>
        <Pop style={{ flex: 0.95, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              width: 820,
              height: 600,
              borderRadius: 44,
              overflow: "hidden",
              boxShadow: "0 30px 70px rgba(27,42,65,0.22)",
              transform: `rotate(${-3 + (1 - tilt) * 6}deg)`,
              border: `10px solid ${C.white}`,
            }}
          >
            <KenBurns image={scene.image} durationInFrames={durationInFrames} direction={1} />
          </div>
        </Pop>
        <div style={{ flex: 1.05 }}>
          <SlideUp delay={6} style={{ fontSize: 32, fontWeight: 800, color: C.coral, letterSpacing: 5 }}>
            {scene.category.toUpperCase()} · {scene.stepCount} STEPS
          </SlideUp>
          <SlideUp delay={12} style={{ fontSize: fitTitle(scene.title, 86), fontWeight: 900, lineHeight: 1.06, marginTop: 14 }}>
            {scene.title}
          </SlideUp>
          <SlideUp delay={26} style={{ marginTop: 34, display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 70, height: 8, borderRadius: 4, background: C.teal }} />
            <div style={{ width: 28, height: 8, borderRadius: 4, background: C.sun }} />
            <div style={{ width: 14, height: 8, borderRadius: 4, background: C.coral }} />
          </SlideUp>
        </div>
      </AbsoluteFill>
    </Frame>
  );
};

// ---------- Il vous faut ----------
export const YouNeed: React.FC<{ scene: YouNeedScene }> = ({ scene }) => {
  const n = scene.items.length;
  const w = n <= 3 ? 420 : n === 4 ? 380 : 320;
  return (
    <Frame>
      <LogoCorner />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <SlideUp style={{ fontSize: 64, fontWeight: 900, marginBottom: 54 }}>You'll need</SlideUp>
        <div style={{ display: "flex", gap: 44, flexWrap: "wrap", justifyContent: "center", maxWidth: 1760 }}>
          {scene.items.map((it, i) => (
            <Pop key={it} delay={8 + i * 8}>
              <div
                style={{
                  width: w,
                  height: w * 0.86,
                  background: C.white,
                  borderRadius: 36,
                  boxShadow: "0 20px 50px rgba(27,42,65,0.12)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 26,
                  padding: 24,
                }}
              >
                <div
                  style={{
                    width: 110,
                    height: 110,
                    borderRadius: 32,
                    background: [C.teal, C.sun, C.coral, C.ink, C.teal, C.sun][i % 6],
                    color: C.white,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 56,
                    fontWeight: 900,
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ fontSize: 36, fontWeight: 800, textAlign: "center", lineHeight: 1.2 }}>{it}</div>
              </div>
            </Pop>
          ))}
        </div>
      </AbsoluteFill>
    </Frame>
  );
};

// ---------- Étape : 3 variantes de mise en page ----------
export const Step: React.FC<{ scene: StepScene; durationInFrames: number }> = ({ scene, durationInFrames }) => {
  if (scene.layout === "full") return <StepFull scene={scene} durationInFrames={durationInFrames} />;
  if (scene.layout === "card") return <StepCard scene={scene} durationInFrames={durationInFrames} />;
  return <StepSplit scene={scene} durationInFrames={durationInFrames} />;
};

const StepHeader: React.FC<{ scene: StepScene; onDark?: boolean }> = ({ scene, onDark }) => (
  <>
    <ProgressBar step={scene.index} total={scene.total} />
    <LogoCorner top={70} onDark={onDark} />
    <div
      style={{
        position: "absolute",
        top: 70,
        right: 80,
        fontSize: 30,
        fontWeight: 800,
        color: onDark ? "rgba(255,255,255,0.8)" : C.muted,
        letterSpacing: 3,
        fontFamily: FONT,
      }}
    >
      STEP {scene.index}/{scene.total}
    </div>
  </>
);

/** Variante A : texte à gauche, image dans une carte à droite. */
const StepSplit: React.FC<{ scene: StepScene; durationInFrames: number }> = ({ scene, durationInFrames }) => (
  <Frame>
    <StepHeader scene={scene} />
    <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: "0 110px", gap: 60 }}>
      <div style={{ flex: 1.05 }}>
        <StepBadge n={scene.index} />
        <SlideUp delay={6} style={{ fontSize: fitTitle(scene.title, 80), fontWeight: 900, lineHeight: 1.08, marginTop: 28 }}>
          {scene.title}
        </SlideUp>
        <div style={{ marginTop: 34 }}>
          <TipPill text={scene.tip} />
        </div>
      </div>
      <Pop delay={4} style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <div style={{ width: 800, height: 560, borderRadius: 48, overflow: "hidden", boxShadow: "0 24px 60px rgba(27,42,65,0.16)", border: `10px solid ${C.white}` }}>
          <KenBurns image={scene.image} durationInFrames={durationInFrames} direction={scene.index} />
        </div>
      </Pop>
    </AbsoluteFill>
  </Frame>
);

/** Variante B : image plein cadre, dégradé encre, titre en bas à gauche. */
const StepFull: React.FC<{ scene: StepScene; durationInFrames: number }> = ({ scene, durationInFrames }) => (
  <Frame bg={C.ink} dots={false}>
    <AbsoluteFill>
      <KenBurns
        image={scene.image}
        durationInFrames={durationInFrames}
        direction={scene.index + 1}
        zoomFrom={1.0}
        zoomTo={1.1}
        overlay={`linear-gradient(180deg, rgba(27,42,65,0.55) 0%, rgba(27,42,65,0.05) 35%, rgba(27,42,65,0.15) 60%, rgba(27,42,65,0.92) 100%)`}
      />
    </AbsoluteFill>
    <StepHeader scene={scene} onDark />
    <div style={{ position: "absolute", left: 110, bottom: 170, right: 110, display: "flex", alignItems: "flex-end", gap: 40 }}>
      <StepBadge n={scene.index} size={140} />
      <div style={{ flex: 1 }}>
        <SlideUp delay={6} style={{ fontSize: fitTitle(scene.title, 84), fontWeight: 900, lineHeight: 1.06, color: C.white, textShadow: "0 4px 24px rgba(0,0,0,0.35)" }}>
          {scene.title}
        </SlideUp>
      </div>
    </div>
    <div style={{ position: "absolute", top: 150, right: 80 }}>
      <TipPill text={scene.tip} dark />
    </div>
  </Frame>
);

/** Variante C : grande image en bandeau haut, titre + astuce dessous. */
const StepCard: React.FC<{ scene: StepScene; durationInFrames: number }> = ({ scene, durationInFrames }) => (
  <Frame bg={C.mint}>
    <StepHeader scene={scene} />
    <Pop delay={2} style={{ position: "absolute", top: 140, left: 110, right: 110 }}>
      <div style={{ height: 600, borderRadius: 40, overflow: "hidden", boxShadow: "0 24px 60px rgba(27,42,65,0.16)" }}>
        <KenBurns image={scene.image} durationInFrames={durationInFrames} direction={scene.index + 2} overlay="linear-gradient(90deg, rgba(27,42,65,0.25), transparent 40%)" />
      </div>
    </Pop>
    <div style={{ position: "absolute", left: 110, right: 110, top: 780, display: "flex", alignItems: "center", gap: 40 }}>
      <StepBadge n={scene.index} size={110} color={C.teal} />
      <SlideUp delay={6} style={{ flex: 1, fontSize: fitTitle(scene.title, 66), fontWeight: 900, lineHeight: 1.08 }}>
        {scene.title}
      </SlideUp>
      <div style={{ flexShrink: 0 }}>
        <TipPill text={scene.tip} size={30} />
      </div>
    </div>
  </Frame>
);

// ---------- Erreurs à éviter ----------
export const Mistakes: React.FC<{ scene: MistakesScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const perItem = (scene.duration * fps * 0.75) / Math.max(1, scene.items.length);
  return (
    <Frame bg={C.blush}>
      <LogoCorner />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: "0 140px" }}>
        <SlideUp style={{ fontSize: 34, fontWeight: 800, color: C.coral, letterSpacing: 5 }}>MISTAKES TO AVOID</SlideUp>
        <div style={{ display: "flex", flexDirection: "column", gap: 28, marginTop: 44, width: "100%", maxWidth: 1400 }}>
          {scene.items.map((it, i) => {
            const delay = 10 + i * perItem;
            const s = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 140 } });
            return (
              <div
                key={it}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 36,
                  background: C.white,
                  borderRadius: 32,
                  padding: "30px 44px",
                  boxShadow: "0 18px 44px rgba(27,42,65,0.10)",
                  transform: `translateX(${(1 - s) * -80}px)`,
                  opacity: s,
                }}
              >
                <div style={{ width: 84, height: 84, borderRadius: 24, background: C.coral, color: C.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 54, fontWeight: 900, flexShrink: 0 }}>
                  ✕
                </div>
                <div style={{ fontSize: 50, fontWeight: 800, lineHeight: 1.15 }}>{it}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Frame>
  );
};

// ---------- Récap : liste à cocher animée ----------
export const Recap: React.FC<{ scene: RecapScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = scene.items.length;
  const perItem = (scene.duration * fps * 0.8) / Math.max(1, n);
  const two = n > 5;
  const cols = two ? [scene.items.slice(0, Math.ceil(n / 2)), scene.items.slice(Math.ceil(n / 2))] : [scene.items];
  return (
    <Frame>
      <LogoCorner />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: "0 120px" }}>
        <SlideUp style={{ fontSize: 60, fontWeight: 900, marginBottom: 40 }}>Recap</SlideUp>
        <div style={{ display: "flex", gap: 60, width: "100%", justifyContent: "center" }}>
          {cols.map((col, ci) => (
            <div key={ci} style={{ display: "flex", flexDirection: "column", gap: 22, flex: 1, maxWidth: 820 }}>
              {col.map((it, i) => {
                const idx = ci === 0 ? i : cols[0].length + i;
                const delay = 12 + idx * perItem;
                const s = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 180 } });
                const checked = frame >= delay + 4;
                return (
                  <div key={it} style={{ display: "flex", alignItems: "center", gap: 26, background: C.white, borderRadius: 26, padding: "20px 30px", boxShadow: "0 14px 36px rgba(27,42,65,0.08)" }}>
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 18,
                        border: `4px solid ${checked ? C.teal : "rgba(27,42,65,0.2)"}`,
                        background: checked ? C.teal : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: C.white,
                        fontSize: 40,
                        fontWeight: 900,
                        transform: `scale(${checked ? 0.8 + 0.2 * Math.min(1, s) : 1})`,
                        flexShrink: 0,
                      }}
                    >
                      {checked ? "✓" : ""}
                    </div>
                    <div style={{ fontSize: 40, fontWeight: 800, color: checked ? C.ink : C.muted }}>
                      <span style={{ color: C.coral, marginRight: 14 }}>{idx + 1}.</span>
                      {it}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </Frame>
  );
};

// ---------- Outro abonnement ----------
export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 12 } });
  const pulse = 1 + Math.sin(frame / 5) * 0.04;
  const bell = Math.sin(frame / 3) * 12;
  return (
    <Frame bg={C.ink} dots={false}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 40 }}>
        <div style={{ transform: `scale(${s})`, background: C.paper, padding: "30px 60px", borderRadius: 36 }}>
          <Logo size={96} />
        </div>
        <SlideUp delay={8} style={{ color: C.paper, fontSize: 48, fontWeight: 700 }}>
          A new how-to every day.
        </SlideUp>
        <SlideUp delay={16} style={{ display: "flex", gap: 30, alignItems: "center" }}>
          <div style={{ background: C.coral, color: C.white, fontSize: 44, fontWeight: 900, padding: "20px 60px", borderRadius: 999, transform: `scale(${pulse})` }}>SUBSCRIBE</div>
          <div style={{ width: 84, height: 84, borderRadius: 999, background: C.sun, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${bell}deg)` }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill={C.ink}>
              <path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 0 0-5-6.7V3a2 2 0 1 0-4 0v1.3A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2Z" />
            </svg>
          </div>
        </SlideUp>
      </AbsoluteFill>
    </Frame>
  );
};

/** Réduit la taille du titre pour les titres longs (évite les débordements). */
export function fitTitle(title: string, base: number): number {
  const len = title.length;
  if (len <= 28) return base;
  if (len <= 40) return base * 0.86;
  if (len <= 55) return base * 0.74;
  if (len <= 70) return base * 0.64;
  return base * 0.56;
}
