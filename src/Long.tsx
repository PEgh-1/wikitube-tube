import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useVideoConfig } from "remotion";
import { C } from "./theme";
import type { LongProps, Scene } from "./types";
import { PreRoll, Hook, YouNeed, Step, Mistakes, Recap, Outro } from "./scenes/long";
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
      return <YouNeed scene={scene} />;
    case "step":
      return <Step scene={scene} durationInFrames={durationInFrames} />;
    case "mistakes":
      return <Mistakes scene={scene} />;
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
  // Musique de fond : muette pendant l'ouverture (jingle), puis discrète sous la voix, plus présente sur la fin.
  const introEnd = Math.round((timeline.scenes[0]?.type === "preroll" ? timeline.scenes[0].duration : 0) * fps);
  const last = timeline.scenes[timeline.scenes.length - 1];
  const outroStart = Math.round((last?.type === "outro" ? last.start : timeline.totalSec) * fps);
  const musicVolume = (f: number) =>
    interpolate(f, [introEnd - 6, introEnd + 20], [0, MUSIC_VOLUME], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
    interpolate(f, [timeline.durationInFrames - 30, timeline.durationInFrames - 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
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
            <SceneWipe durationInFrames={dur} enter={i > 0} exit={i < timeline.scenes.length - 1} />
            <SceneAudio segments={scene.segments} sceneStart={scene.start} enabled={options?.audio ?? true} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
