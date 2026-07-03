import { memo, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useTechData } from '../hooks/useTechData.js'
import { PALETTE } from '../utils/colors.js'
import NodeField from './NodeField.jsx'

const RINGS_PER_EVENT = 3

/**
 * EventPulses renders tech events as glowing markers (via the shared
 * NodeField) plus expanding "radar ping" rings that represent event
 * density/activity. Ring emission rate scales with the `eventDensity`
 * slider — more events happening, more concentric pulses radiating out.
 */
function EventPulses() {
  const events = useTechData((s) => s.events)
  const visible = useTechData((s) => s.layerFilters.Event)
  const eventDensity = useTechData((s) => s.eventDensity)

  const ringRefs = useRef([])

  const ringData = useMemo(() => {
    const arr = []
    events.forEach((evt, eventIndex) => {
      for (let r = 0; r < RINGS_PER_EVENT; r++) {
        arr.push({ eventIndex, ringIndex: r })
      }
    })
    return arr
  }, [events])

  useFrame(({ clock }) => {
    const speed = 0.15 + (eventDensity / 100) * 0.6
    ringRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      const { eventIndex, ringIndex } = ringData[i]
      const event = events[eventIndex]
      if (!event) return

      const phase = ((clock.elapsedTime * speed + ringIndex / RINGS_PER_EVENT) % 1 + 1) % 1
      const scale = 0.3 + phase * 2.2
      mesh.position.set(event.position[0], 0.03, event.position[2])
      mesh.scale.set(scale, scale, scale)
      mesh.material.opacity = Math.max(0, 0.5 * (1 - phase)) * Math.max(0.15, eventDensity / 100)
    })
  })

  if (!visible || events.length === 0) return null

  return (
    <group>
      <NodeField nodes={events} type="Event" pulseSpeed={2.2} />
      {ringData.map((_, i) => (
        <mesh key={i} ref={(el) => (ringRefs.current[i] = el)} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.58, 32]} />
          <meshBasicMaterial
            color={PALETTE.orange}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

export default memo(EventPulses)
