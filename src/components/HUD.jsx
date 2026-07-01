import { memo, useEffect, useRef, useState } from 'react'
import { useTechData } from '../hooks/useTechData.js'

/**
 * HUD renders the always-visible top overlay: system title, a live
 * simulated clock derived from the timeOfDay slider, an FPS counter
 * (measured independently of R3F via requestAnimationFrame so it reflects
 * true browser frame pacing), and a compact readout for whatever node is
 * currently selected.
 */
function HUD() {
  const timeOfDay = useTechData((s) => s.timeOfDay)
  const isNightMode = useTechData((s) => s.isNightMode)
  const selectedNodeId = useTechData((s) => s.selectedNodeId)
  const getAllNodes = useTechData((s) => s.getAllNodes)
  const clearSelection = useTechData((s) => s.clearSelection)

  const fps = useFpsCounter()
  const selectedNode = selectedNodeId ? getAllNodes().find((n) => n.id === selectedNodeId) : null

  const hours = Math.floor(timeOfDay)
  const minutes = Math.floor((timeOfDay % 1) * 60)
  const clockLabel = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '16px 20px',
        pointerEvents: 'none',
        zIndex: 20
      }}
    >
      <div className="hud-panel" style={{ padding: '10px 16px', pointerEvents: 'auto' }}>
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 1 }}>
          MIAMI TECH ECOSYSTEM <span style={{ color: 'var(--hud-cyan)' }}>// DIGITAL TWIN</span>
        </div>
        <div className="hud-label" style={{ marginTop: 2 }}>
          MISSION CONTROL v1.0 — LIVE SIMULATION
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, pointerEvents: 'auto' }}>
        {selectedNode && (
          <div className="hud-panel" style={{ padding: '10px 14px', maxWidth: 260 }}>
            <div className="hud-label">SELECTED NODE</div>
            <div style={{ fontWeight: 600, fontSize: 13, margin: '2px 0' }}>{selectedNode.name}</div>
            <div className="hud-value" style={{ opacity: 0.7, fontSize: 11 }}>{selectedNode.type}</div>
            <button className="hud-button" style={{ marginTop: 8 }} onClick={clearSelection}>
              CLEAR ✕
            </button>
          </div>
        )}

        <div className="hud-panel" style={{ padding: '10px 16px', textAlign: 'right', minWidth: 130 }}>
          <div className="hud-label">{isNightMode ? 'NIGHT MODE' : 'DAY MODE'}</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--hud-cyan)' }}>{clockLabel}</div>
          <div className="hud-label" style={{ marginTop: 4 }}>
            {fps} FPS
          </div>
        </div>
      </div>
    </div>
  )
}

/** Measures real render FPS via requestAnimationFrame, sampled every ~500ms. */
function useFpsCounter() {
  const [fps, setFps] = useState(60)
  const frames = useRef(0)
  const lastSample = useRef(performance.now())

  useEffect(() => {
    let rafId
    const tick = () => {
      frames.current += 1
      const now = performance.now()
      const elapsed = now - lastSample.current
      if (elapsed >= 500) {
        setFps(Math.round((frames.current * 1000) / elapsed))
        frames.current = 0
        lastSample.current = now
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  return fps
}

export default memo(HUD)
