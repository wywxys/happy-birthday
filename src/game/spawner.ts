import { GOLDEN_CAKE_PROB, GOLDEN_CAKE_POINTS, CAKE_START_LEFT } from "./constants";
import type { Cake, CakeKind } from "./types";

export function createCake(opts?: { rng?: () => number; allowGolden?: boolean }): Omit<Cake, "id"> {
  const rand = opts?.rng ?? Math.random;
  const bottom = 140 + rand() * 410;
  const kind: CakeKind =
    opts?.allowGolden === true && rand() < GOLDEN_CAKE_PROB ? "golden" : "regular";
  return { left: CAKE_START_LEFT, bottom, kind };
}

export function cakePoints(kind: CakeKind): number {
  return kind === "golden" ? GOLDEN_CAKE_POINTS : 1;
}
