import { GRAVITY_ACC, JUMP_VY, BIRD_MIN_BOTTOM, BIRD_MAX_BOTTOM, CAKE_WIDTH } from "./constants";
import type { Cake } from "./types";

export function applyGravity(
  bottom: number,
  vy: number,
  dt: number,
): { bottom: number; vy: number; hitFloor: boolean } {
  const vy2 = vy - GRAVITY_ACC * dt;
  let bottom2 = bottom + vy2 * dt;
  const hitFloor = bottom2 <= BIRD_MIN_BOTTOM && vy2 < 0;
  if (bottom2 < BIRD_MIN_BOTTOM) bottom2 = BIRD_MIN_BOTTOM;
  if (bottom2 > BIRD_MAX_BOTTOM) bottom2 = BIRD_MAX_BOTTOM;
  return { bottom: bottom2, vy: vy2, hitFloor };
}

export function applyJump(): number {
  return JUMP_VY;
}

export function boxesOverlap(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export function moveCake(cake: Cake, speed: number, dt: number): Cake {
  return { ...cake, left: cake.left - speed * dt };
}

export function cakeOffscreen(cake: Cake): boolean {
  return cake.left + CAKE_WIDTH < 0;
}
