import React from "react";
import { Composition } from "remotion";
import { Tickketo, TOTAL_FRAMES } from "./Tickketo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Tickketo"
      component={Tickketo}
      durationInFrames={TOTAL_FRAMES}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
