import { memo } from 'react'
import { NODE_TYPE_COLORS } from '../utils/colors.js'

const ENTRIES = [
  { type: 'University', label: 'University' },
  { type: 'Employer', label: 'Employer' },
  { type: 'StartupHub', label: 'Startup Hub' },
  { type: 'AICompany', label: 'AI Company' },
  { type: 'DataCenter', label: 'Data Center' },
  { type: 'Event', label: 'Tech Event' }
]

/**
 * Legend is a persistent color key for the node categories on the map.
 * Node color alone isn't enough to tell categories apart at a glance (and
 * hovering every node to read its label doesn't scale), so this stays
 * visible the whole time as a fixed reference.
 */
function Legend() {
  return (
    <div
      className="hud-panel"
      style={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 160,
        padding: 12,
        zIndex: 20,
        pointerEvents: 'auto'
      }}
    >
      <div className="hud-label" style={{ marginBottom: 8 }}>
        MAP LEGEND
      </div>
      {ENTRIES.map(({ type, label }) => (
        <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: NODE_TYPE_COLORS[type],
              boxShadow: `0 0 6px ${NODE_TYPE_COLORS[type]}`,
              flexShrink: 0
            }}
          />
          <span style={{ fontSize: 11 }}>{label}</span>
        </div>
      ))}
    </div>
  )
}

export default memo(Legend)
