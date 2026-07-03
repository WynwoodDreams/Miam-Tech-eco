import { memo } from 'react'
import { useTechData } from '../hooks/useTechData.js'
import NodeField from './NodeField.jsx'

/**
 * Renders company campuses, split into two visually distinct categories so
 * established enterprises and venture-stage startups never read as the same
 * dot: Employer (pink beveled towers) and Startup (coral orbs). Pulse speed
 * is coupled to the `employerDemand` slider so both layers visibly
 * "breathe" faster as hiring demand increases.
 */
function EmployerNodes() {
  const established = useTechData((s) => s.employers.filter((n) => n.type === 'Employer'))
  const startups = useTechData((s) => s.employers.filter((n) => n.type === 'Startup'))
  const showEstablished = useTechData((s) => s.layerFilters.Employer)
  const showStartups = useTechData((s) => s.layerFilters.Startup)
  const employerDemand = useTechData((s) => s.employerDemand)

  const pulseSpeed = 1 + (employerDemand / 100) * 2.5

  return (
    <group>
      {showEstablished && established.length > 0 && (
        <NodeField nodes={established} type="Employer" pulseSpeed={pulseSpeed} />
      )}
      {showStartups && startups.length > 0 && (
        <NodeField nodes={startups} type="Startup" pulseSpeed={pulseSpeed * 1.15} />
      )}
    </group>
  )
}

export default memo(EmployerNodes)
