import { Suspense, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import { useTechData } from '../hooks/useTechData.js'
import { pulseScale, bobOffset } from '../utils/animations.js'
import { getNodeType, displayLabel } from '../utils/nodeShapes.js'
// Bundled locally (troika reads .woff, not .woff2) so labels never depend
// on a font CDN at runtime — matches the HUD's monospace look.
import labelFont from '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-600-normal.woff'

const DUMMY = new THREE.Object3D()
const FLAT = -Math.PI / 2

/**
 * NodeField is the shared rendering primitive behind every category of
 * location marker. Category is encoded redundantly — a distinct 3D
 * silhouette (from nodeShapes.js) AND a distinct color — so markers are
 * tellable apart at a glance without hovering. Each marker renders as a
 * proper map pin, not a floating dot:
 *  - an instanced category-shaped core hovering at the category altitude
 *  - a matching translucent halo shell
 *  - a thin stem + ground ring anchoring it to its exact map location
 *  - an always-on billboarded name label (toggleable via the Legend)
 *  - a rich holographic card for the hovered/selected node only (Html
 *    labels are DOM elements, so we cap how many render simultaneously)
 *
 * Consumers just pass `nodes` + `type` and get consistent selection,
 * search dimming, and legend-driven spotlighting for free.
 */
export default function NodeField({ nodes, type, labelField = 'name', pulseSpeed = 2 }) {
  const coreRef = useRef()
  const haloRef = useRef()
  const stemRef = useRef()
  const baseRef = useRef()
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const selectedNodeId = useTechData((s) => s.selectedNodeId)
  const searchQuery = useTechData((s) => s.searchQuery)
  const selectNode = useTechData((s) => s.selectNode)
  const highlightType = useTechData((s) => s.highlightType)
  const showLabels = useTechData((s) => s.showLabels)

  const spec = getNodeType(type)
  const { color, shape, altitude } = spec

  const { baseColor, dimColor, dimHalo } = useMemo(() => {
    const base = new THREE.Color(color)
    return {
      baseColor: base,
      dimColor: base.clone().multiplyScalar(0.22),
      dimHalo: base.clone().multiplyScalar(0.12)
    }
  }, [color])

  const matchesSearch = useMemo(() => {
    if (!searchQuery.trim()) return null
    const q = searchQuery.trim().toLowerCase()
    return nodes.map((n) => (n[labelField] || '').toLowerCase().includes(q))
  }, [nodes, searchQuery, labelField])

  const isSpotlit = highlightType === null || highlightType === type
  const isNodeDimmed = (i) => (matchesSearch && matchesSearch[i] === false) || !isSpotlit

  useFrame(({ clock }) => {
    if (!coreRef.current || !haloRef.current || !stemRef.current || !baseRef.current) return
    const t = clock.elapsedTime

    nodes.forEach((node, i) => {
      const isHovered = hoveredIndex === i
      const isSelected = selectedNodeId === node.id
      const isDimmed = isNodeDimmed(i)
      const emphasis = isHovered || isSelected ? 1.5 : 1

      const bob = bobOffset(t, 0.8, 0.1, i * 1.7)
      const scale = pulseScale(t, pulseSpeed, 0.9, 1.1, i * 2.1) * emphasis * (isDimmed ? 0.55 : 1)
      const y = node.position[1] + altitude + bob

      // Core: category silhouette, slowly rotating so the 3D shape reads
      // from every camera angle. Rings lie flat and wobble instead.
      DUMMY.position.set(node.position[0], y, node.position[2])
      if (shape === 'ring') {
        DUMMY.rotation.set(FLAT + Math.sin(t * 0.9 + i) * 0.18, 0, 0)
      } else {
        DUMMY.rotation.set(0, t * 0.5 + i * 0.9, 0)
      }
      DUMMY.scale.setScalar(scale)
      DUMMY.updateMatrix()
      coreRef.current.setMatrixAt(i, DUMMY.matrix)

      DUMMY.scale.setScalar(scale * 1.45)
      DUMMY.updateMatrix()
      haloRef.current.setMatrixAt(i, DUMMY.matrix)

      // Stem: pins the floating marker to its exact ground coordinate.
      DUMMY.rotation.set(0, 0, 0)
      DUMMY.position.set(node.position[0], y / 2, node.position[2])
      DUMMY.scale.set(1, Math.max(y - 0.1, 0.05), 1)
      DUMMY.updateMatrix()
      stemRef.current.setMatrixAt(i, DUMMY.matrix)

      // Ground ring at the true map location.
      DUMMY.position.set(node.position[0], 0.025, node.position[2])
      DUMMY.rotation.set(FLAT, 0, 0)
      DUMMY.scale.setScalar(isDimmed ? 0.6 : 1)
      DUMMY.updateMatrix()
      baseRef.current.setMatrixAt(i, DUMMY.matrix)

      if (isDimmed) {
        coreRef.current.setColorAt(i, dimColor)
        haloRef.current.setColorAt(i, dimHalo)
      } else {
        coreRef.current.setColorAt(i, baseColor)
        haloRef.current.setColorAt(i, isHovered || isSelected ? baseColor : dimHalo)
      }
    })

    coreRef.current.instanceMatrix.needsUpdate = true
    haloRef.current.instanceMatrix.needsUpdate = true
    stemRef.current.instanceMatrix.needsUpdate = true
    baseRef.current.instanceMatrix.needsUpdate = true
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
        <ShapeGeometry shape={shape} />
        <meshStandardMaterial
          emissive={color}
          emissiveIntensity={1.4}
          color={color}
          flatShading
          toneMapped={false}
        />
      </instancedMesh>

      <instancedMesh ref={haloRef} args={[null, null, nodes.length]}>
        <ShapeGeometry shape={shape} />
        <meshBasicMaterial color={color} transparent opacity={0.12} depthWrite={false} />
      </instancedMesh>

      <instancedMesh ref={stemRef} args={[null, null, nodes.length]}>
        <cylinderGeometry args={[0.018, 0.018, 1, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} depthWrite={false} />
      </instancedMesh>

      <instancedMesh ref={baseRef} args={[null, null, nodes.length]}>
        <ringGeometry args={[0.16, 0.22, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} depthWrite={false} />
      </instancedMesh>

      {/* Own Suspense boundary: Text suspends while its font parses, and
          that must never blank the whole scene (Scene.jsx wraps all layers
          in a single Suspense). */}
      {showLabels && (
        <Suspense fallback={null}>
          {nodes.map((node, i) => (
            <NameTag
              key={node.id}
              node={node}
              color={color}
              labelField={labelField}
              y={node.position[1] + altitude + 0.42}
              dimmed={isNodeDimmed(i)}
            />
          ))}
        </Suspense>
      )}

      {activeNode && <HoloLabel node={activeNode} spec={spec} labelField={labelField} />}
    </group>
  )
}

/** Maps a nodeShapes.js `shape` key to its instanced geometry. */
function ShapeGeometry({ shape }) {
  switch (shape) {
    case 'diamond':
      return <octahedronGeometry args={[0.26, 0]} />
    case 'tower':
      return <boxGeometry args={[0.28, 0.5, 0.28]} />
    case 'pyramid':
      return <coneGeometry args={[0.24, 0.48, 4]} />
    case 'core':
      return <icosahedronGeometry args={[0.24, 0]} />
    case 'stack':
      return <cylinderGeometry args={[0.2, 0.2, 0.42, 6]} />
    case 'ring':
      return <torusGeometry args={[0.2, 0.065, 10, 28]} />
    default:
      return <sphereGeometry args={[0.22, 16, 16]} />
  }
}

/**
 * Always-visible compact name label. SDF text (troika) is GPU-rendered, so
 * ~40 of these are far cheaper than DOM <Html> labels and never hurt frame
 * pacing. Dark outline keeps them readable over the glowing grid.
 */
function NameTag({ node, color, labelField, y, dimmed }) {
  return (
    <Billboard position={[node.position[0], y, node.position[2]]}>
      <Text
        font={labelFont}
        fontSize={0.21}
        color={color}
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.016}
        outlineColor="#02090f"
        fillOpacity={dimmed ? 0.12 : 0.95}
        outlineOpacity={dimmed ? 0.08 : 0.8}
      >
        {displayLabel(node, labelField)}
      </Text>
    </Billboard>
  )
}

/** Floating holographic detail card shown above a hovered/selected node. */
function HoloLabel({ node, spec, labelField }) {
  const [x, y, z] = node.position
  const { color, icon, label } = spec
  return (
    <Billboard position={[x, y + 1.9, z]}>
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
            {icon} {label.toUpperCase()}
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
