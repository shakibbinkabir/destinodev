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
import { Phone } from "../components/Phone";
import { QrCode } from "../components/Brand";
import { ConfettiBurst } from "../components/Confetti";
import { COLORS } from "../theme";

const BEAT = 46;

const BeatTitle: React.FC<{ word: string; n: string }> = ({ word, n }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 11, mass: 0.7 } });
  return (
    <div style={{ textAlign: "center", transform: `translateY(${interpolate(pop, [0, 1], [40, 0])}px)`, opacity: pop }}>
      <div style={{ fontSize: 24, letterSpacing: ".2em", color: COLORS.crimson, fontWeight: 700, marginBottom: 8 }}>
        {n} / 04
      </div>
      <div style={{ fontSize: 116, fontWeight: 800, lineHeight: 0.9, textTransform: "uppercase", color: COLORS.bone }}>
        {word}{" "}
        <span style={{ fontStyle: "italic", fontWeight: 500, color: COLORS.crimson, textTransform: "lowercase" }}>
          it.
        </span>
      </div>
    </div>
  );
};

const Beat: React.FC<{ children: React.ReactNode; dur?: number }> = ({ children, dur = BEAT }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 7, dur - 7, dur], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 44, padding: "60px 0", opacity }}>
      {children}
    </AbsoluteFill>
  );
};

const Heart: React.FC<{ size: number; color?: string }> = ({ size, color = COLORS.crimson }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 21s-8-4.7-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 6.3-8 11-8 11z" />
  </svg>
);

