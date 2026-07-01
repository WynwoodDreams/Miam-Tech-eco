import { memo, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useTechData } from '../hooks/useTechData.js'
import { buildPatrolCurve, seededRandom } from '../utils/math.js'
import { PALETTE } from '../utils/colors.js'

const DRONE_COUNT = 8

/**
 * Drones renders a small fleet of autonomous patrol units flying smooth
 * looping paths above the city (built from the region's real node
 * positions so patrols naturally weave between hubs). Each drone carries
 * a downward scanning beam. Purely decorative/atmospheric — reinforces the
 * "mission control" feel — but built with instancing-friendly patterns so
 * the fleet size can grow without a rendering rewrite.
 */
function Drones() {
  const universities = useTechData((s) => s.universities)
  const startups = useTechData((s) => s.startups)
  const employers = useTechData((s) => s.employers)
  const visible = useTechData((s) => s.layerFilters.Drones)

  const groupRefs = useRef([])
  const beamRefs = useRef([])

  const patrolCurves = useMemo(() => {
    const landmarks = [...universities, ...startups, ...employers].map((n) => n.position)
    if (landmarks.length < 3) return []

    const curves = []
    for (let d = 0; d < DRONE_COUNT; d++) {
      // Each drone gets a deterministic-but-varied loop through a shuffled
      // subset of landmarks, lifted to flight altitude.
      const shuffled = [...landmarks]
        .sort(() => seededRandom(`drone-${d}-${landmarks.length}`) - 0.5)
        .slice(0, 5)
        .map(([x, , z]) => [x + (seededRandom(`${d}-${x}`) - 0.5) * 2, 3.5 + seededRandom(`${d}-${z}`) * 2, z])
      curves.push(buildPatrolCurve(shuffled))
    }
    return curves
  }, [universities, startups, employers])

  useFrame(({ clock }) => {
    if (patrolCurves.length === 0) return
    const t = clock.elapsedTime

    patrolCurves.forEach((curve, i) => {
      const group = groupRefs.current[i]
      const beam = beamRefs.current[i]
      if (!group) return

      const speed = 0.03 + (i % 3) * 0.008
      const progress = ((t * speed + i / DRONE_COUNT) % 1 + 1) % 1
      const point = curve.getPoint(progress)
      const lookAhead = curve.getPoint((progress + 0.01) % 1)

      group.position.copy(point)
      group.lookAt(lookAhead)
      // Subtle hover bob layered on top of the patrol path.
      group.position.y += Math.sin(t * 3 + i) * 0.08

      if (beam) {
        beam.material.opacity = 0.25 + Math.abs(Math.sin(t * 2 + i)) * 0.15
      }
    })
  })

  if (!visible || patrolCurves.length === 0) return null

  return (
    <group>
      {patrolCurves.map((_, i) => (
        <group key={i} ref={(el) => (groupRefs.current[i] = el)}>
          {/* Drone body */}
          <mesh>
            <boxGeometry args={[0.18, 0.05, 0.18]} />
            <meshStandardMaterial color={PALETTE.white} emissive={PALETTE.cyan} emissiveIntensity={0.6} />
          </mesh>
          {/* Rotor glow points */}
          {[
            [0.12, 0, 0.12],
            [-0.12, 0, 0.12],
            [0.12, 0, -0.12],
            [-0.12, 0, -0.12]
          ].map((pos, r) => (
            <mesh key={r} position={pos}>
              <sphereGeometry args={[0.03, 6, 6]} />
              <meshBasicMaterial color={PALETTE.cyan} toneMapped={false} />
            </mesh>
          ))}
          {/* Downward scanning beam */}
          <mesh ref={(el) => (beamRefs.current[i] = el)} position={[0, -1.2, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.35, 2.4, 16, 1, true]} />
            <meshBasicMaterial
              color={PALETTE.cyan}
              transparent
              opacity={0.25}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export default memo(Drones)
