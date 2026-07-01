import { memo, useMemo, useState } from 'react'
import { useTechData } from '../hooks/useTechData.js'
import { NODE_TYPE_COLORS } from '../utils/colors.js'

const LAYER_TOGGLES = [
  { key: 'University', label: 'Universities' },
  { key: 'Employer', label: 'Employers' },
  { key: 'DataCenter', label: 'Data Centers' },
  { key: 'StartupHub', label: 'Startup Hubs' },
  { key: 'AICompany', label: 'AI Companies' },
  { key: 'Event', label: 'Tech Events' },
  { key: 'TalentFlow', label: 'Talent Flow' },
  { key: 'Internships', label: 'Internship Pipelines' },
  { key: 'Drones', label: 'Patrol Drones' }
]

/**
 * Sidebar hosts search, per-layer visibility filters, and a live directory
 * of nodes matching the current search query. Selecting a directory entry
 * updates the shared store's `focusTarget`, which CameraController then
 * flies to smoothly.
 */
function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const searchQuery = useTechData((s) => s.searchQuery)
  const setSearchQuery = useTechData((s) => s.setSearchQuery)
  const layerFilters = useTechData((s) => s.layerFilters)
  const toggleLayer = useTechData((s) => s.toggleLayer)
  const selectNode = useTechData((s) => s.selectNode)
  const getAllNodes = useTechData((s) => s.getAllNodes)

  const allNodes = getAllNodes()

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.trim().toLowerCase()
    return allNodes.filter((n) => n.name.toLowerCase().includes(q)).slice(0, 12)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, allNodes.length])

  if (collapsed) {
    return (
      <button
        className="hud-panel hud-button"
        style={{ position: 'absolute', top: 90, left: 20, zIndex: 20, pointerEvents: 'auto' }}
        onClick={() => setCollapsed(false)}
      >
        ☰ PANELS
      </button>
    )
  }

  return (
    <div
      className="hud-panel hud-scroll"
      style={{
        position: 'absolute',
        top: 90,
        left: 20,
        width: 270,
        maxHeight: 'calc(100vh - 200px)',
        padding: 16,
        zIndex: 20,
        pointerEvents: 'auto'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div className="hud-label">DIRECTORY & LAYERS</div>
        <button className="hud-button" onClick={() => setCollapsed(true)}>
          —
        </button>
      </div>

      <input
        className="hud-input"
        placeholder="Search nodes, employers, hubs..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {searchResults.length > 0 && (
        <div style={{ marginTop: 8, maxHeight: 180, overflowY: 'auto' }}>
          {searchResults.map((node) => (
            <div
              key={node.id}
              className="hud-node-item"
              onClick={() => selectNode(node.id, node.position)}
              style={{ color: NODE_TYPE_COLORS[node.type] || '#fff' }}
            >
              <span style={{ color: 'var(--hud-text)' }}>{node.name}</span>
              <span className="hud-chip">{node.type}</span>
            </div>
          ))}
        </div>
      )}

      <div className="hud-divider" />

      <div className="hud-label" style={{ marginBottom: 8 }}>
        LAYER VISIBILITY
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {LAYER_TOGGLES.map(({ key, label }) => (
          <button
            key={key}
            className={`hud-button ${layerFilters[key] ? 'active' : ''}`}
            onClick={() => toggleLayer(key)}
            style={{ fontSize: 10 }}
          >
            {layerFilters[key] ? '● ' : '○ '}
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default memo(Sidebar)