/* ---------- Beat 1: SWIPE ---------- */
const PosterCard: React.FC<{ poster: string; mark: string; sub: string; price: string }> = ({ poster, mark, sub, price }) => (
  <div style={{ position: "absolute", inset: 0, borderRadius: 26, overflow: "hidden", background: COLORS.ink3, border: "1px solid rgba(255,255,255,.1)" }}>
    <div style={{ height: "64%", background: poster, position: "relative" }}>
      <span style={{ position: "absolute", top: 18, left: 18, background: "rgba(0,0,0,.5)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 100, padding: "6px 14px", fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: ".1em" }}>MUSIC</span>
      <div style={{ position: "absolute", bottom: 16, left: 20, fontSize: 46, fontWeight: 800, color: "#fff", textTransform: "uppercase", lineHeight: 0.9 }}>{mark}</div>
    </div>
    <div style={{ padding: 22 }}>
      <div style={{ fontSize: 20, color: COLORS.mute }}>{sub}</div>
      <div style={{ marginTop: 14, fontSize: 28, color: COLORS.crimson, fontWeight: 800 }}>{price}</div>
    </div>
  </div>
);

const SwipeScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fly = spring({ frame: frame - 16, fps, config: { damping: 16 } });
  const x = interpolate(fly, [0, 1], [0, 460]);
  const rot = interpolate(fly, [0, 1], [0, 20]);
  const heartPop = spring({ frame: frame - 18, fps, config: { damping: 9 } });
  const heartScale = interpolate(heartPop, [0, 1], [0, 1]);
  const heartFade = interpolate(frame, [18, 30, 40], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ position: "absolute", inset: 0, padding: "90px 36px 40px" }}>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <PosterCard poster="linear-gradient(135deg,#2A0A1A,#0E0E0E)" mark="ECHOES" sub="ICCB Hall 4 · Dhaka" price="৳1,800" />
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${x}px) rotate(${rot}deg)` }}>
          <PosterCard poster="linear-gradient(135deg,#C20032,#3A0010)" mark="MIDNIGHT" sub="Warehouse 9 · Dhaka" price="৳1,200" />
        </div>
        <div style={{ position: "absolute", left: "50%", top: "42%", transform: `translate(-50%,-50%) scale(${heartScale})`, opacity: heartFade }}>
          <Heart size={150} />
        </div>
      </div>
    </div>
  );
};

/* ---------- Beat 2: BOOK ---------- */
const BookScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const tiers = [
    { n: "General", p: "৳1,200" },
    { n: "VIP Floor", p: "৳3,600" },
    { n: "Box seats", p: "৳5,000" },
  ];
  const ripple = interpolate(frame, [18, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const payIn = interpolate(frame, [30, 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", inset: 0, padding: "120px 30px 40px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ fontSize: 22, color: COLORS.mute, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 6 }}>Choose tickets</div>
      {tiers.map((t, i) => {
        const sel = i === 1;
        const appear = interpolate(frame, [4 + i * 5, 16 + i * 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={t.n} style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: 18, padding: "24px 26px", border: `2px solid ${sel ? `rgba(194,0,50,${0.3 + ripple * 0.7})` : "rgba(255,255,255,.14)"}`, background: sel ? `rgba(194,0,50,${0.05 + ripple * 0.12})` : "transparent", opacity: appear, overflow: "hidden" }}>
            {sel && (
              <div style={{ position: "absolute", left: "50%", top: "50%", width: 30, height: 30, marginLeft: -15, marginTop: -15, borderRadius: "50%", border: `3px solid ${COLORS.crimson}`, transform: `scale(${interpolate(ripple, [0, 1], [0.2, 9])})`, opacity: interpolate(ripple, [0, 1], [0.7, 0]) }} />
            )}
            <b style={{ fontSize: 28, color: COLORS.bone }}>{t.n}</b>
            <span style={{ fontSize: 28, color: COLORS.crimson, fontWeight: 800 }}>{t.p}</span>
          </div>
        );
      })}
      <div style={{ marginTop: "auto", display: "flex", gap: 12, opacity: payIn, transform: `translateY(${interpolate(payIn, [0, 1], [20, 0])}px)` }}>
        <div style={{ flex: 1, textAlign: "center", background: COLORS.crimson, color: "#000", fontWeight: 800, fontSize: 24, padding: "20px 0", borderRadius: 100 }}>Pay ৳3,600</div>
      </div>
      <div style={{ textAlign: "center", fontSize: 17, color: COLORS.mute, opacity: payIn }}>card · wallet · bKash</div>
    </div>
  );
};

/* ---------- Beat 3: HOLD ---------- */
const HoldScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drop = spring({ frame: frame - 8, fps, config: { damping: 14 } });
  const y = interpolate(drop, [0, 1], [-420, 0]);
  const toast = interpolate(frame, [26, 36, BEAT - 6, BEAT], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const qrShift = frame > 30 ? 1 : 0;
  return (
    <div style={{ position: "absolute", inset: 0, padding: "120px 34px 40px" }}>
      <div style={{ fontSize: 22, color: COLORS.mute, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 22 }}>Your wallet</div>
      <div style={{ transform: `translateY(${y}px)`, borderRadius: 24, overflow: "hidden", background: `linear-gradient(160deg,#1b1b1f,#0e0e10)`, border: "1px solid rgba(255,255,255,.1)", boxShadow: "0 30px 60px -25px rgba(0,0,0,.8)" }}>
        <div style={{ background: COLORS.crimson, color: "#000", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: ".18em", opacity: 0.8 }}>ADMIT ONE</div>
            <div style={{ fontSize: 38, fontWeight: 800, lineHeight: 0.95, textTransform: "uppercase", marginTop: 4 }}>Midnight<br />Pulse</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: ".18em", opacity: 0.8 }}>SEC/ROW</div>
            <div style={{ fontSize: 38, fontWeight: 800 }}>A·12</div>
          </div>
        </div>
        <div style={{ padding: 24, display: "flex", gap: 20, alignItems: "center" }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 12 }}>
            <QrCode size={130} shift={qrShift} />
          </div>
          <div style={{ color: COLORS.bone }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>Scan at gate</div>
            <div style={{ fontSize: 17, color: COLORS.mute, marginTop: 4 }}>Fri · 27 Jun · 9:00 PM</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#16b75a", fontSize: 17, fontWeight: 700, marginTop: 12 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#16b75a" }} /> Live · verified
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 26, textAlign: "center", opacity: toast }}>
        <span style={{ background: COLORS.bone, color: "#000", borderRadius: 100, padding: "14px 26px", fontSize: 22, fontWeight: 700 }}>✓ Added to wallet</span>
      </div>
    </div>
  );
};

/* ---------- Beat 4: LIVE (gate) ---------- */
const Walker: React.FC<{ x: number; ground: number; scale: number; holdTicket?: boolean }> = ({ x, ground, scale, holdTicket = true }) => {
  const frame = useCurrentFrame();
  const stride = Math.sin(frame / 4.2) * 16;
  const bob = Math.abs(Math.sin(frame / 4.2)) * 6;
  const body = "#1b1b22";
  return (
    <div style={{ position: "absolute", left: x, top: ground - bob, transform: `translate(-50%,-100%) scale(${scale})`, transformOrigin: "bottom center" }}>
      <div style={{ position: "relative", width: 90, height: 230 }}>
        {/* glowing ticket in hand */}
        {holdTicket && (
          <div style={{ position: "absolute", left: -10, top: 96, width: 46, height: 28, borderRadius: 6, background: COLORS.crimson, boxShadow: `0 0 22px rgba(194,0,50,.9)`, transform: "rotate(-12deg)" }} />
        )}
        <div style={{ position: "absolute", left: "50%", top: 0, width: 64, height: 64, marginLeft: -32, borderRadius: "50%", background: body }} />
        <div style={{ position: "absolute", left: "50%", top: 56, width: 72, height: 104, marginLeft: -36, borderRadius: "34px 34px 14px 14px", background: body }} />
        {/* arm holding ticket */}
        <div style={{ position: "absolute", left: 8, top: 70, width: 18, height: 64, background: body, borderRadius: 12, transformOrigin: "top", transform: "rotate(28deg)" }} />
        {/* legs */}
        <div style={{ position: "absolute", left: 22, top: 150, width: 20, height: 78, background: body, borderRadius: 11, transformOrigin: "top", transform: `rotate(${stride}deg)` }} />
        <div style={{ position: "absolute", right: 22, top: 150, width: 20, height: 78, background: body, borderRadius: 11, transformOrigin: "top", transform: `rotate(${-stride}deg)` }} />
      </div>
    </div>
  );
};

