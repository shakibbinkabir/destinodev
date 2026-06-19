import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { LogoMark } from "../components/Brand";
import { COLORS } from "../theme";

/** Crimson closing card — mirrors the site's big "GET TICKETS" CTA. */
export const Scene05CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const line1 = interpolate(frame, [4, 20], [120, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const line2 = interpolate(frame, [12, 28], [120, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const pill = spring({ frame: frame - 26, fps, config: { damping: 14 } });
  const arr = interpolate(frame, [40, 70], [0, 18], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const logo = interpolate(frame, [30, 44], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tagline = interpolate(frame, [44, 58], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(150deg, ${COLORS.crimson} 0%, ${COLORS.ember} 62%, #5C0018 100%)`,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      {/* faint oversized background word */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 520,
          fontWeight: 800,
          color: "#000",
          opacity: 0.08,
          letterSpacing: "-0.04em",
          transform: "rotate(-8deg)",
        }}
      >
        ✦
      </div>

      <div style={{ textAlign: "center", color: "#000", zIndex: 2 }}>
        <div style={{ fontSize: 180, fontWeight: 800, lineHeight: 0.82, textTransform: "uppercase" }}>
          <div style={{ overflow: "hidden" }}>
            <div style={{ transform: `translateY(${line1}%)` }}>Get</div>
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ transform: `translateY(${line2}%)` }}>tickets</div>
          </div>
        </div>

        <div
          style={{
            marginTop: 56,
            display: "inline-flex",
            alignItems: "center",
            gap: 18,
            background: "#000",
            color: COLORS.crimson,
            fontSize: 38,
            fontWeight: 700,
            padding: "26px 50px",
            borderRadius: 100,
            transform: `scale(${interpolate(pill, [0, 1], [0.6, 1])})`,
            opacity: pill,
          }}
        >
          Browse all events
          <span style={{ transform: `translate(${arr}px, ${-arr}px)`, display: "inline-block" }}>↗</span>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 120,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
          zIndex: 2,
        }}
      >
        <div style={{ opacity: logo, transform: `translateY(${interpolate(logo, [0, 1], [20, 0])}px)` }}>
          <LogoMark width={230} gradientId="cta" />
        </div>
        <div style={{ opacity: tagline, color: "rgba(0,0,0,.72)", fontSize: 26, fontWeight: 600, letterSpacing: ".02em" }}>
          Find it, book it, live it.
        </div>
      </div>
    </AbsoluteFill>
  );
};
