import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { InkBackground, FloatShape } from "../components/Background";
import { COLORS } from "../theme";

/** Hero headline: "THE best / SEATS — ONE / TAP AWAY." with the italic accent. */
const Line: React.FC<{
  children: React.ReactNode;
  delay: number;
  frame: number;
}> = ({ children, delay, frame }) => {
  const y = interpolate(frame, [delay, delay + 18], [115, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ overflow: "hidden" }}>
      <div style={{ transform: `translateY(${y}%)` }}>{children}</div>
    </div>
  );
};

const Em: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ fontStyle: "italic", fontWeight: 500, color: COLORS.crimson, textTransform: "lowercase" }}>
    {children}
  </span>
);

export const Scene02Tagline: React.FC = () => {
  const frame = useCurrentFrame();
  const leadOpacity = interpolate(frame, [46, 62], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const leadY = interpolate(frame, [46, 62], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const h1: React.CSSProperties = {
    fontSize: 132,
    fontWeight: 800,
    lineHeight: 0.92,
    letterSpacing: "-0.01em",
    textTransform: "uppercase",
    color: COLORS.bone,
    whiteSpace: "nowrap",
  };

  return (
    <AbsoluteFill>
      <InkBackground />
      <FloatShape kind="star" x="74%" y="12%" size={110} />
      <FloatShape kind="ring" x="12%" y="16%" size={92} delay={10} />
      <FloatShape kind="wave" x="68%" y="80%" size={150} delay={6} />
      <FloatShape kind="blob" x="10%" y="74%" size={104} delay={3} spin />

      <AbsoluteFill
        style={{
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
        }}
      >
        <div style={h1}>
          <Line delay={2} frame={frame}>
            <span>
              THE <Em>best</Em>
            </span>
          </Line>
          <Line delay={12} frame={frame}>
            <span>SEATS — ONE</span>
          </Line>
          <Line delay={22} frame={frame}>
            <span>TAP AWAY.</span>
          </Line>
        </div>

        <p
          style={{
            marginTop: 48,
            maxWidth: 720,
            fontSize: 30,
            lineHeight: 1.45,
            color: "#C7C7CC",
            opacity: leadOpacity,
            transform: `translateY(${leadY}px)`,
          }}
        >
          Swipe a feed built around your taste, grab the seat you want, and walk
          in with a live QR ticket.
        </p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
