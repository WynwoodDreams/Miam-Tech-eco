import { Suspense, useEffect } from 'react'
import Scene from './components/Scene.jsx'
import HUD from './components/HUD.jsx'
import Sidebar from './components/Sidebar.jsx'
import ControlPanel from './components/ControlPanel.jsx'
import StatsPanel from './components/StatsPanel.jsx'
import Timeline from './components/Timeline.jsx'
import Legend from './components/Legend.jsx'
import { useTechData } from './hooks/useTechData.js'
import './styles/hud.css'

/**
 * App composes the full experience: the R3F <Scene> fills the viewport as
 * a backdrop, and every UI panel (HUD, Sidebar, ControlPanel, StatsPanel,
 * Timeline) is absolutely positioned on top of it inside a non-blocking
 * overlay layer. Panels individually opt back into pointer events so the
 * empty space between them still lets OrbitControls receive drag/scroll.
 */
export default function App() {
  const loadLiveData = useTechData((s) => s.loadLiveData)

  useEffect(() => {
    loadLiveData()
  }, [loadLiveData])

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#030712' }}>
      <Suspense fallback={<LoadingScreen />}>
        <Scene />
      </Suspense>

      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <HUD />
        <Sidebar />
        <ControlPanel />
        <StatsPanel />
        <Timeline />
        <Legend />
      </div>
    </div>
  )
}

/** Simple branded loading screen shown while Three.js/assets initialize. */
function LoadingScreen() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#030712',
        color: '#38e0ff',
        fontFamily: "'Consolas', 'JetBrains Mono', monospace",
        letterSpacing: 2
      }}
    >
      <div style={{ fontSize: 14, marginBottom: 12 }}>INITIALIZING DIGITAL TWIN…</div>
      <div style={{ width: 220, height: 3, background: 'rgba(56,224,255,0.15)', borderRadius: 2, overflow: 'hidden' }}>
        <div
          style={{
            width: '40%',
            height: '100%',
            background: '#38e0ff',
            boxShadow: '0 0 10px #38e0ff',
            animation: 'loading-sweep 1.1s ease-in-out infinite'
          }}
        />
      </div>
      <style>{`
        @keyframes loading-sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </div>
  )
}
