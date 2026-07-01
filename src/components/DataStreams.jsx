import { memo, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { useTechData } from '../hooks/useTechData.js'
import { buildArcCurve } from '../utils/math.js'
import { PALETTE } from '../utils/colors.js'
import FlowParticles from './FlowParticles.jsx'

/**
 * DataStreams visualizes network/compute traffic radiating from physical
 * data centers: a vertical "uplink" beam whose height and flicker speed
 * scale with the `traffic` slider, plus animated connection lines out to
 * nearby AI companies and startup hubs representing live data exchange.
 */
function DataStreams() {
  const dataCenters = useTechData((s) => s.dataCenters)
  const aiCompanies = useTechData((s) => s.startups.filter((n) => n.type === 'AICompany'))
  const traffic = useTechData((s) => s.traffic)
  const visible = useTechData((s) => s.layerFilters.DataCenter)

  const beamRefs = useRef([])

  const links = useMemo(() => {
    const result = []
    for (const dc of dataCenters) {
      const nearestAI = [...aiCompanies].sort(
        (a, b) => distSq(dc.position, a.position) - distSq(dc.position, b.position)
      )[0]
      if (nearestAI) {
        result.push({ id: `${dc.id}-${nearestAI.id}`, curve: buildArcCurve(dc.position, nearestAI.position, 0.9) })
      }
    }
    return result
  }, [dataCenters, aiCompanies])

  useFrame(({ clock }) => {
    const intensity = 0.4 + (traffic / 100) * 1.6
    beamRefs.current.forEach((mesh) => {
      if (!mesh) return
      const flicker = 0.7 + 0.3 * Math.sin(clock.elapsedTime * (4 + intensity * 3) + mesh.position.x)
      mesh.scale.y = intensity * flicker
      mesh.material.opacity = 0.35 + (traffic / 100) * 0.45 * flicker
    })
  })

  if (!visible) return null

  return (
    <group>
      {dataCenters.map((dc, i) => (
        <mesh
          key={dc.id}
          ref={(el) => (beamRefs.current[i] = el)}
          position={[dc.position[0], 1.5, dc.position[2]]}
        >
          <cylinderGeometry args={[0.05, 0.12, 3, 8, 1, true]} />
          <meshBasicMaterial
            color={PALETTE.amber}
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}

      {links.map((link) => (
        <group key={link.id}>
          <Line points={link.curve.getPoints(20)} color={PALETTE.amber} lineWidth={1} transparent opacity={0.3} />
          <FlowParticles curve={link.curve} count={4} color={PALETTE.amber} speed={0.25 + traffic / 300} size={0.04} />
        </group>
      ))}
    </group>
  )
}

function distSq(a, b) {
  const dx = a[0] - b[0]
  const dz = a[2] - b[2]
  return dx * dx + dz * dz
}

export default memo(DataStreams)
