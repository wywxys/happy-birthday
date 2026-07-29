import {
  CAKE_START_LEFT,
  GOLDEN_CAKE_POINTS,
  GOLDEN_CAKE_PROB,
  HEART_CAKE_PROB,
} from "./constants";
import type { Cake, CakeKind } from "./types";

export function createCake(opts?: {
  rng?: () => number;
  allowGolden?: boolean;
  allowHeart?: boolean;
}): Omit<Cake, "id"> {
  const rand = opts?.rng ?? Math.random;
  const bottom = 140 + rand() * 410;

  // Roll heart first (easy-mode exclusive), then golden, else regular
  let kind: CakeKind = "regular";
  if (opts?.allowHeart === true && rand() < HEART_CAKE_PROB) {
    kind = "heart";
  } else if (opts?.allowGolden === true && rand() < GOLDEN_CAKE_PROB) {
    kind = "golden";
  }
  return { left: CAKE_START_LEFT, bottom, kind };
}

export function cakePoints(kind: CakeKind): number {
  if (kind === "golden") return GOLDEN_CAKE_POINTS;
  // Heart cakes count for score too (still counts toward victory)
  return 1;
}
