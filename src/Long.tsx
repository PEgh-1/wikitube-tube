import React from "react";
import { OverflowProbe } from "./components/probe";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useVideoConfig } from "remotion";
import { C } from "./theme";
import type { LongProps, Scene } from "./types";
import { PreRoll, Hook, Step, Outro } from "./scenes/long";
import { YouNeed, Mistakes, Recap } from "./scenes/lists";
import { Subtitles, SceneAudio } from "./components/Subtitles";
import { SceneWipe } from "./components/motion";

const MUSIC_VOLUME = 0.075;

const SceneView: React.FC<{ scene: Scene; durationInFrames: number }> = ({ scene, durationInFrames }) => {
  switch (scene.type) {
    case "preroll":
      return <PreRoll scene={scene} />;
    case "hook":
      return <Hook scene={scene} durationInFrames={durationInFrames} />;
    case "youneed":
      return <YouNeed scene={scene} durationInFrames={durationInFrames} />;
    case "step":
      return <Step scene={scene} durationInFrames={durationInFrames} />;
    case "mistakes":
      return <Mistakes scene={scene} durationInFrames={durationInFrames} />;
    case "recap":
      return <Recap scene={scene} />;
    case "outro":
      return <Outro scene={scene} />;
    default:
      return null;
  }
};

export const Long: React.FC<LongProps> = ({ timeline, options }) => {
  const { fps } = useVideoConfig();
  const burn = options?.burnSubtitles ?? true;
  // Musique de fond : discrète sous la voix, coupée pendant la signature (jingle), plus présente sur la fin.
  const sig = timeline.scenes.find((sc) => sc.type === "preroll");
  const sigFrom = Math.round((sig?.start ?? -10) * fps);
  const sigTo = Math.round(((sig?.start ?? -10) + (sig?.duration ?? 0)) * fps);
  const last = timeline.scenes[timeline.scenes.length - 1];
  const outroStart = Math.round((last?.type === "outro" ? last.start : timeline.totalSec) * fps);
  const clampOpt = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const musicVolume = (f: number) =>
    MUSIC_VOLUME *
    interpolate(f, [0, 20], [0, 1], clampOpt) *
    (sig ? Math.max(interpolate(f, [sigFrom - 8, sigFrom], [1, 0], clampOpt) * (f < sigFrom ? 1 : 0), interpolate(f, [sigTo - 4, sigTo + 18], [0, 1], clampOpt)) : 1) *
    interpolate(f, [timeline.durationInFrames - 30, timeline.durationInFrames - 2], [1, 0], clampOpt) *
    (f > outroStart ? 1.4 : 1);
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      {(options?.audio ?? true) && <Audio src={staticFile("brand/music-bed.mp3")} loop volume={musicVolume} />}
      {timeline.scenes.map((scene, i) => {
        const from = Math.round(scene.start * fps);
        const dur = Math.max(1, Math.round(scene.duration * fps));
        const darkSubs = scene.type === "step" && scene.layout === "full";
        return (
          <Sequence key={`${scene.type}-${i}`} from={from} durationInFrames={dur} name={`${i}-${scene.type}${"index" in scene ? `-${scene.index}` : ""}`}>
            <AbsoluteFill>
              <SceneView scene={scene} durationInFrames={dur} />
              {burn && scene.segments.length > 0 && <Subtitles segments={scene.segments} sceneStart={scene.start} dark={darkSubs} />}
            </AbsoluteFill>
            <SceneWipe durationInFrames={dur} enter={i > 0} exit={i < timeline.scenes.length - 1} variant={i} variantIn={i - 1} />
            <SceneAudio segments={scene.segments} sceneStart={scene.start} enabled={options?.audio ?? true} />
          </Sequence>
        );
      })}
      {options?.probe && <OverflowProbe />}
    </AbsoluteFill>
  );
};
