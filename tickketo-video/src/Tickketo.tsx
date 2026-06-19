import React from "react";
import { AbsoluteFill } from "remotion";
import {
  TransitionSeries,
  linearTiming,
  springTiming,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";

import { COLORS, FONT_STACK } from "./theme";
import { TICKKETO_FONT } from "./loadFonts";
import { Scene01Intro } from "./scenes/Scene01Intro";
import { Scene02Tagline } from "./scenes/Scene02Tagline";
import { Scene03Flow } from "./scenes/Scene03Flow";
import { Scene04Stats } from "./scenes/Scene04Stats";
import { Scene05CTA } from "./scenes/Scene05CTA";

// Scene lengths (frames @30fps). Net duration = sum - sum(transitions=14*4).
export const SCENES = {
  intro: 78,
  tagline: 84,
  flow: 168,
  stats: 96,
  cta: 80,
} as const;
export const TRANSITION = 14;
export const TOTAL_FRAMES =
  SCENES.intro + SCENES.tagline + SCENES.flow + SCENES.stats + SCENES.cta -
  TRANSITION * 4; // = 450

export const Tickketo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink, fontFamily: `"${TICKKETO_FONT}", ${FONT_STACK}` }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENES.intro}>
          <Scene01Intro />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION })}
        />

        <TransitionSeries.Sequence durationInFrames={SCENES.tagline}>
          <Scene02Tagline />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-bottom" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION })}
        />

        <TransitionSeries.Sequence durationInFrames={SCENES.flow}>
          <Scene03Flow />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION })}
        />

        <TransitionSeries.Sequence durationInFrames={SCENES.stats}>
          <Scene04Stats />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-bottom" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION })}
        />

        <TransitionSeries.Sequence durationInFrames={SCENES.cta}>
          <Scene05CTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
