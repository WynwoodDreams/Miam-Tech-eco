import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useTechData } from './useTechData.js'

/**
 * useCamera drives smooth "fly-to" camera transitions whenever the store's
 * focusTarget changes (e.g. from search results or clicking a node). It
 * lerps both the OrbitControls target and camera position each frame,
 * producing a cinematic ease rather than an instant jump-cut.
 *
 * @param {React.RefObject} controlsRef - ref to the drei OrbitControls instance
 */
export function useCamera(controlsRef) {
  const { camera } = useThree()
  const focusTarget = useTechData((s) => s.focusTarget)
  const desiredTarget = useRef(new Vector3(0, 0, 0))
  const desiredCamPos = useRef(new Vector3(12, 10, 16))

  useFrame(() => {
    if (!controlsRef.current) return

    if (focusTarget) {
      desiredTarget.current.set(focusTarget[0], focusTarget[1] + 1, focusTarget[2])
      const dir = new Vector3()
        .subVectors(camera.position, controlsRef.current.target)
        .normalize()
      desiredCamPos.current
        .copy(desiredTarget.current)
        .add(dir.multiplyScalar(9))
        .setY(Math.max(desiredCamPos.current.y, 6))
    }

    controlsRef.current.target.lerp(desiredTarget.current, 0.06)
    camera.position.lerp(desiredCamPos.current, 0.04)
    controlsRef.current.update()
  })
}
