import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { LogoMark } from "../components/Brand";
import { COLORS } from "../theme";

/**
 * Faithful recreation of the Tickketo website loading screen:
 * horizontal [logo mark] + white "Tickketo" wordmark, a crimson progress
 * line that fills, then "DOORS OPENING…". Pure black — no confetti/grid.
 * (See `.loader__logo` / `.loader__bar` / `.loader__meta` in the site CSS.)
 */
export const Scene01Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const ease = Easing.bezier(0.22, 1, 0.36, 1);

  // loader__logo fades + lifts in as one unit
  const logoOpacity = interpolate(frame, [2, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const logoY = interpolate(frame, [2, 20], [22, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

  // bar track appears with the logo; crimson fill sweeps 0 -> 100%
  const trackOpacity = interpolate(frame, [8, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fill = interpolate(frame, [12, 60], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

  const metaOpacity = interpolate(frame, [20, 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.ink,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 40,
      }}
    >
      {/* loader__logo: mark + white wordmark, side by side */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 26,
          opacity: logoOpacity,
          transform: `translateY(${logoY}px)`,
        }}
      >
        <LogoMark width={216} gradientId="loader" />
        <div
          style={{
            fontSize: 108,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: COLORS.bone,
            lineHeight: 1,
          }}
        >
          Tickketo
        </div>
      </div>

      {/* loader__bar */}
      <div
        style={{
          width: 620,
          height: 4,
          borderRadius: 3,
          background: "rgba(255,255,255,.16)",
          overflow: "hidden",
          opacity: trackOpacity,
        }}
      >
        <div style={{ width: `${fill}%`, height: "100%", background: COLORS.crimson }} />
      </div>

      {/* loader__meta */}
      <div
        style={{
          opacity: metaOpacity,
          fontSize: 22,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: COLORS.mute,
        }}
      >
        Doors opening…
      </div>
    </AbsoluteFill>
  );
};
