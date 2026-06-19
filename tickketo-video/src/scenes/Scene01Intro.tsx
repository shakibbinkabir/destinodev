import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { InkBackground, FloatShape } from "../components/Background";
import { LogoMark } from "../components/Brand";
import { ConfettiBurst } from "../components/Confetti";
import { COLORS, gradientText } from "../theme";

export const Scene01Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // bouncy overshoot pop for the logo mark
  const pop = spring({ frame, fps, config: { damping: 9, mass: 0.9, stiffness: 120 } });
  const markScale = interpolate(pop, [0, 1], [0.2, 1]);
  const wobble = Math.sin(frame / 7) * interpolate(frame, [10, 40], [3, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const draw = interpolate(frame, [10, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const wordPop = spring({ frame: frame - 16, fps, config: { damping: 11, mass: 0.8 } });
  const wordScale = interpolate(wordPop, [0, 1], [0.6, 1]);

  const metaOpacity = interpolate(frame, [40, 52, 66, 78], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <InkBackground />

      {/* playful orbiting shapes */}
      <FloatShape kind="star" x="22%" y="24%" size={70} delay={6} />
      <FloatShape kind="ring" x="76%" y="30%" size={64} delay={2} />
      <FloatShape kind="blob" x="74%" y="68%" size={78} delay={10} spin />
      <FloatShape kind="ticket" x="20%" y="70%" size={84} delay={4} />

      <ConfettiBurst start={14} count={46} originX={0.5} originY={0.42} power={1.15} width={width} height={height} />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 44 }}>
        <div style={{ transform: `scale(${markScale}) rotate(${wobble}deg)` }}>
          <LogoMark width={300} gradientId="intro" drawProgress={draw} />
        </div>

        <div
          style={{
            transform: `scale(${wordScale})`,
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
            opacity: metaOpacity,
            color: COLORS.mute,
            fontSize: 22,
            letterSpacing: ".34em",
            textTransform: "uppercase",
          }}
        >
          Something fun is coming
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
