import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { StageScene } from "../components/StageScene";
import { COLORS } from "../theme";

const Line: React.FC<{ children: React.ReactNode; delay: number; frame: number }> = ({ children, delay, frame }) => {
  const y = interpolate(frame, [delay, delay + 16], [120, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const o = interpolate(frame, [delay, delay + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ overflow: "hidden" }}>
      <div style={{ transform: `translateY(${y}%)`, opacity: o }}>{children}</div>
    </div>
  );
};

const Em: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ fontStyle: "italic", fontWeight: 500, color: COLORS.crimson, textTransform: "lowercase" }}>
    {children}
  </span>
);

/** Illustrated live-music hero with the tagline rising over the crowd. */
export const Scene02Concert: React.FC = () => {
  const frame = useCurrentFrame();

  const eyebrowO = interpolate(frame, [4, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const h1: React.CSSProperties = {
    fontSize: 118,
    fontWeight: 800,
    lineHeight: 0.94,
    letterSpacing: "-0.01em",
    textTransform: "uppercase",
    color: COLORS.bone,
    whiteSpace: "nowrap",
    textShadow: "0 8px 40px rgba(0,0,0,.55)",
  };

  return (
    <AbsoluteFill>
      <StageScene />

      {/* darkening so the type stays legible over the illustration */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(14,14,14,.55) 0%, rgba(14,14,14,.05) 30%, transparent 55%)",
        }}
      />

      <AbsoluteFill style={{ flexDirection: "column", justifyContent: "flex-start", padding: "150px 80px 0" }}>
        <div
          style={{
            opacity: eyebrowO,
            fontSize: 24,
            letterSpacing: ".24em",
            color: COLORS.crimson,
            fontWeight: 700,
            textTransform: "uppercase",
            marginBottom: 22,
          }}
        >
          Concerts · Sports · Theatre · Festivals
        </div>
        <div style={h1}>
          <Line delay={10} frame={frame}>
            <span>
              THE <Em>best</Em>
            </span>
          </Line>
          <Line delay={20} frame={frame}>
            <span>SEATS — ONE</span>
          </Line>
          <Line delay={30} frame={frame}>
            <span>TAP AWAY.</span>
          </Line>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
