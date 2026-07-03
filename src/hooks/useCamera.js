import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useTechData } from './useTechData.js'

const ARRIVED_EPSILON = 0.15

/**
 * useCamera drives smooth "fly-to" camera transitions whenever the store's
 * focusTarget changes (e.g. from search results or clicking a node).
 *
 * Crucially, it only steers the camera WHILE a flight is in progress and
 * hands control back the moment the flight arrives or the user grabs the
 * controls. (It previously lerped toward the last desired position on
 * every frame forever, which constantly fought manual orbiting and made
 * the view feel like it was drifting on its own.)
 *
 * @param {React.RefObject} controlsRef - ref to the drei OrbitControls instance
 */
export function useCamera(controlsRef) {
  const { camera, gl } = useThree()
  const focusTarget = useTechData((s) => s.focusTarget)

  const isFlying = useRef(false)
  const desiredTarget = useRef(new Vector3())
  const desiredCamPos = useRef(new Vector3())

  // A new focusTarget starts a flight; clearing it just stops steering
  // (no snap-back).
  useEffect(() => {
    if (!focusTarget || !controlsRef.current) {
      isFlying.current = false
      return
    }
    desiredTarget.current.set(focusTarget[0], focusTarget[1] + 1, focusTarget[2])
    const dir = new Vector3().subVectors(camera.position, controlsRef.current.target).normalize()
    desiredCamPos.current.copy(desiredTarget.current).add(dir.multiplyScalar(9))
    desiredCamPos.current.y = Math.max(desiredCamPos.current.y, 6)
    isFlying.current = true
  }, [focusTarget, camera, controlsRef])

  // The user grabbing the controls cancels any in-progress flight
  // immediately — their input always wins.
  useEffect(() => {
    const cancel = () => {
      isFlying.current = false
    }
    const canvas = gl.domElement
    canvas.addEventListener('pointerdown', cancel)
    canvas.addEventListener('wheel', cancel, { passive: true })
    return () => {
      canvas.removeEventListener('pointerdown', cancel)
      canvas.removeEventListener('wheel', cancel)
    }
  }, [gl])

  useFrame(() => {
    if (!isFlying.current || !controlsRef.current) return

    controlsRef.current.target.lerp(desiredTarget.current, 0.08)
    camera.position.lerp(desiredCamPos.current, 0.06)
    controlsRef.current.update()

    if (
      controlsRef.current.target.distanceTo(desiredTarget.current) < ARRIVED_EPSILON &&
      camera.position.distanceTo(desiredCamPos.current) < ARRIVED_EPSILON * 4
    ) {
      isFlying.current = false
    }
  })
}
