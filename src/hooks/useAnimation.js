import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTechData } from './useTechData.js'

/**
 * useAnimation centralizes "elapsed simulation time" so every animated
 * component advances (or pauses) together when the Timeline play/pause
 * control is toggled, instead of each component reading the raw R3F clock
 * independently (which would ignore pause state).
 *
 * @param {number} speedMultiplier - scales how fast simulated time advances,
 *   handy for tying speed to sliders like talentFlow or traffic.
 * @returns {{ getElapsed: () => number }}
 */
export function useAnimation(speedMultiplier = 1) {
  const elapsedRef = useRef(0)
  const isPlaying = useTechData((s) => s.isPlaying)

  useFrame((_, delta) => {
    if (isPlaying) {
      elapsedRef.current += delta * speedMultiplier
    }
  })

  return {
    getElapsed: () => elapsedRef.current
  }
}
