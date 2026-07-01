import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { useTechData } from '../hooks/useTechData.js'
import { PALETTE } from '../utils/colors.js'

// A rough stylized coastline silhouette for Biscayne Bay / the barrier
// islands, expressed as a closed loop of points. This is intentionally
// abstract (mission-control aesthetic, not GIS-accurate cartography).
const COASTLINE_POINTS = [
  [-18, 0.02, -14], [-16, 0.02, -6], [-14, 0.02, 4], [-15, 0.02, 12],
  [-12, 0.02, 18], [-6, 0.02, 20], [2, 0.02, 19], [8, 0.02, 16],
  [11, 0.02, 10], [10, 0.02, 2], [13, 0.02, -4], [12, 0.02, -12],
  [8, 0.02, -16], [0, 0.02, -17], [-8, 0.02, -17], [-18, 0.02, -14]
]

const BARRIER_ISLAND_POINTS = [
  [12, 0.02, 8], [15, 0.02, 4], [16, 0.02, -2], [14, 0.02, -8],
  [12, 0.02, -6], [13, 0.02, 0], [12, 0.02, 5], [12, 0.02, 8]
]

/**
 * MiamiMap renders the base "digital twin" surface: an animated glowing
 * grid plane standing in for streets/blocks, a dark water plane, and
 * neon coastline outlines. Colors shift between the night and day palettes
 * based on store state.
 */
export default function MiamiMap() {
  const isNightMode = useTechData((s) => s.isNightMode)
  const gridRef = useRef()

  const gridColor = isNightMode ? PALETTE.gridLine : PALETTE.gridLineDay
  const waterColor = isNightMode ? '#020a14' : '#0c2e42'

  const gridHelper = useMemo(() => {
    const grid = new THREE.GridHelper(48, 48, gridColor, gridColor)
    grid.material.transparent = true
    grid.material.opacity = isNightMode ? 0.35 : 0.2
    return grid
  }, [gridColor, isNightMode])

  useFrame(({ clock }) => {
    if (gridRef.current) {
      // Subtle breathing opacity so the grid reads as "alive" telemetry.
      const pulse = 0.28 + Math.sin(clock.elapsedTime * 0.6) * 0.05
      gridRef.current.material.opacity = isNightMode ? pulse : pulse * 0.6
    }
  })

  return (
    <group>
      {/* Water plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial
          color={waterColor}
          metalness={0.6}
          roughness={0.35}
          emissive={waterColor}
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Animated telemetry grid */}
      <primitive object={gridHelper} ref={gridRef} position={[0, 0, 0]} />

      {/* Coastline glow outlines */}
      <Line points={COASTLINE_POINTS} color={PALETTE.cyan} lineWidth={2} transparent opacity={0.85} />
      <Line points={BARRIER_ISLAND_POINTS} color={PALETTE.cyan} lineWidth={1.5} transparent opacity={0.6} />

      {/* Landmass fill, subtly raised above the water so nodes read as "on land" */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1, 0.005, 0]} receiveShadow>
        <shapeGeometry args={[buildCoastlineShape()]} />
        <meshStandardMaterial
          color={isNightMode ? '#04141f' : '#0a2436'}
          metalness={0.2}
          roughness={0.8}
          transparent
          opacity={0.92}
        />
      </mesh>
    </group>
  )
}

/** Builds a THREE.Shape from the coastline point loop for the landmass fill. */
function buildCoastlineShape() {
  const shape = new THREE.Shape()
  COASTLINE_POINTS.forEach(([x, , z], i) => {
    // Shape space uses (x, y) as the 2D plane; we map world x/z into it,
    // matching the mesh's -90° X rotation.
    if (i === 0) shape.moveTo(x, z)
    else shape.lineTo(x, z)
  })
  return shape
}
