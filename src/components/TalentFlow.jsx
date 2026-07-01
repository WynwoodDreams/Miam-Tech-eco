import { memo, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useTechData } from '../hooks/useTechData.js'
import { buildArcCurve } from '../utils/math.js'
import { PALETTE } from '../utils/colors.js'

const DUMMY = new THREE.Object3D()
const PARTICLES_PER_CORRIDOR = 8

/**
 * TalentFlow visualizes the broad, ambient movement of talent between
 * every university and every startup/employer hub as glowing particles
 * gliding along arced curves — the atmospheric "there is constant motion
 * in this ecosystem" layer.
 *
 * Particle density and speed both scale with the `talentFlow` slider.
 */
function TalentFlow() {
  const universities = useTechData((s) => s.universities)
  const startups = useTechData((s) => s.startups)
  const employers = useTechData((s) => s.employers)
  const talentFlow = useTechData((s) => s.talentFlow)
  const visible = useTechData((s) => s.layerFilters.TalentFlow)

  const meshRef = useRef()

  // Build a fixed set of corridors: each university connects to its single
  // geographically nearest startup/employer destination. Computed once per
  // dataset change, not per frame. Kept to one link per university (rather
  // than the top few) so the ambient flow reads as a few clear threads
  // instead of a dense tangle of arcs.
  const corridors = useMemo(() => {
    const destinations = [...startups, ...employers]
    const links = []

    for (const uni of universities) {
      const nearest = [...destinations].sort(
        (a, b) => distanceSq(uni.position, a.position) - distanceSq(uni.position, b.position)
      )[0]
      if (nearest) {
        links.push(buildArcCurve(uni.position, nearest.position, 1.6 + Math.random() * 0.8))
      }
    }
    return links
  }, [universities, startups, employers])

  const totalParticles = corridors.length * PARTICLES_PER_CORRIDOR

  useFrame(({ clock }) => {
    if (!meshRef.current || corridors.length === 0) return
    const t = clock.elapsedTime
    const speed = 0.08 + (talentFlow / 100) * 0.35

    let idx = 0
    for (let c = 0; c < corridors.length; c++) {
      const curve = corridors[c]
      for (let p = 0; p < PARTICLES_PER_CORRIDOR; p++) {
        const offset = p / PARTICLES_PER_CORRIDOR
        const progress = ((t * speed + offset) % 1 + 1) % 1
        const point = curve.getPoint(progress)

        // Fade particles in/out near the ends for a softer arrival/departure.
        const edgeFade = Math.sin(progress * Math.PI)
        const scale = 0.045 + edgeFade * 0.035

        DUMMY.position.copy(point)
        DUMMY.scale.setScalar(scale)
        DUMMY.updateMatrix()
        meshRef.current.setMatrixAt(idx, DUMMY.matrix)
        idx++
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true
    meshRef.current.count = Math.round(totalParticles * Math.min(1, 0.25 + talentFlow / 100))
  })

  if (!visible || totalParticles === 0) return null

  return (
    <instancedMesh ref={meshRef} args={[null, null, totalParticles]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color={PALETTE.cyan} transparent opacity={0.65} toneMapped={false} />
    </instancedMesh>
  )
}

function distanceSq(a, b) {
  const dx = a[0] - b[0]
  const dz = a[2] - b[2]
  return dx * dx + dz * dz
}

export default memo(TalentFlow)
