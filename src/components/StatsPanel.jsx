import { memo } from 'react'
import { useTechData } from '../hooks/useTechData.js'
import { useIsMobile } from '../hooks/useIsMobile.js'
import { panelPositionStyle } from '../utils/panelLayout.js'
import MobileSheetHeader from './MobileSheetHeader.jsx'

/**
 * StatsPanel surfaces the aggregate numbers behind the visualization:
 * node counts per category, live open-role totals from tracked employers,
 * and the BLS Miami-metro employment trend. These are the kinds of figures
 * a stakeholder would want at a glance without hunting through the 3D scene.
 */
function StatsPanel() {
  const isMobile = useIsMobile()
  const activeMobilePanel = useTechData((s) => s.activeMobilePanel)
  const universities = useTechData((s) => s.universities)
  const employers = useTechData((s) => s.employers)
  const startups = useTechData((s) => s.startups)
  const dataCenters = useTechData((s) => s.dataCenters)
  const events = useTechData((s) => s.events)
  const liveData = useTechData((s) => s.liveData)

  const aiCompanyCount = startups.filter((n) => n.type === 'AICompany').length
  const startupHubCount = startups.filter((n) => n.type === 'StartupHub').length
  const liveOpenRoles = [...employers, ...startups]
    .filter((n) => n.isLive)
    .reduce((sum, n) => sum + (n.openRoles || 0), 0)

  const stats = [
    { label: 'Universities', value: universities.length, color: 'var(--hud-cyan)' },
    { label: 'Employers', value: employers.length, color: 'var(--hud-pink)' },
    { label: 'Startup Hubs', value: startupHubCount, color: 'var(--hud-purple)' },
    { label: 'AI Companies', value: aiCompanyCount, color: 'var(--hud-green)' },
    { label: 'Data Centers', value: dataCenters.length, color: 'var(--hud-amber)' },
    { label: 'Active Events', value: events.length, color: 'var(--hud-orange)' },
    { label: 'Live Open Roles', value: liveOpenRoles, color: 'var(--hud-green)' }
  ]

  if (isMobile && activeMobilePanel !== 'stats') return null

  return (
    <div
      className="hud-panel"
      style={panelPositionStyle(isMobile, {
        position: 'absolute',
        bottom: 20,
        left: 20,
        width: 300,
        padding: 16,
        zIndex: 20,
        pointerEvents: 'auto'
      })}
    >
      {isMobile ? (
        <MobileSheetHeader title="ECOSYSTEM STATISTICS" />
      ) : (
        <div className="hud-label" style={{ marginBottom: 10 }}>
          ECOSYSTEM STATISTICS
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {stats.map((s) => (
          <div key={s.label}>
            <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div className="hud-label" style={{ fontSize: 9 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="hud-divider" />

      <LiveDataStatus liveData={liveData} />
    </div>
  )
}

/** Freshness indicator + BLS econ trend for the public-data overlay. */
function LiveDataStatus({ liveData }) {
  const { status, updatedAt, trackedCount, econPulse } = liveData

  const dotColor =
    status === 'ready' ? 'var(--hud-green)' : status === 'error' ? 'var(--hud-pink)' : 'var(--hud-amber)'
  const statusLabel =
    status === 'ready'
      ? `${trackedCount} EMPLOYER${trackedCount === 1 ? '' : 'S'} TRACKED`
      : status.toUpperCase()

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: dotColor,
            boxShadow: status === 'ready' ? `0 0 6px ${dotColor}` : 'none'
          }}
        />
        <span className="hud-label">LIVE DATA — {statusLabel}</span>
      </div>

      {econPulse?.series?.length > 0 && (
        <div style={{ marginBottom: 4 }}>
          {econPulse.series.map((s) => (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }}>
              <span style={{ opacity: 0.8 }}>{s.label}</span>
              <span style={{ color: s.pctChangeYoY >= 0 ? 'var(--hud-green)' : 'var(--hud-pink)' }}>
                {s.pctChangeYoY != null ? `${s.pctChangeYoY > 0 ? '+' : ''}${s.pctChangeYoY}% YoY` : '—'}
              </span>
            </div>
          ))}
        </div>
      )}

      {updatedAt && (
        <div style={{ fontSize: 9, opacity: 0.5 }}>Updated {new Date(updatedAt).toLocaleTimeString()}</div>
      )}
    </div>
  )
}

export default memo(StatsPanel)
