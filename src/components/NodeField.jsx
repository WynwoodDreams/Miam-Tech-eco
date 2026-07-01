import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import { useTechData } from '../hooks/useTechData.js'
import { pulseScale, bobOffset } from '../utils/animations.js'

const DUMMY = new THREE.Object3D()

/**
 * NodeField is the shared rendering primitive behind every category of
 * location marker (universities, employers, startups, AI companies,
 * events). It renders:
 *  - an instanced glowing core sphere per node (single draw call/type)
 *  - an instanced pulsing halo ring per node
 *  - a floating holographic label for the hovered/selected node only
 *    (Html labels are DOM elements, so we intentionally cap how many
 *    render simultaneously to protect frame rate)
 *
 * Consumers just pass `nodes` (array from the store) + a `labelField` +
 * `color` and get consistent behavior, selection, and search-highlighting
 * for free.
 */
export default function NodeField({ nodes, color, labelField = 'name', iconChar = '●', pulseSpeed = 2 }) {
  const coreRef = useRef()
  const haloRef = useRef()
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const selectedNodeId = useTechData((s) => s.selectedNodeId)
  const searchQuery = useTechData((s) => s.searchQuery)
  const selectNode = useTechData((s) => s.selectNode)

  const baseColor = useMemo(() => new THREE.Color(color), [color])

  const matchesSearch = useMemo(() => {
    if (!searchQuery.trim()) return null
    const q = searchQuery.trim().toLowerCase()
    return nodes.map((n) => (n[labelField] || '').toLowerCase().includes(q))
  }, [nodes, searchQuery, labelField])

  useFrame(({ clock }) => {
    if (!coreRef.current || !haloRef.current) return
    const t = clock.elapsedTime

    nodes.forEach((node, i) => {
      const isHovered = hoveredIndex === i
      const isSelected = selectedNodeId === node.id
      const isDimmed = matchesSearch && matchesSearch[i] === false
      const emphasis = isHovered || isSelected ? 1.6 : 1

      const bob = bobOffset(t, 0.8, 0.12, i * 1.7)
      const scale = pulseScale(t, pulseSpeed, 0.85, 1.15, i * 2.1) * emphasis

      DUMMY.position.set(node.position[0], node.position[1] + 0.4 + bob, node.position[2])
      DUMMY.scale.setScalar((isDimmed ? 0.5 : 1) * scale)
      DUMMY.updateMatrix()
      coreRef.current.setMatrixAt(i, DUMMY.matrix)

      DUMMY.scale.setScalar((isDimmed ? 0.5 : 1) * scale * 1.4)
      DUMMY.updateMatrix()
      haloRef.current.setMatrixAt(i, DUMMY.matrix)

      if (isDimmed) {
        coreRef.current.setColorAt(i, baseColor.clone().multiplyScalar(0.25))
        haloRef.current.setColorAt(i, baseColor.clone().multiplyScalar(0.15))
      } else {
        coreRef.current.setColorAt(i, baseColor)
        haloRef.current.setColorAt(i, baseColor.clone().multiplyScalar(isHovered || isSelected ? 0.9 : 0.5))
      }
    })

    coreRef.current.instanceMatrix.needsUpdate = true
    haloRef.current.instanceMatrix.needsUpdate = true
    if (coreRef.current.instanceColor) coreRef.current.instanceColor.needsUpdate = true
    if (haloRef.current.instanceColor) haloRef.current.instanceColor.needsUpdate = true
  })

  const activeNode = hoveredIndex !== null ? nodes[hoveredIndex] : nodes.find((n) => n.id === selectedNodeId)

  return (
    <group>
      <instancedMesh
        ref={coreRef}
        args={[null, null, nodes.length]}
        onPointerOver={(e) => {
          e.stopPropagation()
          if (e.instanceId !== undefined) setHoveredIndex(e.instanceId)
        }}
        onPointerOut={() => setHoveredIndex(null)}
        onClick={(e) => {
          e.stopPropagation()
          if (e.instanceId === undefined) return
          const node = nodes[e.instanceId]
          selectNode(node.id, node.position)
        }}
      >
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial
          emissive={color}
          emissiveIntensity={1.4}
          color={color}
          toneMapped={false}
        />
      </instancedMesh>

      <instancedMesh ref={haloRef} args={[null, null, nodes.length]}>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} depthWrite={false} />
      </instancedMesh>

      {activeNode && (
        <HoloLabel node={activeNode} color={color} labelField={labelField} iconChar={iconChar} />
      )}
    </group>
  )
}

/** Floating holographic label card shown above a hovered/selected node. */
function HoloLabel({ node, color, labelField, iconChar }) {
  const [x, y, z] = node.position
  return (
    <Billboard position={[x, y + 1.6, z]}>
      <Html center distanceFactor={9} occlude={false} zIndexRange={[10, 0]}>
        <div
          style={{
            pointerEvents: 'none',
            padding: '8px 12px',
            minWidth: 160,
            background: 'rgba(3, 12, 20, 0.82)',
            border: `1px solid ${color}`,
            borderRadius: 6,
            color: '#e8fbff',
            fontFamily: "'Consolas', 'JetBrains Mono', monospace",
            fontSize: 12,
            boxShadow: `0 0 18px ${color}66`,
            backdropFilter: 'blur(3px)',
            whiteSpace: 'nowrap'
          }}
        >
          <div style={{ color, fontSize: 10, letterSpacing: 1, marginBottom: 2 }}>
            {iconChar} {node.type?.toUpperCase()}
          </div>
          <div style={{ fontWeight: 600 }}>{node[labelField]}</div>
          {node.isLive && (
            <div style={{ color: 'var(--hud-green)', fontSize: 9, marginTop: 2 }}>
              ● LIVE — {node.openRoles ?? 0} open role{node.openRoles === 1 ? '' : 's'}
            </div>
          )}
          {node.description && (
            <div style={{ opacity: 0.75, fontSize: 10, marginTop: 4, maxWidth: 220, whiteSpace: 'normal' }}>
              {node.description}
            </div>
          )}
        </div>
      </Html>
    </Billboard>
  )
}
