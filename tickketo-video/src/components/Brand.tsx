import React from "react";
import { COLORS } from "../theme";

/**
 * The Tickketo ticket-shaped logo mark (the notched rounded rectangle with a
 * perforation line) — same path the site ships in its SVG logo.
 */
export const LogoMark: React.FC<{
  width?: number;
  gradientId?: string;
  drawProgress?: number; // 0..1 fades the dotted perforation in
}> = ({ width = 220, gradientId = "tkg", drawProgress = 1 }) => {
  return (
    <svg
      width={width}
      height={(width * 32) / 64}
      viewBox="0 0 64 32"
      role="img"
      aria-label="Tickketo"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset=".55" stopColor={COLORS.pink} />
          <stop offset="1" stopColor={COLORS.crimson} />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gradientId})`}
        d="M3 0 H18 A4 4 0 0 0 26 0 H61 A3 3 0 0 1 64 3 V29 A3 3 0 0 1 61 32 H26 A4 4 0 0 0 18 32 H3 A3 3 0 0 1 0 29 V3 A3 3 0 0 1 3 0 Z"
      />
      {/* dotted perforation — matches the site's stroke-dasharray "0.1 3" */}
      <line
        x1="22"
        y1="6"
        x2="22"
        y2="26"
        stroke={COLORS.crimson}
        strokeWidth="1.6"
        strokeDasharray="0.1 3"
        strokeLinecap="round"
        opacity={0.7 * drawProgress}
      />
    </svg>
  );
};

/**
 * Deterministic faux-QR — a stable grid of cells with the three finder squares,
 * matching the live-ticket motif on the site. Seeded so it never flickers.
 */
export const QrCode: React.FC<{
  size?: number;
  color?: string;
  bg?: string;
  cells?: number;
  shift?: number; // animate the "live refresh" by shifting the seed
}> = ({ size = 200, color = COLORS.ink, bg = "#FFFFFF", cells = 13, shift = 0 }) => {
  const unit = size / cells;
  const isFinder = (x: number, y: number) => {
    const inBox = (bx: number, by: number) =>
      x >= bx && x < bx + 3 && y >= by && y < by + 3;
    return inBox(0, 0) || inBox(cells - 3, 0) || inBox(0, cells - 3);
  };
  const rects: React.ReactNode[] = [];
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      if (isFinder(x, y)) continue;
      const v = Math.sin((x + 1.3) * (y + 2.1) * 12.9898 + shift * 1.7) * 43758.5453;
      if (v - Math.floor(v) > 0.55) {
        rects.push(
          <rect
            key={`${x}-${y}`}
            x={x * unit}
            y={y * unit}
            width={unit}
            height={unit}
            fill={color}
          />,
        );
      }
    }
  }
  const Finder: React.FC<{ cx: number; cy: number }> = ({ cx, cy }) => (
    <g>
      <rect x={cx * unit} y={cy * unit} width={unit * 3} height={unit * 3} fill={color} />
      <rect
        x={(cx + 0.6) * unit}
        y={(cy + 0.6) * unit}
        width={unit * 1.8}
        height={unit * 1.8}
        fill={bg}
      />
      <rect
        x={(cx + 1) * unit}
        y={(cy + 1) * unit}
        width={unit}
        height={unit}
        fill={color}
      />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect x={0} y={0} width={size} height={size} fill={bg} rx={size * 0.04} />
      {rects}
      <Finder cx={0} cy={0} />
      <Finder cx={cells - 3} cy={0} />
      <Finder cx={0} cy={cells - 3} />
    </svg>
  );
};
