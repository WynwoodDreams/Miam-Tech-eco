import { memo, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useTechData } from '../hooks/useTechData.js'
import { PALETTE } from '../utils/colors.js'
import NodeField from './NodeField.jsx'

const MAX_PARTICLES = 240

/**
 * AIActivity renders the AI-native company markers plus a GPU-friendly
 * particle swarm ("model inference activity") swirling above each AI
 * company node. Particle *count actually drawn* is controlled via
 * geometry draw range rather than re-allocating buffers, so scrubbing the
 * aiActivity slider never triggers a reallocation — just a cheap
 * `setDrawRange` call.
 */
function AIActivity() {
  const aiCompanies = useTechData((s) => s.startups.filter((n) => n.type === 'AICompany'))
  const visible = useTechData((s) => s.layerFilters.AICompany)
  const aiActivity = useTechData((s) => s.aiActivity)

  const pointsRef = useRef()

  // Pre-allocate a fixed-size buffer once; particles are distributed evenly
  // across all AI company nodes and never reallocated afterwards.
  const { positions, seeds, basePositions } = useMemo(() => {
    const positions = new Float32Array(MAX_PARTICLES * 3)
    const seeds = new Float32Array(MAX_PARTICLES)
    const basePositions = new Float32Array(MAX_PARTICLES * 3)

    for (let i = 0; i < MAX_PARTICLES; i++) {
      const node = aiCompanies.length > 0 ? aiCompanies[i % aiCompanies.length] : { position: [0, 0, 0] }
      const angle = Math.random() * Math.PI * 2
      const radius = 0.2 + Math.random() * 0.6
      const height = Math.random() * 1.1

      const bx = node.position[0] + Math.cos(angle) * radius
      const by = node.position[1] + height
      const bz = node.position[2] + Math.sin(angle) * radius

      basePositions[i * 3] = bx
      basePositions[i * 3 + 1] = by
      basePositions[i * 3 + 2] = bz
      positions[i * 3] = bx
      positions[i * 3 + 1] = by
      positions[i * 3 + 2] = bz
      seeds[i] = Math.random() * Math.PI * 2
    }

    return { positions, seeds, basePositions }
  }, [aiCompanies])

  const activeCount = Math.max(30, Math.round((aiActivity / 100) * MAX_PARTICLES))

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    const posAttr = pointsRef.current.geometry.attributes.position
    const t = clock.elapsedTime

    for (let i = 0; i < activeCount; i++) {
      const seed = seeds[i]
      const bx = basePositions[i * 3]
      const by = basePositions[i * 3 + 1]
      const bz = basePositions[i * 3 + 2]

      posAttr.array[i * 3] = bx + Math.sin(t * 1.4 + seed) * 0.08
      posAttr.array[i * 3 + 1] = by + Math.sin(t * 2.1 + seed * 2) * 0.15 + 0.1
      posAttr.array[i * 3 + 2] = bz + Math.cos(t * 1.4 + seed) * 0.08
    }

    posAttr.needsUpdate = true
    pointsRef.current.geometry.setDrawRange(0, activeCount)
  })

  if (!visible) return null

  return (
    <group>
      {aiCompanies.length > 0 && (
        <NodeField nodes={aiCompanies} type="AICompany" pulseSpeed={2.6} />
      )}

      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={PALETTE.green}
          size={0.035}
          transparent
          opacity={0.55}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}

export default memo(AIActivity)
