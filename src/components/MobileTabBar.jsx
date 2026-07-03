import { memo } from 'react'
import { useTechData } from '../hooks/useTechData.js'
import { MOBILE_TABBAR_HEIGHT } from '../utils/panelLayout.js'

const TABS = [
  { key: 'directory', icon: '🔍', label: 'Directory' },
  { key: 'controls', icon: '🎛', label: 'Controls' },
  { key: 'stats', icon: '📊', label: 'Stats' },
  { key: 'timeline', icon: '📅', label: 'Timeline' },
  { key: 'legend', icon: '🗺', label: 'Legend' }
]

/**
 * Bottom tab bar shown only on phone-sized viewports. Exactly one panel
 * (or none) is open at a time, rendered as a sheet directly above this
 * bar — the mobile equivalent of the desktop's five simultaneous floating
 * panels, which don't fit on a phone screen at once.
 */
function MobileTabBar() {
  const activeMobilePanel = useTechData((s) => s.activeMobilePanel)
  const setActiveMobilePanel = useTechData((s) => s.setActiveMobilePanel)

  return (
    <div
      className="hud-panel"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        height: MOBILE_TABBAR_HEIGHT,
        paddingBottom: 'env(safe-area-inset-bottom)',
        display: 'flex',
        borderRadius: 0,
        zIndex: 30,
        pointerEvents: 'auto'
      }}
    >
      {TABS.map(({ key, icon, label }) => (
        <button
          key={key}
          onClick={() => setActiveMobilePanel(key)}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: activeMobilePanel === key ? 'var(--hud-cyan)' : 'var(--hud-text)',
            opacity: activeMobilePanel === key ? 1 : 0.65,
            fontFamily: 'inherit'
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>{icon}</span>
          <span style={{ fontSize: 9, letterSpacing: 0.5 }}>{label.toUpperCase()}</span>
        </button>
      ))}
    </div>
  )
}

export default memo(MobileTabBar)
