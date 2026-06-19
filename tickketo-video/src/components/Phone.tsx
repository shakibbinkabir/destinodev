import React from "react";
import { COLORS } from "../theme";

/** A clean illustrated phone mockup; children render inside the screen. */
export const Phone: React.FC<{
  width?: number;
  children: React.ReactNode;
  screenBg?: string;
}> = ({ width = 560, children, screenBg = COLORS.ink2 }) => {
  const height = width * 2.02;
  const bezel = width * 0.03;
  return (
    <div
      style={{
        width,
        height,
        borderRadius: width * 0.13,
        background: "linear-gradient(160deg,#2a2a2e,#0c0c0e)",
        padding: bezel,
        boxShadow: "0 60px 120px -40px rgba(0,0,0,.9), 0 0 0 2px rgba(255,255,255,.05)",
        position: "relative",
      }}
    >
      {/* side buttons */}
      <div style={{ position: "absolute", left: -3, top: width * 0.34, width: 3, height: width * 0.16, background: "#26262a", borderRadius: 3 }} />
      <div style={{ position: "absolute", right: -3, top: width * 0.28, width: 3, height: width * 0.22, background: "#26262a", borderRadius: 3 }} />

      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: width * 0.1,
          background: screenBg,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* notch */}
        <div
          style={{
            position: "absolute",
            top: width * 0.03,
            left: "50%",
            transform: "translateX(-50%)",
            width: width * 0.34,
            height: width * 0.05,
            background: "#000",
            borderRadius: 100,
            zIndex: 20,
          }}
        />
        {children}
      </div>
    </div>
  );
};
