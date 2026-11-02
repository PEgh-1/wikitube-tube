import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../theme";
import { Frame, Logo, Pop, SlideUp, StepBadge, KenBurns } from "../components/ui";
import type { ShortHookScene, ShortStepScene } from "../types";
import { fitTitle } from "./long";

const Header: React.FC<{ step?: number; total?: number }> = ({ step, total }) => (
  <div style={{ position: "absolute", top: 70, left: 60, right: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <Logo size={54} />
    {step && total && (
      <div style={{ display: "flex", gap: 10 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{ width: 64, height: 12, borderRadius: 6, background: i < step ? C.coral : "rgba(27,42,65,0.14)" }} />
        ))}
      </div>
    )}
  </div>
);

export const ShortHook: React.FC<{ scene: ShortHookScene; durationInFrames: number }> = ({ scene, durationInFrames }) => (
  <Frame>
    <Header />
    <Pop style={{ position: "absolute", top: 200, left: 60, right: 60 }}>
      <div style={{ height: 800, borderRadius: 48, overflow: "hidden", border: `12px solid ${C.white}`, boxShadow: "0 30px 70px rgba(27,42,65,0.22)" }}>
        <KenBurns image={scene.image} durationInFrames={durationInFrames} direction={1} zoomTo={1.18} />
      </div>
    </Pop>
    <div style={{ position: "absolute", top: 1050, left: 70, right: 70 }}>
      <SlideUp delay={8} style={{ fontSize: 30, fontWeight: 800, color: C.coral, letterSpacing: 5 }}>
        HOW TO
      </SlideUp>
      <SlideUp delay={14} style={{ fontSize: fitTitle(scene.title, 82), fontWeight: 900, lineHeight: 1.06, marginTop: 10 }}>
        {scene.title.replace(/^How to /i, "")}
      </SlideUp>
    </div>
  </Frame>
);

export const ShortStep: React.FC<{ scene: ShortStepScene; durationInFrames: number }> = ({ scene, durationInFrames }) => {
  const alt = scene.index % 2 === 0;
  return (
    <Frame bg={alt ? C.mint : C.paper}>
      <Header step={scene.index} total={scene.total} />
      <div style={{ position: "absolute", top: 190, left: 60, right: 60, display: "flex", alignItems: "center", gap: 30 }}>
        <StepBadge n={scene.index} size={130} color={alt ? C.teal : C.coral} />
        <SlideUp delay={6} style={{ flex: 1, fontSize: fitTitle(scene.title, 84), fontWeight: 900, lineHeight: 1.06 }}>
          {scene.title}
        </SlideUp>
      </div>
      <Pop delay={4} style={{ position: "absolute", top: 400, left: 60, right: 60 }}>
        <div style={{ height: 860, borderRadius: 48, overflow: "hidden", border: `12px solid ${C.white}`, boxShadow: "0 30px 70px rgba(27,42,65,0.2)" }}>
          <KenBurns image={scene.image} durationInFrames={durationInFrames} direction={scene.index} zoomTo={1.2} />
        </div>
      </Pop>
    </Frame>
  );
};

export const ShortCta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 12 } });
  const pulse = 1 + Math.sin(frame / 5) * 0.05;
  return (
    <Frame bg={C.ink} dots={false}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 50, padding: "0 80px" }}>
        <div style={{ transform: `scale(${s})`, background: C.paper, padding: "34px 60px", borderRadius: 40 }}>
          <Logo size={100} />
        </div>
        <SlideUp delay={8} style={{ color: C.paper, fontSize: 56, fontWeight: 800, textAlign: "center", lineHeight: 1.2 }}>
          Full guide on the channel
        </SlideUp>
        <SlideUp delay={16} style={{ background: C.coral, color: C.white, fontSize: 54, fontWeight: 900, padding: "26px 70px", borderRadius: 999, transform: `scale(${pulse})` }}>
          FOLLOW
        </SlideUp>
        <SlideUp delay={24} style={{ color: "rgba(251,247,239,0.7)", fontSize: 36, fontWeight: 700 }}>
          A new how-to every day
        </SlideUp>
      </AbsoluteFill>
    </Frame>
  );
};
