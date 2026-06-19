import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { InkBackground } from "../components/Background";
import { COLORS } from "../theme";

/** Compact formatter so 2,400,000 reads as "2.4M". */
const formatCompact = (n: number, decimals = 0) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + "M";
  if (n >= 1_000) return Math.round(n / 1000) + "K";
  return n.toFixed(decimals);
};

const Stat: React.FC<{
  to: number;
  label: string;
  suffix?: string;
  compact?: boolean;
  decimals?: number;
  delay: number;
}> = ({ to, label, suffix = "", compact = false, decimals = 0, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inSpring = spring({ frame: frame - delay, fps, config: { damping: 16, mass: 0.7 } });
  const progress = interpolate(frame, [delay, delay + 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const value = to * progress;
  const display = compact ? formatCompact(value, decimals) : value.toFixed(decimals);

  return (
    <div
      style={{
        textAlign: "center",
        opacity: inSpring,
        transform: `translateY(${interpolate(inSpring, [0, 1], [40, 0])}px)`,
      }}
    >
      <div
        style={{
          fontSize: 130,
          fontWeight: 800,
          lineHeight: 1,
          color: COLORS.crimson,
          letterSpacing: "-0.01em",
        }}
      >
        {display}
        {suffix}
      </div>
      <div
        style={{
          fontSize: 28,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          color: COLORS.mute,
          marginTop: 14,
        }}
      >
        {label}
      </div>
    </div>
  );
};

export const Scene04Stats: React.FC = () => {
  const frame = useCurrentFrame();
  const headY = interpolate(frame, [0, 16], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const headOpacity = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <InkBackground />
      <AbsoluteFill style={{ flexDirection: "column", justifyContent: "center", padding: "0 96px", gap: 70 }}>
        <div style={{ opacity: headOpacity, transform: `translateY(${headY}px)` }}>
          <div style={{ fontSize: 26, letterSpacing: ".24em", color: COLORS.crimson, fontWeight: 700, textTransform: "uppercase" }}>
            The front row, everywhere
          </div>
          <div style={{ fontSize: 86, fontWeight: 800, lineHeight: 0.95, textTransform: "uppercase", color: COLORS.bone, marginTop: 18 }}>
            Built for
            <br />
            sold-out nights
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 64, columnGap: 40 }}>
          <Stat to={2_400_000} compact suffix="+" label="Tickets delivered" delay={4} />
          <Stat to={180} suffix="+" label="Partner venues" delay={12} />
          <Stat to={32} label="Cities live" delay={20} />
          <Stat to={4.9} decimals={1} suffix="★" label="Average rating" delay={28} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
