import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { LogoMark } from "../components/Brand";
import { ConfettiBurst } from "../components/Confetti";
import { FloatShape } from "../components/Background";
import { COLORS } from "../theme";

const BouncyWord: React.FC<{ text: string; size: number; color: string; startDelay: number }> = ({ text, size, color, startDelay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      {text.split("").map((ch, i) => {
        const s = spring({ frame: frame - startDelay - i * 3, fps, config: { damping: 9, mass: 0.6, stiffness: 130 } });
        const y = interpolate(s, [0, 1], [90, 0]);
        const sc = interpolate(s, [0, 1], [0.4, 1]);
        return (
          <span key={i} style={{ display: "inline-block", fontSize: size, fontWeight: 800, color, textTransform: "uppercase", lineHeight: 0.9, transform: `translateY(${y}px) scale(${sc})`, letterSpacing: "-0.01em" }}>
            {ch}
          </span>
        );
      })}
    </div>
  );
};

/** Launch teaser — no metrics, just personality + a "be first in line" hook. */
export const Scene04ComingSoon: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const pill = spring({ frame: frame - 34, fps, config: { damping: 13 } });
  const logo = interpolate(frame, [44, 58], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tagline = interpolate(frame, [54, 68], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(155deg, ${COLORS.crimson} 0%, ${COLORS.ember} 60%, #4E0016 100%)`,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      {/* playful black vector shapes */}
      <FloatShape kind="ticket" x="12%" y="16%" size={110} delay={4} />
      <FloatShape kind="star" x="80%" y="20%" size={90} delay={8} spin />
      <FloatShape kind="ring" x="84%" y="74%" size={78} delay={2} />
      <FloatShape kind="wave" x="10%" y="78%" size={150} delay={6} />

      <ConfettiBurst start={6} count={50} originX={0.5} originY={0.4} power={1.2} spread={1.3} width={width} height={height} />

      <div style={{ zIndex: 2, textAlign: "center", color: "#000" }}>
        <BouncyWord text="Coming" size={150} color="#000" startDelay={4} />
        <BouncyWord text="Soon" size={150} color={COLORS.bone} startDelay={16} />

        <div
          style={{
            marginTop: 56,
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            background: "#000",
            color: COLORS.bone,
            fontSize: 32,
            fontWeight: 700,
            padding: "22px 44px",
            borderRadius: 100,
            transform: `scale(${interpolate(pill, [0, 1], [0.5, 1])})`,
            opacity: pill,
          }}
        >
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: COLORS.crimson, boxShadow: `0 0 14px ${COLORS.crimson}` }} />
          Be first in line
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 130, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, zIndex: 2 }}>
        <div style={{ opacity: logo, transform: `translateY(${interpolate(logo, [0, 1], [20, 0])}px)` }}>
          <LogoMark width={240} gradientId="cs" />
        </div>
        <div style={{ opacity: tagline, color: "rgba(0,0,0,.78)", fontSize: 28, fontWeight: 700, letterSpacing: ".02em" }}>
          The best seats, one tap away.
        </div>
      </div>
    </AbsoluteFill>
  );
};
