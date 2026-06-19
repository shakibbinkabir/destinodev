import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS } from "../theme";

/** Dark hero backdrop: faint grid + a breathing crimson radial glow. */
export const InkBackground: React.FC<{ glow?: boolean }> = ({ glow = true }) => {
  const frame = useCurrentFrame();
  const pulse = interpolate(Math.sin(frame / 26), [-1, 1], [0.85, 1.12]);
  const opacity = interpolate(Math.sin(frame / 26), [-1, 1], [0.55, 0.9]);
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)",
          backgroundSize: "90px 90px",
          maskImage:
            "radial-gradient(ellipse 75% 60% at 50% 42%, #000 30%, transparent 82%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 75% 60% at 50% 42%, #000 30%, transparent 82%)",
        }}
      />
      {glow ? (
        <div
          style={{
            position: "absolute",
            width: 1100,
            height: 1100,
            top: "-12%",
            right: "-22%",
            opacity,
            transform: `scale(${pulse})`,
            background: `radial-gradient(circle, rgba(194,0,50,.36), transparent 62%)`,
            filter: "blur(20px)",
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

/** A bobbing/rotating decorative shape — stars, rings, ticket, squiggle. */
type ShapeKind = "star" | "ring" | "blob" | "wave" | "ticket";

export const FloatShape: React.FC<{
  kind: ShapeKind;
  x: number | string;
  y: number | string;
  size: number;
  delay?: number;
  spin?: boolean;
}> = ({ kind, x, y, size, delay = 0, spin = false }) => {
  const frame = useCurrentFrame();
  const t = frame + delay;
  const bob = Math.sin(t / 22) * 22;
  const rot = spin ? (t * 0.7) % 360 : Math.sin(t / 22) * 8;
  const enter = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        transform: `translateY(${bob}px) rotate(${rot}deg) scale(${enter})`,
        opacity: enter,
      }}
    >
      {kind === "star" && (
        <svg viewBox="0 0 100 100">
          <path
            d="M50 2l12 30 32 2-25 21 9 31-28-18-28 18 9-31-25-21 32-2z"
            fill={COLORS.crimson}
          />
        </svg>
      )}
      {kind === "ring" && (
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="none" stroke="#FFFFFF" strokeWidth="4" />
          <circle cx="50" cy="50" r="10" fill="#FFFFFF" />
        </svg>
      )}
      {kind === "blob" && (
        <svg viewBox="0 0 100 100">
          <path
            d="M50 4C28 4 14 26 26 44c10 15-2 30-14 30 18 8 40-2 40-24 0-14 12-18 22-10C82 22 70 4 50 4z"
            fill={COLORS.crimson2}
          />
        </svg>
      )}
      {kind === "wave" && (
        <svg viewBox="0 0 120 60">
          <path
            d="M5 30c20-26 40 26 55 0s30-26 55 0"
            fill="none"
            stroke={COLORS.crimson}
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>
      )}
      {kind === "ticket" && (
        <svg viewBox="0 0 100 100">
          <rect x="18" y="30" width="64" height="40" rx="8" fill="none" stroke="#FFFFFF" strokeWidth="5" />
          <line x1="50" y1="30" x2="50" y2="70" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="4 5" />
        </svg>
      )}
    </div>
  );
};