const LiveGate: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // local layout space (the beat's flex:1 box) is ~1080 x ~1380
  const W = 1080;
  const H = 1340;
  const cx = W / 2;
  const ground = H * 0.82;
  const gateTop = H * 0.16;
  const postH = ground - gateTop;
  const gap = 360;

  const walkX = interpolate(frame, [0, 18], [W * 0.12, cx], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const green = frame >= 17;
  const beam = interpolate(frame, [8, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lightColor = green ? "#16b75a" : COLORS.crimson;
  const badge = spring({ frame: frame - 18, fps, config: { damping: 9, mass: 0.7 } });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: "50%", top: "50%", width: W, height: H, transform: "translate(-50%,-50%)" }}>
        {/* floor */}
        <div style={{ position: "absolute", left: cx - gap / 2 - 80, width: gap + 160, top: ground, height: 12, background: "linear-gradient(90deg,transparent,#26262b,transparent)", borderRadius: 8 }} />

        {/* posts */}
        {[cx - gap / 2, cx + gap / 2].map((px, i) => (
          <div key={i} style={{ position: "absolute", left: px, top: gateTop, transform: "translateX(-50%)", width: 64, height: postH, background: "linear-gradient(180deg,#2c2c32,#121215)", borderRadius: 18 }} />
        ))}
        {/* top bar */}
        <div style={{ position: "absolute", left: cx - gap / 2 - 40, width: gap + 80, top: gateTop - 6, height: 40, background: "linear-gradient(180deg,#34343b,#1a1a1e)", borderRadius: 14 }} />

        {/* scanner light orb */}
        <div style={{ position: "absolute", left: cx, top: gateTop - 64, transform: "translateX(-50%)", width: 96, height: 96, borderRadius: "50%", background: lightColor, boxShadow: `0 0 70px ${lightColor}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {green ? (
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
          ) : null}
        </div>

        {/* scan beam */}
        <div style={{ position: "absolute", left: cx - gap / 2 + 30, width: gap - 60, top: gateTop + postH * 0.42, height: 5, background: COLORS.crimson, opacity: beam * (green ? 0 : 1), boxShadow: `0 0 18px ${COLORS.crimson}`, borderRadius: 4 }} />

        <Walker x={walkX} ground={ground} scale={1.7} />

        {/* YOU'RE IN! sticker pops above the walker */}
        <div style={{ position: "absolute", left: cx, top: gateTop + 40, transform: `translate(-50%,-50%) scale(${interpolate(badge, [0, 1], [0, 1])}) rotate(-6deg)`, opacity: badge }}>
          <div style={{ background: COLORS.bone, color: COLORS.crimson, fontWeight: 800, fontSize: 58, textTransform: "uppercase", padding: "18px 38px", borderRadius: 22, boxShadow: "0 20px 50px -12px rgba(0,0,0,.7)", border: `4px solid ${COLORS.crimson}` }}>
            You're in!
          </div>
        </div>
      </div>
    </div>
  );
};

export const Scene03Flow: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill>
      <InkBackground glow={false} />
      <Sequence durationInFrames={BEAT}>
        <Beat>
          <BeatTitle word="Swipe" n="01" />
          <Phone width={470}><SwipeScreen /></Phone>
        </Beat>
      </Sequence>
      <Sequence from={BEAT} durationInFrames={BEAT}>
        <Beat>
          <BeatTitle word="Book" n="02" />
          <Phone width={470}><BookScreen /></Phone>
        </Beat>
      </Sequence>
      <Sequence from={BEAT * 2} durationInFrames={BEAT}>
        <Beat>
          <BeatTitle word="Hold" n="03" />
          <Phone width={470}><HoldScreen /></Phone>
        </Beat>
      </Sequence>
      <Sequence from={BEAT * 3} durationInFrames={64}>
        <Beat dur={64}>
          <BeatTitle word="Live" n="04" />
          <div style={{ position: "relative", width: "100%", flex: 1 }}>
            <LiveGate />
          </div>
          <ConfettiBurst start={19} count={48} originX={0.5} originY={0.4} power={1.15} spread={1.2} width={width} height={height} />
        </Beat>
      </Sequence>
    </AbsoluteFill>
  );
};
