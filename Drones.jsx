import { memo, useMemo } from 'react'
import { Sky, Stars } from '@react-three/drei'
import { useTechData } from '../hooks/useTechData.js'
import { PALETTE } from '../utils/colors.js'

/**
 * Weather owns the "atmosphere" of the scene: procedural sky, sun/moon
 * position derived from the timeOfDay slider (0-24h), a starfield at
 * night, and distance fog that shifts color between day and night
 * palettes. This keeps all lighting-adjacent environment concerns out of
 * Scene.jsx so it can stay focused on composition.
 */
function Weather() {
  const timeOfDay = useTechData((s) => s.timeOfDay)
  const isNightMode = useTechData((s) => s.isNightMode)

  // Map 0-24h to a sun elevation angle: noon (12h) = highest, midnight = lowest.
  const sunPosition = useMemo(() => {
    const angle = ((timeOfDay - 6) / 24) * Math.PI * 2 // sunrise ~6am at horizon
    const elevation = Math.sin(angle)
    const azimuth = Math.cos(angle)
    return [azimuth * 60, Math.max(elevation * 40, -5), 30]
  }, [timeOfDay])

  const fogColor = isNightMode ? PALETTE.backgroundNight : PALETTE.backgroundDay

  return (
    <group>
      <Sky
        sunPosition={sunPosition}
        turbidity={isNightMode ? 2 : 6}
        rayleigh={isNightMode ? 0.2 : 1.2}
        mieCoefficient={0.01}
        mieDirectionalG={0.8}
      />
      {isNightMode && <Stars radius={90} depth={40} count={3000} factor={2.5} saturation={0} fade speed={0.4} />}
      <fog attach="fog" args={[fogColor, 18, isNightMode ? 55 : 70]} />
    </group>
  )
}

export default memo(Weather)
