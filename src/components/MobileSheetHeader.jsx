import { useTechData } from '../hooks/useTechData.js'

/** Title row + close button shown at the top of a panel when it's rendered as a mobile sheet. */
export default function MobileSheetHeader({ title }) {
  const setActiveMobilePanel = useTechData((s) => s.setActiveMobilePanel)

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
      <div className="hud-label">{title}</div>
      <button className="hud-button" onClick={() => setActiveMobilePanel(null)}>
        ✕
      </button>
    </div>
  )
}
