/**
 * Animation helpers used inside useFrame callbacks. Kept allocation-free
 * (no `new` per call) so they are safe to run every frame at 60 FPS.
 */

/** Gentle vertical bob, e.g. for floating labels or hologram nodes. */
export function bobOffset(elapsed, speed = 1, amplitude = 0.15, phase = 0) {
  return Math.sin(elapsed * speed + phase) * amplitude
}

/** Pulsing scale factor, e.g. for glowing node pulses. */
export function pulseScale(elapsed, speed = 2, min = 0.85, max = 1.15, phase = 0) {
  const t = (Math.sin(elapsed * speed + phase) + 1) / 2
  return min + (max - min) * t
}

/** Continuous rotation angle (radians) given elapsed time and speed. */
export function spin(elapsed, speed = 0.5) {
  return elapsed * speed
}

/** Progress (0-1) of a value moving along a path at a given speed, looping. */
export function loopProgress(elapsed, duration, offset = 0) {
  const t = ((elapsed + offset) % duration) / duration
  return t < 0 ? t + 1 : t
}

/** Flicker intensity multiplier for data-stream / glitch effects. */
export function flicker(elapsed, seedOffset = 0) {
  return 0.7 + 0.3 * Math.abs(Math.sin(elapsed * 6 + seedOffset) * Math.cos(elapsed * 2.3 + seedOffset))
}
