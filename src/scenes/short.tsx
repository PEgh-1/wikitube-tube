import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT } from "../theme";
import { Frame, Logo, SlideUp, StepBadge } from "../components/ui";
import { Mascot } from "../components/brand";
import type { ImageRef, ShortHookScene, ShortStepScene, Short2HookScene, Short2BeatScene } from "../types";

// Format vertical 1080×1920 : la photo occupe tout l'écran (léger travelling), le texte se pose dessus.
// Zones laissées libres pour l'interface des plateformes : 150 px à droite sous y=1100, 330 px en bas.

/** Taille de titre qui remplit la largeur sans dépasser `maxLines` lignes (largeur moyenne d'un caractère ≈ 0,56 × corps). */
const fit = (text: string, max: number, width: number, maxLines: number) => {
  let size = max;
  const lines = (s: number) => {
    const perLine = Math.max(4, Math.floor(width / (s * 0.56)));
    let n = 1;
    let cur = 0;
    for (const w of text.split(/\s+/)) {
      if (cur && cur + 1 + w.length > perLine) {
        n++;
        cur = w.length;
      } else cur += (cur ? 1 : 0) + w.length;
    }
    return n;
  };
  while (size > 56 && lines(size) > maxLines) size -= 4;
  return size;
};

const Photo: React.FC<{ image?: ImageRef; durationInFrames: number; dir?: number }> = ({ image, durationInFrames, dir = 1 }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, Math.max(1, durationInFrames)], [0, 1], { extrapolateRight: "clamp" });
  const tall = (image?.height ?? 0) > (image?.width ?? 1); // photo verticale dédiée : zoom avant plus marqué
  const fx = ((image as { focus?: [number, number] } | undefined)?.focus?.[0] ?? 0.5) * 100;
  // Travelling horizontal autour du sujet : la photo 16:9 défile derrière le cadre vertical.
  const span = 13;
  const x = Math.max(4, Math.min(96, fx + (dir % 2 ? -span : span) * (1 - 2 * t)));
  const style: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover", objectPosition: `${x}% 50%`, transform: `scale(${1.03 + (tall ? 0.16 : 0.07) * t})`, transformOrigin: tall ? "50% 62%" : "50% 50%" };
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      {image?.kind === "video" ? <OffthreadVideo src={staticFile(image.file)} muted style={style} /> : image ? <Img src={staticFile(image.file)} style={style} /> : null}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(20,31,49,0.94) 0px, rgba(20,31,49,0.78) 380px, rgba(20,31,49,0) 760px, rgba(20,31,49,0) 1150px, rgba(20,31,49,0.82) 1560px, rgba(20,31,49,0.96) 1920px)" }} />
    </AbsoluteFill>
  );
};

const Header: React.FC<{ step?: number; total?: number; label?: string }> = ({ step, total, label }) => (
  <div style={{ position: "absolute", top: 84, left: 56, right: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <div style={{ background: C.paper, borderRadius: 22, padding: "10px 22px" }}>
      <Logo size={50} />
    </div>
    {step && total ? (
      <div style={{ display: "flex", gap: 12 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{ width: 92, height: 16, borderRadius: 8, background: i < step ? C.sun : "rgba(255,255,255,0.32)" }} />
        ))}
      </div>
    ) : (
      <div style={{ background: C.coral, color: C.white, fontSize: 34, fontWeight: 900, letterSpacing: 3, padding: "12px 26px", borderRadius: 999 }}>{label ?? "3 QUICK STEPS"}</div>
    )}
  </div>
);

const shadow = "0 4px 0 rgba(20,31,49,0.55), 0 10px 30px rgba(20,31,49,0.6)";

