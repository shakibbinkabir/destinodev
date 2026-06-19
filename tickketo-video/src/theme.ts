/**
 * Tickketo brand tokens — lifted directly from the website's design system
 * so the video reads as the same product.
 */
export const COLORS = {
  ink: "#0E0E0E",
  ink2: "#161618",
  ink3: "#202024",
  paper: "#FFFFFF",
  paper2: "#F2F2F4",
  crimson: "#C20032", // site calls this --orange
  crimson2: "#E5436A",
  ember: "#8A0024",
  pink: "#FF6E94", // logo gradient mid-stop
  bone: "#F5F5F7",
  mute: "#86868B",
  muteD: "#6E6E73",
} as const;

// Apple-ish ease used across the site (cubic-bezier(.22,1,.36,1))
export const EASE = [0.22, 1, 0.36, 1] as const;
export const EASE_IN = [0.7, 0, 0.84, 0] as const;

export const FONT_STACK =
  '"Inter", -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif';

// White → pink → crimson gradient used in the wordmark.
export const LOGO_GRADIENT = `linear-gradient(90deg, ${COLORS.bone} 0%, ${COLORS.pink} 55%, ${COLORS.crimson} 100%)`;

export const gradientText = (gradient: string = LOGO_GRADIENT) =>
  ({
    backgroundImage: gradient,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    WebkitTextFillColor: "transparent",
  }) as const;
