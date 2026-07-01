import { Vector3, CatmullRomCurve3, QuadraticBezierCurve3 } from 'three'

/** Clamp a value between min and max. */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

/** Linear interpolation. */
export function lerp(a, b, t) {
  return a + (b - a) * t
}

/** Smoothstep easing, useful for organic drone / camera motion. */
export function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

/**
 * Builds a gentle arched curve between two points, lifted along Y so that
 * talent-flow / internship lines read as elevated "data arcs" above the map
 * rather than flat lines cutting through buildings.
 */
export function buildArcCurve(start, end, height = 2.2) {
  const startVec = new Vector3(...start)
  const endVec = new Vector3(...end)
  const mid = startVec.clone().lerp(endVec, 0.5)
  mid.y += height
  return new QuadraticBezierCurve3(startVec, mid, endVec)
}

/**
 * Builds a smooth multi-point patrol path for drones from an array of
 * [x,y,z] waypoints, looping back to the start.
 */
export function buildPatrolCurve(points) {
  const vectors = points.map((p) => new Vector3(...p))
  return new CatmullRomCurve3(vectors, true, 'catmullrom', 0.5)
}

/** Fast lookup map builder: array of {id,...} -> Map keyed by id. */
export function toIdMap(items) {
  const map = new Map()
  for (const item of items) map.set(item.id, item)
  return map
}

/** Finds a node's position across multiple node collections by id. */
export function findPositionById(id, collections) {
  for (const collection of collections) {
    const found = collection.find((n) => n.id === id)
    if (found) return found.position
  }
  return null
}

/** Returns a deterministic pseudo-random number from a string seed (0-1). */
export function seededRandom(seed) {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0
  }
  const x = Math.sin(h) * 10000
  return x - Math.floor(x)
}
