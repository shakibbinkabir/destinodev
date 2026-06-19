import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { InkBackground } from "../components/Background";
import { LogoMark } from "../components/Brand";
import { COLORS, gradientText } from "../theme";

export const Scene01Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({ frame, fps, config: { damping: 13, mass: 0.8 } });
  const markScale = interpolate(pop, [0, 1], [0.4, 1]);
  const draw = interpolate(frame, [8, 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const wordY = interpolate(frame, [16, 40], [120, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const wordClip = interpolate(frame, [16, 42], [100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const metaOpacity = interpolate(frame, [44, 56, 70, 78], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // light sweep across the wordmark
  const sweep = interpolate(frame, [40, 66], [-120, 220], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <InkBackground />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 40,
        }}
      >
        <div style={{ transform: `scale(${markScale})` }}>
          <LogoMark width={300} gradientId="intro" drawProgress={draw} />
        </div>

        <div style={{ overflow: "hidden", height: 150 }}>
          <div
            style={{
              position: "relative",
              transform: `translateY(${wordY}px)`,
              clipPath: `inset(0 0 ${wordClip}% 0)`,
            }}
          >
            <div
              style={{
                fontSize: 124,
                fontWeight: 800,
                letterSpacing: "-0.01em",
                lineHeight: 1,
                ...gradientText(),
              }}
            >
              Tickketo
            </div>
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(115deg, transparent 35%, rgba(255,255,255,.55) 50%, transparent 65%)",
                transform: `translateX(${sweep}%)`,
                mixBlendMode: "overlay",
              }}
            />
          </div>
        </div>

        <div
          style={{
            opacity: metaOpacity,
            color: COLORS.mute,
            fontSize: 22,
            letterSpacing: ".34em",
            textTransform: "uppercase",
          }}
        >
          Doors opening…
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