// Ouverture : le résultat en plein écran et le texte choc lisibles dès la toute première image
// (aucun logo, aucune entrée en fondu : c'est cette image que le flux Shorts affiche avant le geste de balayage).
export const ShortHook: React.FC<{ scene: ShortHookScene; durationInFrames: number }> = ({ scene, durationInFrames }) => {
  const frame = useCurrentFrame();
  const text = (scene.punch ?? scene.title.replace(/^How to /i, "").replace(/\s*\(.*\)\s*$/, "")).toUpperCase();
  const words = text.split(/\s+/);
  const last = words.pop();
  // Coup de zoom : le texte arrive déjà à pleine taille puis se cale (jamais invisible).
  const pop = interpolate(frame, [0, 7], [0.93, 1], { extrapolateRight: "clamp" });
  const tilt = interpolate(frame, [0, 7], [-3, -1.5], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <Photo image={scene.image} durationInFrames={durationInFrames} />
      <div style={{ position: "absolute", top: 150, left: 56, right: 56, transform: `scale(${pop}) rotate(${tilt}deg)`, transformOrigin: "0% 50%" }}>
        {/* Capitales ≈ 0,68 × corps par caractère : largeur utile réduite pour ne jamais toucher le bord. */}
        <div style={{ fontSize: fit(text, 160, 780, 4), fontWeight: 900, lineHeight: 0.98, color: C.white, textShadow: shadow, letterSpacing: -1 }}>
          {words.join(" ")}{" "}
          <span style={{ color: C.sun }}>{last}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ShortStep: React.FC<{ scene: ShortStepScene; durationInFrames: number }> = ({ scene, durationInFrames }) => (
  <AbsoluteFill style={{ fontFamily: FONT }}>
    <Photo image={scene.image} durationInFrames={durationInFrames} dir={scene.index} />
    <Header step={scene.index} total={scene.total} />
    <div style={{ position: "absolute", top: 220, left: 56, right: 56, display: "flex", alignItems: "center", gap: 30 }}>
      <StepBadge n={scene.index} size={176} color={scene.index % 2 ? C.coral : C.teal} />
      <SlideUp delay={6} style={{ flex: 1, fontSize: fit(scene.title, 104, 760, 3), fontWeight: 900, lineHeight: 1.04, color: C.white, textShadow: shadow }}>
        {scene.title}
      </SlideUp>
    </div>
  </AbsoluteFill>
);

// ---------- Second Short : une erreur à éviter ("mistake") ou une astuce ("tip") ----------
const KIND = {
  mistake: { tag: "STOP DOING THIS", color: C.coral, mascot: "no" },
  tip: { tag: "WIKI'S TIP", color: C.teal, mascot: "idea" },
} as const;

const Tag: React.FC<{ text: string; bg: string; color?: string; size?: number; delay?: number }> = ({ text, bg, color = C.white, size = 46, delay = 4 }) => (
  <SlideUp delay={delay} style={{ display: "inline-block", background: bg, color, fontSize: size, fontWeight: 900, letterSpacing: 5, padding: "8px 26px", borderRadius: 16, transform: "rotate(-2deg)" }}>
    {text}
  </SlideUp>
);

export const Short2Hook: React.FC<{ scene: Short2HookScene; durationInFrames: number }> = ({ scene, durationInFrames }) => {
  const k = KIND[scene.kind];
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <Photo image={scene.image} durationInFrames={durationInFrames} />
      <Header label={scene.kind === "mistake" ? "MISTAKE TO AVOID" : "QUICK TIP"} />
      <div style={{ position: "absolute", top: 226, left: 56, right: 56 }}>
        <Tag text={k.tag} bg={k.color} size={58} />
        <SlideUp delay={10} style={{ fontSize: fit(scene.title, 132, 968, 3), fontWeight: 900, lineHeight: 1.02, marginTop: 22, color: C.white, textShadow: shadow }}>
          {scene.title}
        </SlideUp>
      </div>
      <div style={{ position: "absolute", left: 40, bottom: 560 }}>
        <Mascot pose={k.mascot} height={330} delay={6} />
      </div>
    </AbsoluteFill>
  );
};

export const Short2Beat: React.FC<{ scene: Short2BeatScene; durationInFrames: number }> = ({ scene, durationInFrames }) => {
  const good = scene.kind === "tip" || scene.index === scene.total;
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <Photo image={scene.image} durationInFrames={durationInFrames} dir={scene.index} />
      <Header step={scene.index} total={scene.total} />
      <div style={{ position: "absolute", top: 226, left: 56, right: 56 }}>
        <Tag text={scene.label.toUpperCase()} bg={good ? C.teal : C.sun} color={good ? C.white : C.ink} />
        <SlideUp delay={8} style={{ fontSize: fit(scene.title, 116, 968, 3), fontWeight: 900, lineHeight: 1.03, marginTop: 20, color: C.white, textShadow: shadow }}>
          {scene.title}
        </SlideUp>
      </div>
    </AbsoluteFill>
  );
};

export const ShortCta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 12 } });
  const pulse = 1 + Math.sin(frame / 5) * 0.04;
  return (
    <Frame bg={C.ink} dots={false}>
      <AbsoluteFill style={{ alignItems: "center", padding: "150px 60px 0" }}>
        <div style={{ transform: `scale(${s})`, background: C.paper, padding: "30px 64px", borderRadius: 44 }}>
          <Logo size={120} />
        </div>
        <SlideUp delay={6} style={{ color: C.white, fontSize: 112, fontWeight: 900, textAlign: "center", lineHeight: 1.03, marginTop: 56 }}>
          Want the <span style={{ color: C.sun }}>full guide?</span>
        </SlideUp>
        <SlideUp delay={12} style={{ background: C.coral, color: C.white, fontSize: 84, fontWeight: 900, letterSpacing: 3, padding: "28px 120px", borderRadius: 999, marginTop: 44, transform: `scale(${pulse})`, boxShadow: `0 12px 0 rgba(0,0,0,0.25)` }}>
          FOLLOW
        </SlideUp>
        <div style={{ marginTop: 36 }}>
          <Mascot pose="thumbs" height={500} delay={8} />
        </div>
        <div style={{ position: "absolute", bottom: 236, left: 0, right: 0, textAlign: "center", color: C.sun, fontSize: 50, fontWeight: 800 }}>A new how-to every day</div>
      </AbsoluteFill>
    </Frame>
  );
};
