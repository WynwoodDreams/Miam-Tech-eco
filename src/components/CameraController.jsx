import { useEffect, useRef, useState } from 'react'
import { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useCamera } from '../hooks/useCamera.js'

/**
 * CameraController wraps drei's OrbitControls and layers on two behaviors:
 *  1. A brief cinematic auto-rotate on first load (mission-control style
 *     establishing shot) that stops the moment the user interacts.
 *  2. Smooth "fly-to" transitions handled by useCamera whenever a node is
 *     selected elsewhere in the app (search, click, sidebar).
 */
export default function CameraController() {
  const { camera, gl } = useThree()
  const controlsRef = useRef()
  const [autoRotate, setAutoRotate] = useState(true)

  useCamera(controlsRef)

  useEffect(() => {
    camera.position.set(14, 12, 18)
  }, [camera])

  useEffect(() => {
    const stopAutoRotate = () => setAutoRotate(false)
    const canvas = gl.domElement
    canvas.addEventListener('pointerdown', stopAutoRotate, { once: true })
    const timeout = setTimeout(stopAutoRotate, 9000) // stop after 9s regardless
    return () => {
      canvas.removeEventListener('pointerdown', stopAutoRotate)
      clearTimeout(timeout)
    }
  }, [gl])

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={6}
      maxDistance={60}
      maxPolarAngle={Math.PI / 2.05}
      autoRotate={autoRotate}
      autoRotateSpeed={0.6}
      target={[0, 0, 0]}
    />
  )
}
