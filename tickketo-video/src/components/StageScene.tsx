import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";
import { rng, range } from "./util";
import { FloatingNotes } from "./Confetti";

/* ---------- a single cartoon concert-goer silhouette ---------- */
const Person: React.FC<{
  x: number;
  groundY: number;
  scale: number;
  phase: number;
  arms?: "up" | "wave" | "down";
  holds?: "phone" | "ticket" | "none";
  tint?: string;
}> = ({ x, groundY, scale, phase, arms = "down", holds = "none", tint = "#070708" }) => {
  const frame = useCurrentFrame();
  const bob = Math.sin((frame + phase) / 9) * 7 * scale;
  const waveRot = arms === "wave" ? Math.sin((frame + phase) / 6) * 18 : 0;

  const headR = 26 * scale;
  const bodyW = 52 * scale;
  const bodyH = 88 * scale;
  const armW = 13 * scale;
  const armH = 60 * scale;

  const ArmUp = arms === "up" || arms === "wave";

  return (
    <div style={{ position: "absolute", left: x, top: groundY - bob, transform: "translate(-50%, -100%)" }}>
      <div style={{ position: "relative", width: bodyW, height: bodyH + headR * 2 }}>
        {/* glowing phone / ticket held up */}
        {holds === "phone" && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: -22 * scale,
              width: 22 * scale,
              height: 40 * scale,
              marginLeft: -11 * scale,
              borderRadius: 5 * scale,
              background: "linear-gradient(180deg,#FFE7EE,#FF7CA0)",
              boxShadow: `0 0 ${22 * scale}px rgba(255,124,160,.9)`,
            }}
          />
        )}
        {holds === "ticket" && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: -18 * scale,
              width: 40 * scale,
              height: 22 * scale,
              marginLeft: -20 * scale,
              borderRadius: 5 * scale,
              background: COLORS.crimson,
              boxShadow: `0 0 ${18 * scale}px rgba(194,0,50,.8)`,
            }}
          />
        )}
        {/* arms */}
        <div
          style={{
            position: "absolute",
            left: 2 * scale,
            top: headR * 2 + 6 * scale,
            width: armW,
            height: armH,
            background: tint,
            borderRadius: armW,
            transformOrigin: "top center",
            transform: `rotate(${ArmUp ? -150 - waveRot : -16}deg)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 2 * scale,
            top: headR * 2 + 6 * scale,
            width: armW,
            height: armH,
            background: tint,
            borderRadius: armW,
            transformOrigin: "top center",
            transform: `rotate(${ArmUp ? 150 + waveRot : 16}deg)`,
          }}
        />
        {/* body */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: headR * 1.5,
            width: bodyW,
            height: bodyH,
            marginLeft: -bodyW / 2,
            background: tint,
            borderRadius: `${bodyW / 2}px ${bodyW / 2}px ${18 * scale}px ${18 * scale}px`,
          }}
        />
        {/* head */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            width: headR * 2,
            height: headR * 2,
            marginLeft: -headR,
            background: tint,
            borderRadius: "50%",
          }}
        />
      </div>
    </div>
  );
};

/* ---------- dancing equalizer ---------- */
const Equalizer: React.FC<{ x: number; y: number; w: number; bars?: number }> = ({ x, y, w, bars = 13 }) => {
  const frame = useCurrentFrame();
  const bw = w / bars;
  return (
    <div style={{ position: "absolute", left: x, top: y, display: "flex", gap: bw * 0.35, alignItems: "flex-end" }}>
      {range(bars).map((i) => {
        const h = 30 + (Math.sin((frame + i * 13) / 5) * 0.5 + 0.5) * 150;
        const c = i % 2 === 0 ? COLORS.crimson : COLORS.crimson2;
        return (
          <div
            key={i}
            style={{ width: bw * 0.65, height: h, background: c, borderRadius: bw * 0.3, opacity: 0.9 }}
          />
        );
      })}
    </div>
  );
};

/* ---------- sweeping spotlight beams ---------- */
const Spotlights: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const beams = [
    { px: width * 0.2, base: 18, swing: 16, speed: 41, hue: COLORS.crimson },
    { px: width * 0.5, base: 0, swing: 12, speed: 33, hue: COLORS.pink },
    { px: width * 0.8, base: -18, swing: 16, speed: 47, hue: COLORS.crimson2 },
  ];
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
      <defs>
        {beams.map((b, i) => (
          <linearGradient key={i} id={`beam${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={b.hue} stopOpacity="0.5" />
            <stop offset="1" stopColor={b.hue} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>
      {beams.map((b, i) => {
        const ang = (b.base + Math.sin(frame / b.speed) * b.swing) * (Math.PI / 180);
        const len = height * 0.95;
        const halfW = 90;
        const tipX = b.px + Math.sin(ang) * len;
        const tipY = len;
        const dx = Math.cos(ang) * halfW;
        const dy = Math.sin(ang) * halfW;
        return (
          <polygon
            key={i}
            points={`${b.px},6 ${tipX - dx},${tipY} ${tipX + dx},${tipY}`}
            fill={`url(#beam${i})`}
          />
        );
      })}
    </svg>
  );
};

/** The full illustrated live-music scene used as the hero centerpiece. */
export const StageScene: React.FC<{ intro?: number }> = ({ intro = 0 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const groundY = height * 0.9;
  const stageY = height * 0.52;

  // crowd built deterministically across the foreground
  const r = rng(42);
  const people = range(10).map((i) => {
    const t = i / 9;
    const x = 70 + t * (width - 140) + (r() - 0.5) * 36;
    const scale = 1.7 + r() * 0.7;
    const armRoll = r();
    const arms = armRoll > 0.6 ? "up" : armRoll > 0.35 ? "wave" : "down";
    const holdRoll = r();
    const holds = holdRoll > 0.78 ? "phone" : holdRoll > 0.62 ? "ticket" : "none";
    return { x, scale, arms: arms as "up" | "wave" | "down", holds: holds as "phone" | "ticket" | "none", phase: i * 14 };
  });

  const riseIn = interpolate(frame, [intro, intro + 24], [80, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeIn = interpolate(frame, [intro, intro + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink, overflow: "hidden" }}>
      {/* deep stage glow */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: stageY - height * 0.18,
          width: width * 1.4,
          height: height * 0.8,
          marginLeft: -width * 0.7,
          background: `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(194,0,50,.5), rgba(194,0,50,.12) 45%, transparent 70%)`,
          filter: "blur(8px)",
        }}
      />

      <Spotlights width={width} height={height} />
      <FloatingNotes width={width} height={height * 0.7} count={14} />

      {/* equalizer behind the stage */}
      <div style={{ opacity: fadeIn }}>
        <Equalizer x={width * 0.12} y={stageY - 60} w={width * 0.76} bars={15} />
      </div>

      {/* performer on a riser */}
      <div style={{ transform: `translateY(${riseIn}px)`, opacity: fadeIn }}>
        {/* bright spotlight pool behind the performer so they read as a silhouette */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: stageY - 230,
            width: 360,
            height: 360,
            marginLeft: -180,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,180,200,.85), rgba(229,67,106,.35) 45%, transparent 70%)",
            filter: "blur(6px)",
          }}
        />
        <Person x={width * 0.5} groundY={stageY + 78} scale={2.5} phase={0} arms="up" tint="#0b0b0d" />
        {/* mic stand */}
        <div
          style={{
            position: "absolute",
            left: width * 0.5 + 92,
            top: stageY - 96,
            width: 6,
            height: 180,
            background: "#1c1c20",
            borderRadius: 4,
          }}
        />
      </div>

      {/* stage platform */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: stageY + 72,
          height: 26,
          background: "linear-gradient(180deg,#202024,#0b0b0d)",
          boxShadow: "0 -2px 24px rgba(194,0,50,.4)",
        }}
      />

      {/* foreground crowd */}
      <div style={{ transform: `translateY(${riseIn * 1.3}px)`, opacity: fadeIn }}>
        {people.map((p, i) => (
          <Person key={i} x={p.x} groundY={groundY + p.scale * 8} scale={p.scale} phase={p.phase} arms={p.arms} holds={p.holds} />
        ))}
      </div>

      {/* foreground floor shadow */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: height * 0.16,
          background: `linear-gradient(180deg, transparent, ${COLORS.ink})`,
        }}
      />
    </AbsoluteFill>
  );
};
