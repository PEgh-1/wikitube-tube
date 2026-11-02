import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { C } from "./theme";
import type { ShortProps, Scene } from "./types";
import { ShortHook, ShortStep, ShortCta } from "./scenes/short";
import { Subtitles, SceneAudio } from "./components/Subtitles";
import { FadeOut } from "./components/ui";

const SceneView: React.FC<{ scene: Scene; durationInFrames: number }> = ({ scene, durationInFrames }) => {
  switch (scene.type) {
    case "short-hook":
      return <ShortHook scene={scene} durationInFrames={durationInFrames} />;
    case "short-step":
      return <ShortStep scene={scene} durationInFrames={durationInFrames} />;
    case "short-cta":
      return <ShortCta />;
    default:
      return null;
  }
};

export const Short: React.FC<ShortProps> = ({ timeline, options }) => {
  const { fps } = useVideoConfig();
  const burn = options?.burnSubtitles ?? true;
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      {timeline.scenes.map((scene, i) => {
        const from = Math.round(scene.start * fps);
        const dur = Math.max(1, Math.round(scene.duration * fps));
        return (
          <Sequence key={`${scene.type}-${i}`} from={from} durationInFrames={dur} name={`${i}-${scene.type}`}>
            <FadeOut durationInFrames={dur} frames={6}>
              <SceneView scene={scene} durationInFrames={dur} />
              {burn && scene.segments.length > 0 && <Subtitles segments={scene.segments} sceneStart={scene.start} variant="short" />}
            </FadeOut>
            <SceneAudio segments={scene.segments} sceneStart={scene.start} enabled={options?.audio ?? true} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
