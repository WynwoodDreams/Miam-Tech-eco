import { memo } from 'react'
import { useTechData } from '../hooks/useTechData.js'
import { PALETTE } from '../utils/colors.js'
import NodeField from './NodeField.jsx'

/**
 * Renders every university/college as glowing instanced markers.
 * Reads live from the store so a future API swap of `universities`
 * re-renders this automatically with zero changes here.
 */
function UniversityNodes() {
  const universities = useTechData((s) => s.universities)
  const visible = useTechData((s) => s.layerFilters.University)

  if (!visible || universities.length === 0) return null

  return <NodeField nodes={universities} color={PALETTE.cyan} iconChar="🎓" pulseSpeed={1.4} />
}

export default memo(UniversityNodes)
