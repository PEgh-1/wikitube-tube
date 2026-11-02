import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { C } from "./theme";
import type { LongProps, Scene } from "./types";
import { PreRoll, Hook, YouNeed, Step, Mistakes, Recap, Outro } from "./scenes/long";
import { Subtitles, SceneAudio } from "./components/Subtitles";
import { FadeOut } from "./components/ui";

const SceneView: React.FC<{ scene: Scene; durationInFrames: number }> = ({ scene, durationInFrames }) => {
  switch (scene.type) {
    case "preroll":
      return <PreRoll />;
    case "hook":
      return <Hook scene={scene} durationInFrames={durationInFrames} />;
    case "youneed":
      return <YouNeed scene={scene} />;
    case "step":
      return <Step scene={scene} durationInFrames={durationInFrames} />;
    case "mistakes":
      return <Mistakes scene={scene} />;
    case "recap":
      return <Recap scene={scene} />;
    case "outro":
      return <Outro />;
    default:
      return null;
  }
};

export const Long: React.FC<LongProps> = ({ timeline, options }) => {
  const { fps } = useVideoConfig();
  const burn = options?.burnSubtitles ?? true;
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      {timeline.scenes.map((scene, i) => {
        const from = Math.round(scene.start * fps);
        const dur = Math.max(1, Math.round(scene.duration * fps));
        const darkSubs = scene.type === "step" && scene.layout === "full";
        return (
          <Sequence key={`${scene.type}-${i}`} from={from} durationInFrames={dur} name={`${i}-${scene.type}${"index" in scene ? `-${scene.index}` : ""}`}>
            <FadeOut durationInFrames={dur} frames={8}>
              <SceneView scene={scene} durationInFrames={dur} />
              {burn && scene.segments.length > 0 && <Subtitles segments={scene.segments} sceneStart={scene.start} dark={darkSubs} />}
            </FadeOut>
            <SceneAudio segments={scene.segments} sceneStart={scene.start} enabled={options?.audio ?? true} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
