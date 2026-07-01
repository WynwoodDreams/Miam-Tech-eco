import { memo, useMemo } from 'react'
import { useTechData } from '../hooks/useTechData.js'

/**
 * Timeline renders every tech event as a point along a horizontal date
 * axis. Clicking an event focuses the camera on it (via the shared
 * focusTarget mechanism) and selects it, so this component doubles as a
 * chronological alternative to browsing the map directly.
 */
function Timeline() {
  const events = useTechData((s) => s.events)
  const selectedNodeId = useTechData((s) => s.selectedNodeId)
  const selectNode = useTechData((s) => s.selectNode)
  const isPlaying = useTechData((s) => s.isPlaying)
  const togglePlayback = useTechData((s) => s.togglePlayback)

  const sorted = useMemo(
    () => [...events].sort((a, b) => new Date(a.date) - new Date(b.date)),
    [events]
  )

  const { minTime, maxTime } = useMemo(() => {
    const times = sorted.map((e) => new Date(e.date).getTime())
    return { minTime: Math.min(...times), maxTime: Math.max(...times) }
  }, [sorted])

  const span = Math.max(1, maxTime - minTime)

  return (
    <div
      className="hud-panel"
      style={{
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(720px, 60vw)',
        padding: '14px 20px',
        zIndex: 20,
        pointerEvents: 'auto'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div className="hud-label">TECH EVENTS TIMELINE — 2026</div>
        <button className="hud-button" onClick={togglePlayback}>
          {isPlaying ? '⏸' : '▶'}
        </button>
      </div>

      <div style={{ position: 'relative', height: 40 }}>
        <div
          style={{
            position: 'absolute',
            top: 18,
            left: 0,
            right: 0,
            height: 2,
            background: 'linear-gradient(90deg, rgba(56,224,255,0.1), rgba(56,224,255,0.5), rgba(56,224,255,0.1))'
          }}
        />
        {sorted.map((event) => {
          const t = (new Date(event.date).getTime() - minTime) / span
          const isSelected = selectedNodeId === event.id
          return (
            <button
              key={event.id}
              onClick={() => selectNode(event.id, event.position)}
              title={`${event.name} — ${event.date}`}
              style={{
                position: 'absolute',
                left: `${t * 100}%`,
                top: 8,
                transform: 'translateX(-50%)',
                width: isSelected ? 14 : 10,
                height: isSelected ? 14 : 10,
                borderRadius: '50%',
                background: 'var(--hud-orange)',
                border: isSelected ? '2px solid #fff' : '1px solid rgba(255,255,255,0.4)',
                boxShadow: '0 0 8px var(--hud-orange)',
                cursor: 'pointer'
              }}
            />
          )
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, opacity: 0.6, marginTop: 2 }}>
        <span>{formatDate(minTime)}</span>
        <span>{formatDate(maxTime)}</span>
      </div>
    </div>
  )
}

function formatDate(ms) {
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default memo(Timeline)
