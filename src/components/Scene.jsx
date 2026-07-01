import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette, N8AO } from '@react-three/postprocessing'
import { useTechData } from '../hooks/useTechData.js'
import { PALETTE } from '../utils/colors.js'

import MiamiMap from './MiamiMap.jsx'
import UniversityNodes from './UniversityNodes.jsx'
import EmployerNodes from './EmployerNodes.jsx'
import StartupNodes from './StartupNodes.jsx'
import AIActivity from './AIActivity.jsx'
import TalentFlow from './TalentFlow.jsx'
import DataStreams from './DataStreams.jsx'
import EventPulses from './EventPulses.jsx'
import Drones from './Drones.jsx'
import Weather from './Weather.jsx'
import CameraController from './CameraController.jsx'

/**
 * Scene is the single R3F <Canvas> root. It owns lighting + post-processing
 * (both of which need scene-wide context) and composes every visualization
 * layer as sibling components. Each layer independently reads the store and
 * decides its own visibility/behavior, so Scene itself stays a thin,
 * declarative composition root — easy to reorder or extend.
 */
export default function Scene() {
  const isNightMode = useTechData((s) => s.isNightMode)

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: 42, near: 0.1, far: 200, position: [16, 24, 22] }}
    >
      <color attach="background" args={[isNightMode ? PALETTE.backgroundNight : PALETTE.backgroundDay]} />

      <SceneLighting isNightMode={isNightMode} />

      <Suspense fallback={null}>
        <Weather />
        <MiamiMap />
        <UniversityNodes />
        <EmployerNodes />
        <StartupNodes />
        <AIActivity />
        <TalentFlow />
        <DataStreams />
        <EventPulses />
        <Drones />
      </Suspense>

      <CameraController />

      <EffectComposer multisampling={0}>
        <N8AO aoRadius={2} intensity={0.6} distanceFalloff={1} />
        <Bloom
          mipmapBlur
          luminanceThreshold={0.45}
          luminanceSmoothing={0.3}
          intensity={isNightMode ? 0.75 : 0.45}
          radius={0.55}
        />
        <Vignette eskil={false} offset={0.15} darkness={isNightMode ? 0.7 : 0.4} />
      </EffectComposer>
    </Canvas>
  )
}

/** Dynamic lighting rig that shifts intensity/color between day and night. */
function SceneLighting({ isNightMode }) {
  return (
    <>
      <ambientLight intensity={isNightMode ? 0.15 : 0.55} color={isNightMode ? '#0a2a3f' : '#fff4e0'} />
      <directionalLight
        position={isNightMode ? [-10, 18, -6] : [20, 30, 10]}
        intensity={isNightMode ? 0.35 : 1.4}
        color={isNightMode ? '#89c9ff' : '#fff1d6'}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={80}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      {/* Rim lights reinforcing the neon "mission control" aesthetic at night */}
      {isNightMode && (
        <>
          <pointLight position={[0, 6, 0]} intensity={5} color={PALETTE.cyan} distance={30} decay={2} />
          <pointLight position={[10, 4, -10]} intensity={3.5} color={PALETTE.pink} distance={25} decay={2} />
          <pointLight position={[-10, 4, 10]} intensity={3.5} color={PALETTE.purple} distance={25} decay={2} />
        </>
      )}
    </>
  )
}
