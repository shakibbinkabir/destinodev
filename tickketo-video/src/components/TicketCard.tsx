import React from "react";
import { COLORS } from "../theme";
import { QrCode } from "./Brand";

/** A faithful mini of the site's signature ticket, used in the "Hold it" beat. */
export const TicketCard: React.FC<{ width?: number; qrShift?: number; live?: boolean }> = ({
  width = 620,
  qrShift = 0,
  live = true,
}) => {
  return (
    <div style={{ width, position: "relative", fontFamily: "inherit" }}>
      {live ? (
        <div
          style={{
            position: "absolute",
            top: -22,
            right: 40,
            zIndex: 5,
            background: COLORS.crimson,
            color: "#000",
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            padding: "10px 22px",
            borderRadius: 100,
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 10px 34px rgba(194,0,50,.4)",
          }}
        >
          <span
            style={{ width: 12, height: 12, borderRadius: 6, background: "#000" }}
          />
          Live
        </div>
      ) : null}

      <div
        style={{
          background: `linear-gradient(160deg, ${COLORS.ink2}, ${COLORS.ink})`,
          border: "1px solid rgba(255,255,255,.1)",
          borderRadius: 34,
          overflow: "hidden",
          boxShadow: "0 60px 120px -40px rgba(0,0,0,.85)",
        }}
      >
        {/* top */}
        <div
          style={{
            background: COLORS.crimson,
            color: "#000",
            padding: "34px 38px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div style={{ fontSize: 17, letterSpacing: ".2em", textTransform: "uppercase", fontWeight: 800, opacity: 0.82 }}>
              Tickketo · Admit one
            </div>
            <div style={{ fontSize: 52, lineHeight: 0.95, textTransform: "uppercase", fontWeight: 800, marginTop: 8 }}>
              Midnight
              <br />
              Pulse
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 17, letterSpacing: ".2em", textTransform: "uppercase", fontWeight: 800, opacity: 0.82 }}>
              Sec / Row
            </div>
            <div style={{ fontSize: 52, lineHeight: 0.95, fontWeight: 800 }}>A·12</div>
          </div>
        </div>

        {/* perforation */}
        <div style={{ position: "relative", height: 0, borderTop: "3px dashed rgba(255,255,255,.22)" }}>
          <span style={{ position: "absolute", top: "50%", left: -22, width: 44, height: 44, borderRadius: "50%", background: COLORS.ink, transform: "translateY(-50%)" }} />
          <span style={{ position: "absolute", top: "50%", right: -22, width: 44, height: 44, borderRadius: "50%", background: COLORS.ink, transform: "translateY(-50%)" }} />
        </div>

        {/* body */}
        <div style={{ padding: 38, color: COLORS.bone }}>
          <Row k="Venue" v="Warehouse 9, Dhaka" k2="Date" v2="Fri · 27 Jun" />
          <Row k="Doors" v="9:00 PM" k2="Tier" v2="VIP Floor" />
          <div
            style={{
              marginTop: 14,
              background: "#fff",
              borderRadius: 20,
              padding: 22,
              display: "flex",
              gap: 22,
              alignItems: "center",
            }}
          >
            <QrCode size={130} shift={qrShift} />
            <div style={{ color: "#000" }}>
              <b style={{ fontSize: 22, display: "block" }}>Scan at gate</b>
              <span style={{ fontSize: 17, color: "#555" }}>#TK-9F3A-2207</span>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 9, color: "#0a8a3f", fontSize: 17, fontWeight: 700, marginTop: 10 }}>
                <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#16b75a" }} />
                Verified · ready
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Row: React.FC<{ k: string; v: string; k2: string; v2: string }> = ({ k, v, k2, v2 }) => (
  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 22 }}>
    <div>
      <div style={{ fontSize: 15, letterSpacing: ".18em", textTransform: "uppercase", color: COLORS.mute }}>{k}</div>
      <div style={{ fontSize: 24, fontWeight: 700, marginTop: 5 }}>{v}</div>
    </div>
    <div style={{ textAlign: "right" }}>
      <div style={{ fontSize: 15, letterSpacing: ".18em", textTransform: "uppercase", color: COLORS.mute }}>{k2}</div>
      <div style={{ fontSize: 24, fontWeight: 700, marginTop: 5 }}>{v2}</div>
    </div>
  </div>
);
