import React from "react";
import { useCurrentFrame } from "remotion";
import { COLORS } from "../theme";
import { rng, range } from "./util";

const PIECE_COLORS = [COLORS.crimson, COLORS.crimson2, COLORS.pink, COLORS.bone, "#FFC4D4"];

/**
 * A confetti BURST that fires once from an origin point and arcs outward with
 * gravity. Deterministic per `seed`. Used on celebratory beats.
 */
export const ConfettiBurst: React.FC<{
  start: number; // frame the burst begins
  count?: number;
  originX?: number; // 0..1 of width
  originY?: number; // 0..1 of height
  spread?: number;
  power?: number;
  width: number;
  height: number;
}> = ({ start, count = 38, originX = 0.5, originY = 0.45, spread = 1, power = 1, width, height }) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  if (t < 0) return null;
  const r = rng(99);
  return (
    <>
      {range(count).map((i) => {
        const ang = (r() - 0.5) * Math.PI * 1.2 * spread - Math.PI / 2;
        const speed = (8 + r() * 16) * power;
        const vx = Math.cos(ang) * speed;
        const vy = Math.sin(ang) * speed - 6 * power;
        const g = 0.55;
        const x = originX * width + vx * t;
        const y = originY * height + (vy * t + 0.5 * g * t * t);
        const rot = (r() * 360 + t * (4 + r() * 8)) % 360;
        const life = 1 - Math.min(1, t / (52 + r() * 26));
        const isRect = r() > 0.45;
        const c = PIECE_COLORS[Math.floor(r() * PIECE_COLORS.length)];
        const sz = 10 + r() * 14;
        if (life <= 0) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: isRect ? sz : sz * 0.9,
              height: isRect ? sz * 0.5 : sz * 0.9,
              borderRadius: isRect ? 2 : "50%",
              background: c,
              transform: `rotate(${rot}deg)`,
              opacity: life,
            }}
          />
        );
      })}
    </>
  );
};

/** Gentle ambient confetti / sparkles drifting upward (for the concert scene). */
export const FloatingNotes: React.FC<{ width: number; height: number; count?: number }> = ({
  width,
  height,
  count = 16,
}) => {
  const frame = useCurrentFrame();
  const r = rng(7);
  return (
    <>
      {range(count).map((i) => {
        const baseX = r() * width;
        const baseY = r() * height;
        const speed = 0.6 + r() * 1.2;
        const sway = Math.sin((frame + i * 30) / 26) * 22;
        const y = (baseY - frame * speed + height * 2) % (height + 200) - 100;
        const kind = Math.floor(r() * 3);
        const c = [COLORS.crimson, COLORS.pink, COLORS.bone][kind];
        const op = 0.35 + r() * 0.4;
        const size = 18 + r() * 16;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: baseX + sway,
              top: y,
              opacity: op,
              transform: `rotate(${Math.sin((frame + i) / 20) * 18}deg)`,
            }}
          >
            {kind === 0 ? (
              <MusicNote size={size} color={c} />
            ) : kind === 1 ? (
              <Spark size={size} color={c} />
            ) : (
              <div style={{ width: size * 0.5, height: size * 0.5, borderRadius: "50%", background: c }} />
            )}
          </div>
        );
      })}
    </>
  );
};

export const MusicNote: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M9 17V5l10-2v12" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
    <circle cx="6.5" cy="17.5" r="3" />
    <circle cx="16.5" cy="15.5" r="3" />
  </svg>
);

export const Spark: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 0l2.4 8.2L22 11l-7.6 2.8L12 24l-2.4-10.2L2 11l7.6-2.8z" />
  </svg>
);
