import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const DUMMY = new THREE.Object3D()

/**
 * Generic instanced-particle stream that travels along any THREE.Curve.
 * Used by InternshipRoutes and DataStreams to avoid duplicating the same
 * "N particles looping along a curve" logic in multiple files.
 */
export default function FlowParticles({ curve, count = 3, color = '#38e0ff', speed = 0.2, size = 0.05 }) {
  const meshRef = useRef()

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.elapsedTime
    for (let i = 0; i < count; i++) {
      const offset = i / count
      const progress = ((t * speed + offset) % 1 + 1) % 1
      const point = curve.getPoint(progress)
      DUMMY.position.copy(point)
      DUMMY.scale.setScalar(size)
      DUMMY.updateMatrix()
      meshRef.current.setMatrixAt(i, DUMMY.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color={color} transparent opacity={0.95} toneMapped={false} />
    </instancedMesh>
  )
}
