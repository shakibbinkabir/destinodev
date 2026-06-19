import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";

import { COLORS, FONT_STACK } from "./theme";
import { TICKKETO_FONT } from "./loadFonts";
import { Scene01Intro } from "./scenes/Scene01Intro";
import { Scene02Concert } from "./scenes/Scene02Concert";
import { Scene03Flow } from "./scenes/Scene03Flow";
import { Scene04ComingSoon } from "./scenes/Scene04ComingSoon";

// Scene lengths (frames @30fps). Net duration = sum - sum(transitions).
export const SCENES = {
  intro: 78,
  concert: 132,
  flow: 202,
  comingSoon: 120,
} as const;
export const TRANSITION = 16;
export const TOTAL_FRAMES =
  SCENES.intro + SCENES.concert + SCENES.flow + SCENES.comingSoon -
  TRANSITION * 3;

export const Tickketo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink, fontFamily: `"${TICKKETO_FONT}", ${FONT_STACK}` }}>
      <Audio src={staticFile("audio/soundtrack.wav")} />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENES.intro}>
          <Scene01Intro />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION })}
        />

        <TransitionSeries.Sequence durationInFrames={SCENES.concert}>
          <Scene02Concert />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION })}
        />

        <TransitionSeries.Sequence durationInFrames={SCENES.flow}>
          <Scene03Flow />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-bottom" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION })}
        />

        <TransitionSeries.Sequence durationInFrames={SCENES.comingSoon}>
          <Scene04ComingSoon />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
