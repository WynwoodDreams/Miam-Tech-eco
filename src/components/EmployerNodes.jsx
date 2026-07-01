import { memo } from 'react'
import { useTechData } from '../hooks/useTechData.js'
import { PALETTE } from '../utils/colors.js'
import NodeField from './NodeField.jsx'

/**
 * Renders employer campuses. Pulse speed is coupled to the `employerDemand`
 * slider so the whole layer visibly "breathes" faster as hiring demand
 * increases, giving the mission-control feel of a live labor-market feed.
 */
function EmployerNodes() {
  const employers = useTechData((s) => s.employers)
  const visible = useTechData((s) => s.layerFilters.Employer)
  const employerDemand = useTechData((s) => s.employerDemand)

  if (!visible || employers.length === 0) return null

  const pulseSpeed = 1 + (employerDemand / 100) * 2.5

  return <NodeField nodes={employers} color={PALETTE.pink} iconChar="💼" pulseSpeed={pulseSpeed} />
}

export default memo(EmployerNodes)
