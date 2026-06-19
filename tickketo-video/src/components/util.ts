/** Tiny deterministic PRNG so every render frame is identical (no flicker). */
export const rng = (seed: number) => {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

export const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/** Springy ease-out-back for that bouncy, slightly cartoonish pop. */
export const backOut = (t: number, s = 1.70158) => {
  const u = t - 1;
  return u * u * ((s + 1) * u + s) + 1;
};
