import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Billboard, Text } from '@react-three/drei'
import { RoundedBoxGeometry } from 'three-stdlib'
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
  const geometry = useShapeGeometry(shape)

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
        <primitive object={geometry} attach="geometry" />
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.05}
          roughness={0.25}
          metalness={0.15}
          clearcoat={0.8}
          clearcoatRoughness={0.3}
          flatShading={FLAT_SHADED.has(shape)}
          toneMapped={false}
        />
      </instancedMesh>

      <instancedMesh ref={haloRef} args={[null, null, nodes.length]}>
        <primitive object={geometry} attach="geometry" />
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

/** Shapes that keep hard gem-like facets; the rest shade smooth. */
const FLAT_SHADED = new Set(['diamond', 'pyramid', 'core'])

/**
 * Builds the refined per-category geometry (shared by the core and halo
 * instanced meshes). These are deliberately higher-fidelity than raw
 * primitives — beveled edges, elongated gem proportions, a grooved
 * server-stack profile — so markers read as crafted objects rather than
 * blocky low-poly placeholders.
 */
function useShapeGeometry(shape) {
  const geometry = useMemo(() => {
    switch (shape) {
      case 'diamond': {
        // Elongated octahedron — a cut-gem campus beacon
        const g = new THREE.OctahedronGeometry(0.24, 0)
        g.scale(1, 1.4, 1)
        return g
      }
      case 'tower':
        // Soft-beveled corporate tower
        return new RoundedBoxGeometry(0.3, 0.56, 0.3, 4, 0.05)
      case 'pyramid': {
        // Square pyramid, rotated so a face (not an edge) greets the camera
        const g = new THREE.ConeGeometry(0.26, 0.52, 4, 1)
        g.rotateY(Math.PI / 4)
        return g
      }
      case 'core':
        // One subdivision keeps the faceted "compute core" look but
        // rounds the silhouette
        return new THREE.IcosahedronGeometry(0.25, 1)
      case 'stack': {
        // Lathe a grooved profile: three stacked server slabs
        const pts = []
        const R = 0.21
        const r = 0.165
        const h = 0.46
        const slabs = 3
        const slabH = h / slabs
        pts.push(new THREE.Vector2(0.0001, -h / 2))
        for (let s = 0; s < slabs; s++) {
          const y0 = -h / 2 + s * slabH
          const y1 = y0 + slabH
          pts.push(new THREE.Vector2(R, y0 + 0.01))
          pts.push(new THREE.Vector2(R, y1 - 0.03))
          pts.push(new THREE.Vector2(r, y1 - 0.024))
          pts.push(new THREE.Vector2(r, y1 - 0.004))
        }
        pts.push(new THREE.Vector2(0.0001, h / 2))
        return new THREE.LatheGeometry(pts, 28)
      }
      case 'ring':
        return new THREE.TorusGeometry(0.2, 0.06, 16, 48)
      default:
        return new THREE.SphereGeometry(0.22, 24, 24)
    }
  }, [shape])

  // <primitive> objects aren't auto-disposed by R3F on unmount
  useEffect(() => () => geometry.dispose(), [geometry])

  return geometry
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
