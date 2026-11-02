import React from "react";
import { Composition, Still } from "remotion";
import { Long } from "./Long";
import { Short } from "./Short";
import { Thumbnail } from "./Thumbnail";
import type { LongProps, ShortProps, ThumbnailProps } from "./types";
import { demoLong, demoShort } from "./fixtures/demo";

const FPS = 30;

/** La durée des compositions vidéo découle de la timeline passée en inputProps (calculée depuis les durées audio). */
const metaFromTimeline = async ({ props }: { props: LongProps | ShortProps }) => ({
  durationInFrames: Math.max(1, props.timeline.durationInFrames),
  fps: props.timeline.fps || FPS,
  width: props.timeline.width,
  height: props.timeline.height,
  props,
});

export const Root: React.FC = () => (
  <>
    <Composition
      id="Long"
      component={Long}
      durationInFrames={demoLong.durationInFrames}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={{ timeline: demoLong, options: { burnSubtitles: true, audio: false } } as LongProps}
      calculateMetadata={metaFromTimeline}
    />
    <Composition
      id="Short"
      component={Short}
      durationInFrames={demoShort.durationInFrames}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={{ timeline: demoShort, options: { burnSubtitles: true, audio: false } } as ShortProps}
      calculateMetadata={metaFromTimeline}
    />
    <Still
      id="Thumbnail"
      component={Thumbnail}
      width={1280}
      height={720}
      defaultProps={{ title: "Clean cast iron the RIGHT way", stepCount: 7, category: "Kitchen" } as ThumbnailProps}
    />
  </>
);
