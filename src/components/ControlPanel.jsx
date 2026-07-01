import { memo } from 'react'
import { useTechData } from '../hooks/useTechData.js'

// Slider configuration: driving this from a config array (rather than
// hand-writing 7 near-identical JSX blocks) makes it trivial to add a new
// simulation dimension later — just append an entry here.
const SLIDERS = [
  { key: 'talentFlow', label: 'Talent Flow', color: 'var(--hud-cyan)', suffix: '%' },
  { key: 'employerDemand', label: 'Employer Demand', color: 'var(--hud-pink)', suffix: '%' },
  { key: 'aiActivity', label: 'AI Activity', color: 'var(--hud-green)', suffix: '%' },
  { key: 'eventDensity', label: 'Event Density', color: 'var(--hud-orange)', suffix: '%' },
  { key: 'traffic', label: 'Traffic', color: 'var(--hud-amber)', suffix: '%' }
]

/**
 * ControlPanel exposes every simulation slider plus time-of-day and
 * day/night controls. All state lives in the useTechData store, so this
 * component is purely presentational — it never needs to know how sliders
 * affect the 3D scene, only how to read/write their values.
 */
function ControlPanel() {
  const timeOfDay = useTechData((s) => s.timeOfDay)
  const setTimeOfDay = useTechData((s) => s.setTimeOfDay)
  const isNightMode = useTechData((s) => s.isNightMode)
  const toggleNightMode = useTechData((s) => s.toggleNightMode)
  const isPlaying = useTechData((s) => s.isPlaying)
  const togglePlayback = useTechData((s) => s.togglePlayback)

  return (
    <div
      className="hud-panel hud-scroll"
      style={{
        position: 'absolute',
        top: 90,
        right: 20,
        width: 260,
        maxHeight: 'calc(100vh - 200px)',
        padding: 16,
        zIndex: 20,
        pointerEvents: 'auto'
      }}
    >
      <div className="hud-label" style={{ marginBottom: 10 }}>
        SIMULATION CONTROLS
      </div>

      {SLIDERS.map(({ key, label, color, suffix }) => (
        <SliderRow key={key} storeKey={key} label={label} color={color} suffix={suffix} />
      ))}

      <div className="hud-divider" />

      <div className="hud-slider-row">
        <div className="hud-slider-header">
          <span>Time of Day</span>
          <span style={{ color: 'var(--hud-cyan)' }}>{formatHour(timeOfDay)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={24}
          step={0.25}
          value={timeOfDay}
          onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button className={`hud-button ${isNightMode ? 'active' : ''}`} onClick={toggleNightMode} style={{ flex: 1 }}>
          {isNightMode ? '🌙 NIGHT' : '☀️ DAY'}
        </button>
        <button className={`hud-button ${isPlaying ? 'active' : ''}`} onClick={togglePlayback} style={{ flex: 1 }}>
          {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
        </button>
      </div>
    </div>
  )
}

/** Individual slider row bound to a single store key. */
function SliderRow({ storeKey, label, color, suffix }) {
  const value = useTechData((s) => s[storeKey])
  const setSlider = useTechData((s) => s.setSlider)

  return (
    <div className="hud-slider-row">
      <div className="hud-slider-header">
        <span>{label}</span>
        <span style={{ color }}>
          {Math.round(value)}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => setSlider(storeKey, parseFloat(e.target.value))}
        style={{ accentColor: color }}
      />
    </div>
  )
}

function formatHour(hour) {
  const h = Math.floor(hour)
  const m = Math.floor((hour % 1) * 60)
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}

export default memo(ControlPanel)
