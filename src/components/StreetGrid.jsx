import { memo, Suspense } from 'react'
import { Line, Text } from '@react-three/drei'
import { useTechData } from '../hooks/useTechData.js'
import labelFont from '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-600-normal.woff'

/**
 * StreetGrid overlays Miami's major corridors on the base map — the named
 * roads people actually orient by (I-95, US-1, Calle Ocho, Biscayne Blvd)
 * — as subtle glowing polylines with flat street-name labels lying on the
 * ground. Positions are stylized to match this map's abstract geography
 * (see MiamiMap.jsx), not GIS traces: each road passes the landmarks it
 * passes in real life (US-1 by UM, Dolphin Expwy to the airport,
 * MacArthur Causeway out to the beach island).
 */
const STREETS = [
  { name: 'I-95', width: 2.2, points: [[1.2, -17], [1.6, -8], [1.8, 0], [2.2, 7]] },
  { name: 'US-1 · S DIXIE HWY', width: 1.8, points: [[2.2, 7], [3.2, 11], [2.2, 15], [0, 18.5]] },
  { name: 'BISCAYNE BLVD', width: 1.4, points: [[7.4, 9], [8.2, 3], [8.8, -4], [8.2, -12]] },
  { name: 'SW 8TH ST · CALLE OCHO', width: 1.4, points: [[-15, 8], [-6, 8.2], [4, 8.4]] },
  { name: 'FLAGLER ST', width: 1.2, points: [[-15, 5.5], [-5, 5.6], [5, 5.7]] },
  { name: 'DOLPHIN EXPWY · SR 836', width: 1.8, points: [[-12, 2.8], [-4, 3], [4.5, 3.2]] },
  { name: 'PALMETTO EXPWY · SR 826', width: 1.8, points: [[-10.5, -14], [-10, -4], [-10, 6], [-10.5, 14]] },
  { name: 'MACARTHUR CSWY', width: 1.4, points: [[5.5, 4.4], [9, 3.6], [12.8, 2.6]] }
]

function StreetGrid() {
  const isNightMode = useTechData((s) => s.isNightMode)
  const visible = useTechData((s) => s.layerFilters.Streets)

  if (!visible) return null

  const lineColor = isNightMode ? '#2e8aa8' : '#4d7f94'
  const labelColor = isNightMode ? '#8fd7ec' : '#2c5568'

  return (
    <group>
      {STREETS.map((street) => (
        <Line
          key={street.name}
          points={street.points.map(([x, z]) => [x, 0.015, z])}
          color={lineColor}
          lineWidth={street.width}
          transparent
          opacity={isNightMode ? 0.4 : 0.5}
        />
      ))}
      <Suspense fallback={null}>
        {STREETS.map((street) => (
          <StreetLabel key={street.name} street={street} color={labelColor} night={isNightMode} />
        ))}
      </Suspense>
    </group>
  )
}

/**
 * Flat street-name label at the road's midpoint, rotated to run along the
 * road's overall direction and flipped when needed so it never reads
 * upside-down from the default (south-of-map) camera.
 */
function StreetLabel({ street, color, night }) {
  const pts = street.points
  const mid = pts[Math.floor(pts.length / 2)]

  let [x0, z0] = pts[0]
  let [x1, z1] = pts[pts.length - 1]
  if (x1 < x0 || (x1 === x0 && z1 > z0)) {
    ;[x0, z0, x1, z1] = [x1, z1, x0, z0]
  }
  const theta = Math.atan2(-(z1 - z0), x1 - x0)

  return (
    <Text
      font={labelFont}
      position={[mid[0], 0.03, mid[1]]}
      rotation={[-Math.PI / 2, 0, theta]}
      fontSize={0.52}
      letterSpacing={0.25}
      color={color}
      anchorX="center"
      anchorY="middle"
      fillOpacity={night ? 0.55 : 0.7}
    >
      {street.name}
    </Text>
  )
}

export default memo(StreetGrid)
