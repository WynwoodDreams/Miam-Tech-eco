import { memo } from 'react'
import { useTechData } from '../hooks/useTechData.js'

/**
 * StatsPanel surfaces the aggregate numbers behind the visualization:
 * node counts per category plus MDC WORKS coaching session totals. These
 * are the kinds of figures a stakeholder would want at a glance without
 * hunting through the 3D scene.
 */
function StatsPanel() {
  const universities = useTechData((s) => s.universities)
  const employers = useTechData((s) => s.employers)
  const startups = useTechData((s) => s.startups)
  const dataCenters = useTechData((s) => s.dataCenters)
  const events = useTechData((s) => s.events)
  const internshipRoutes = useTechData((s) => s.internshipRoutes)
  const fullTimeHires = useTechData((s) => s.fullTimeHires)
  const sessionStats = useTechData((s) => s.sessionStats)

  const aiCompanyCount = startups.filter((n) => n.type === 'AICompany').length
  const startupHubCount = startups.filter((n) => n.type === 'StartupHub').length

  const stats = [
    { label: 'Universities', value: universities.length, color: 'var(--hud-cyan)' },
    { label: 'Employers', value: employers.length, color: 'var(--hud-pink)' },
    { label: 'Startup Hubs', value: startupHubCount, color: 'var(--hud-purple)' },
    { label: 'AI Companies', value: aiCompanyCount, color: 'var(--hud-green)' },
    { label: 'Data Centers', value: dataCenters.length, color: 'var(--hud-amber)' },
    { label: 'Active Events', value: events.length, color: 'var(--hud-orange)' },
    { label: 'Internship Routes', value: internshipRoutes.length, color: 'var(--hud-cyan)' },
    { label: 'Full-Time Hires', value: fullTimeHires.length, color: 'var(--hud-green)' }
  ]

  return (
    <div
      className="hud-panel"
      style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        width: 300,
        padding: 16,
        zIndex: 20,
        pointerEvents: 'auto'
      }}
    >
      <div className="hud-label" style={{ marginBottom: 10 }}>
        ECOSYSTEM STATISTICS
      </div>
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

      <div className="hud-label" style={{ marginBottom: 6 }}>
        MDC WORKS COACHING SESSIONS ({sessionStats.total})
      </div>
      <SessionBar label="Resume Prep" value={sessionStats.resumePrep} total={sessionStats.total} />
      <SessionBar label="Employment Assistance" value={sessionStats.employmentAssistance} total={sessionStats.total} />
      <SessionBar label="Internship Assistance" value={sessionStats.internshipAssistance} total={sessionStats.total} />
      <SessionBar label="Interview Prep" value={sessionStats.interviewPrep} total={sessionStats.total} />
      <SessionBar label="LinkedIn Optimization" value={sessionStats.linkedInOptimization} total={sessionStats.total} />
    </div>
  )
}

/** Thin horizontal proportion bar used for the session-type breakdown. */
function SessionBar({ label, value, total }) {
  const pct = Math.round((value / total) * 100)
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }}>
        <span style={{ opacity: 0.8 }}>{label}</span>
        <span style={{ color: 'var(--hud-cyan)' }}>{value}</span>
      </div>
      <div style={{ height: 4, background: 'rgba(56,224,255,0.12)', borderRadius: 2 }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: 'var(--hud-cyan)',
            borderRadius: 2,
            boxShadow: '0 0 6px var(--hud-cyan)'
          }}
        />
      </div>
    </div>
  )
}

export default memo(StatsPanel)
