import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { InkBackground } from "../components/Background";
import { TicketCard } from "../components/TicketCard";
import { COLORS, gradientText } from "../theme";

const BEAT = 42;

/** Big "Word it." headline shared by every beat. */
const BeatTitle: React.FC<{ word: string; n: string }> = ({ word, n }) => {
  const frame = useCurrentFrame();
  const y = interpolate(frame, [0, 14], [110, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const num = interpolate(frame, [2, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          fontSize: 26,
          letterSpacing: ".2em",
          color: COLORS.crimson,
          fontWeight: 700,
          marginBottom: 14,
          opacity: num,
        }}
      >
        {n} / 04
      </div>
      <div style={{ overflow: "hidden" }}>
        <div
          style={{
            transform: `translateY(${y}%)`,
            fontSize: 150,
            fontWeight: 800,
            lineHeight: 0.9,
            textTransform: "uppercase",
            color: COLORS.bone,
          }}
        >
          {word}{" "}
          <span style={{ fontStyle: "italic", fontWeight: 500, color: COLORS.crimson, textTransform: "lowercase" }}>
            it.
          </span>
        </div>
      </div>
    </div>
  );
};

/** Wraps a beat with a clean fade/scale in-out so cuts feel intentional. */
const Beat: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 8, BEAT - 8, BEAT], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(frame, [0, 10], [0.96, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 60,
        padding: "0 80px",
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/* ---------- Beat 1: SWIPE ---------- */
const SwipeVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fly = spring({ frame: frame - 14, fps, config: { damping: 16 } });
  const x = interpolate(fly, [0, 1], [0, 520]);
  const rot = interpolate(fly, [0, 1], [0, 18]);
  const stamp = interpolate(frame, [16, 24], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  return (
    <div style={{ position: "relative", width: 520, height: 640 }}>
      <Card poster="linear-gradient(135deg,#2A0A1A,#0E0E0E)" mark="ECHOES" cat="Music" sub="ICCB Hall 4 · Dhaka" price="৳1,800" offset={26} dim />
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${x}px) rotate(${rot}deg)` }}>
        <Card poster="linear-gradient(135deg,#C20032,#3A0010)" mark="MIDNIGHT" cat="Music" sub="Warehouse 9 · Dhaka" price="৳1,200" />
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 36,
            transform: "rotate(13deg)",
            opacity: stamp,
            color: COLORS.crimson,
            border: `5px solid ${COLORS.crimson}`,
            borderRadius: 16,
            padding: "8px 24px",
            fontSize: 44,
            fontWeight: 800,
            letterSpacing: ".05em",
          }}
        >
          SAVE
        </div>
      </div>
    </div>
  );
};

const Card: React.FC<{
  poster: string;
  mark: string;
  cat: string;
  sub: string;
  price: string;
  offset?: number;
  dim?: boolean;
}> = ({ poster, mark, cat, sub, price, offset = 0, dim = false }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      transform: `translateY(${offset}px) scale(${dim ? 0.94 : 1})`,
      borderRadius: 28,
      overflow: "hidden",
      background: COLORS.ink2,
      border: "1px solid rgba(255,255,255,.1)",
      boxShadow: "0 40px 80px -34px rgba(0,0,0,.8)",
      filter: dim ? "brightness(.6)" : "none",
    }}
  >
    <div style={{ height: "62%", background: poster, position: "relative" }}>
      <span
        style={{
          position: "absolute",
          top: 22,
          left: 22,
          background: "rgba(0,0,0,.5)",
          border: "1px solid rgba(255,255,255,.18)",
          borderRadius: 100,
          padding: "8px 18px",
          fontSize: 18,
          letterSpacing: ".12em",
          textTransform: "uppercase",
          fontWeight: 700,
          color: "#fff",
        }}
      >
        {cat}
      </span>
      <div
        style={{
          position: "absolute",
          bottom: 22,
          left: 26,
          fontSize: 56,
          fontWeight: 800,
          lineHeight: 0.9,
          textTransform: "uppercase",
          color: "rgba(255,255,255,.95)",
        }}
      >
        {mark}
      </div>
    </div>
    <div style={{ padding: 28 }}>
      <div style={{ fontSize: 24, color: COLORS.mute }}>{sub}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18 }}>
        <span style={{ fontSize: 30, color: COLORS.crimson, fontWeight: 700 }}>{price}</span>
        <span
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: COLORS.bone,
            border: "1px solid rgba(255,255,255,.22)",
            borderRadius: 100,
            padding: "10px 20px",
          }}
        >
          Get tickets →
        </span>
      </div>
    </div>
  </div>
);

/* ---------- Beat 2: BOOK ---------- */
const BookVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const tiers = [
    { name: "General", price: "৳1,200", sel: false },
    { name: "VIP Floor", price: "৳3,600", sel: true },
    { name: "Box seats", price: "৳5,000", sel: false },
  ];
  return (
    <div style={{ width: 640, display: "flex", flexDirection: "column", gap: 22 }}>
      {tiers.map((t, i) => {
        const appear = interpolate(frame, [6 + i * 6, 18 + i * 6], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const ring = t.sel
          ? interpolate(frame, [22, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
          : 0;
        return (
          <div
            key={t.name}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderRadius: 22,
              padding: "30px 34px",
              border: `2px solid ${t.sel ? `rgba(194,0,50,${0.3 + ring * 0.7})` : "rgba(255,255,255,.16)"}`,
              background: t.sel ? `rgba(194,0,50,${0.06 + ring * 0.1})` : "transparent",
              opacity: appear,
              transform: `translateX(${interpolate(appear, [0, 1], [40, 0])}px)`,
            }}
          >
            <b style={{ fontSize: 34, color: COLORS.bone, fontWeight: 700 }}>{t.name}</b>
            <span style={{ fontSize: 36, color: COLORS.crimson, fontWeight: 800 }}>{t.price}</span>
          </div>
        );
      })}
    </div>
  );
};

/* ---------- Beat 3: HOLD ---------- */
const HoldVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 14 } });
  // QR "refreshes" once mid-beat to sell the live-ticket idea
  const shift = frame > 24 ? 1 : 0;
  return (
    <div style={{ transform: `scale(${interpolate(pop, [0, 1], [0.8, 1])})` }}>
      <TicketCard width={620} qrShift={shift} />
    </div>
  );
};

/* ---------- Beat 4: LIVE ---------- */
const LiveVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - 4, fps, config: { damping: 12 } });
  const ringScale = interpolate(frame, [4, 26], [0.2, 1.6], { extrapolateRight: "clamp" });
  const ringOpacity = interpolate(frame, [4, 26], [0.7, 0], { extrapolateRight: "clamp" });
  const check = interpolate(frame, [12, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
      <div style={{ position: "relative", width: 220, height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `4px solid ${COLORS.crimson}`,
            transform: `scale(${ringScale})`,
            opacity: ringOpacity,
          }}
        />
        <div
          style={{
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: COLORS.crimson,
            transform: `scale(${pop})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" strokeDasharray={28} strokeDashoffset={28 * (1 - check)} />
          </svg>
        </div>
      </div>
      <div style={{ fontSize: 140, fontWeight: 800, lineHeight: 0.86, textTransform: "uppercase", textAlign: "center", ...gradientText() }}>
        You're
        <br />
        in.
      </div>
    </div>
  );
};

export const Scene03Flow: React.FC = () => {
  return (
    <AbsoluteFill>
      <InkBackground />
      <Sequence durationInFrames={BEAT}>
        <Beat>
          <BeatTitle word="Swipe" n="01" />
          <SwipeVisual />
        </Beat>
      </Sequence>
      <Sequence from={BEAT} durationInFrames={BEAT}>
        <Beat>
          <BeatTitle word="Book" n="02" />
          <BookVisual />
        </Beat>
      </Sequence>
      <Sequence from={BEAT * 2} durationInFrames={BEAT}>
        <Beat>
          <BeatTitle word="Hold" n="03" />
          <HoldVisual />
        </Beat>
      </Sequence>
      <Sequence from={BEAT * 3} durationInFrames={BEAT}>
        <Beat>
          <BeatTitle word="Live" n="04" />
          <LiveVisual />
        </Beat>
      </Sequence>
    </AbsoluteFill>
  );
};
