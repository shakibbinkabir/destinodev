import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

/**
 * Self-hosted Inter (via @fontsource files copied into /public/fonts).
 * Loading locally avoids any network dependency on fonts.gstatic.com, which
 * is unreachable behind the restricted egress proxy.
 */
export const TICKKETO_FONT = "Inter";

const faces: { weight: string; style: "normal" | "italic"; file: string }[] = [
  { weight: "400", style: "normal", file: "inter-latin-400-normal.woff2" },
  { weight: "500", style: "normal", file: "inter-latin-500-normal.woff2" },
  { weight: "500", style: "italic", file: "inter-latin-500-italic.woff2" },
  { weight: "700", style: "normal", file: "inter-latin-700-normal.woff2" },
  { weight: "800", style: "normal", file: "inter-latin-800-normal.woff2" },
  { weight: "800", style: "italic", file: "inter-latin-800-italic.woff2" },
];

export const ensureFonts = () =>
  Promise.all(
    faces.map((f) =>
      loadFont({
        family: TICKKETO_FONT,
        url: staticFile(`fonts/${f.file}`),
        weight: f.weight,
        style: f.style,
      }),
    ),
  );

// Kick off loading at module import so it's registered before render.
ensureFonts();
