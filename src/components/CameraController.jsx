import { useEffect, useRef, useState } from 'react'
import { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useCamera } from '../hooks/useCamera.js'
import { useIsMobile } from '../hooks/useIsMobile.js'

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
  const isMobile = useIsMobile()

  useCamera(controlsRef)

  useEffect(() => {
    if (isMobile) {
      camera.position.set(20, 36, 34)
    } else {
      camera.position.set(16, 24, 22)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera])

  useEffect(() => {
    const stopAutoRotate = () => setAutoRotate(false)
    const canvas = gl.domElement
    // Any interaction (drag, scroll, touch) ends the establishing shot
    canvas.addEventListener('pointerdown', stopAutoRotate, { once: true })
    canvas.addEventListener('wheel', stopAutoRotate, { once: true, passive: true })
    const timeout = setTimeout(stopAutoRotate, 5000) // stop after 5s regardless
    return () => {
      canvas.removeEventListener('pointerdown', stopAutoRotate)
      canvas.removeEventListener('wheel', stopAutoRotate)
      clearTimeout(timeout)
    }
  }, [gl])

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.12}
      rotateSpeed={0.55}
      zoomSpeed={0.65}
      panSpeed={0.6}
      minDistance={10}
      maxDistance={65}
      minPolarAngle={0.15}
      maxPolarAngle={Math.PI / 2.15}
      autoRotate={autoRotate}
      autoRotateSpeed={0.25}
      target={[0, 0, 0]}
    />
  )
}
