import { memo } from 'react'
import { useTechData } from '../hooks/useTechData.js'
import NodeField from './NodeField.jsx'

/**
 * Renders startup hubs (accelerators, coworking districts) and, since they
 * share the same physical footprint on the map, the region's data centers.
 * Kept as two NodeField calls so each retains its own instanced draw call
 * and independent shape/color/pulse behavior.
 */
function StartupNodes() {
  const startupHubs = useTechData((s) => s.startups.filter((n) => n.type === 'StartupHub'))
  const dataCenters = useTechData((s) => s.dataCenters)
  const showStartups = useTechData((s) => s.layerFilters.StartupHub)
  const showDataCenters = useTechData((s) => s.layerFilters.DataCenter)

  return (
    <group>
      {showStartups && startupHubs.length > 0 && (
        <NodeField nodes={startupHubs} type="StartupHub" pulseSpeed={1.8} />
      )}
      {showDataCenters && dataCenters.length > 0 && (
        <NodeField nodes={dataCenters} type="DataCenter" pulseSpeed={2.4} />
      )}
    </group>
  )
}

export default memo(StartupNodes)
