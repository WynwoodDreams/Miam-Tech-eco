import { memo } from 'react'
import { useTechData } from '../hooks/useTechData.js'
import { NODE_TYPES, NODE_TYPE_ORDER } from '../utils/nodeShapes.js'
import { useIsMobile } from '../hooks/useIsMobile.js'
import { panelPositionStyle } from '../utils/panelLayout.js'
import MobileSheetHeader from './MobileSheetHeader.jsx'

/**
 * Legend is the map key — and the fastest way to answer "what is that
 * dot?". Each row shows the *actual silhouette* the category uses in 3D
 * (drawn as an SVG glyph from the same nodeShapes.js spec), its color, a
 * one-line hint, and a live count. It's interactive:
 *  - hover a row  → spotlight that category on the map (others dim)
 *  - click a row  → toggle the layer on/off
 *  - LABELS button → toggle the always-on name tags in the scene
 */
function Legend() {
  const isMobile = useIsMobile()
  const activeMobilePanel = useTechData((s) => s.activeMobilePanel)
  const layerFilters = useTechData((s) => s.layerFilters)
  const toggleLayer = useTechData((s) => s.toggleLayer)
  const highlightType = useTechData((s) => s.highlightType)
  const setHighlightType = useTechData((s) => s.setHighlightType)
  const showLabels = useTechData((s) => s.showLabels)
  const toggleLabels = useTechData((s) => s.toggleLabels)

  // Select the raw arrays (stable references) and derive counts in render —
  // an object-literal selector would defeat zustand's equality check.
  const universities = useTechData((s) => s.universities)
  const employers = useTechData((s) => s.employers)
  const startups = useTechData((s) => s.startups)
  const dataCenters = useTechData((s) => s.dataCenters)
  const events = useTechData((s) => s.events)

  if (isMobile && activeMobilePanel !== 'legend') return null

  const counts = {
    University: universities.length,
    Employer: employers.length,
    StartupHub: startups.filter((n) => n.type === 'StartupHub').length,
    AICompany: startups.filter((n) => n.type === 'AICompany').length,
    DataCenter: dataCenters.length,
    Event: events.length
  }

  return (
    <div
      className="hud-panel"
      style={panelPositionStyle(isMobile, {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 214,
        padding: 12,
        zIndex: 20,
        pointerEvents: 'auto'
      })}
      onMouseLeave={() => setHighlightType(null)}
    >
      {isMobile && <MobileSheetHeader title="MAP KEY" />}
      <div
        style={{
          display: 'flex',
          justifyContent: isMobile ? 'flex-end' : 'space-between',
          alignItems: 'center',
          marginBottom: 8
        }}
      >
        {!isMobile && <div className="hud-label">MAP KEY</div>}
        <button
          className={`hud-button ${showLabels ? 'active' : ''}`}
          onClick={toggleLabels}
          style={{ fontSize: 9, padding: '3px 7px' }}
          title="Toggle the name tags shown above every marker"
        >
          {showLabels ? '◆ LABELS ON' : '◇ LABELS OFF'}
        </button>
      </div>

      {NODE_TYPE_ORDER.map((type) => {
        const spec = NODE_TYPES[type]
        const enabled = layerFilters[type]
        const spotlit = highlightType === type
        return (
          <div
            key={type}
            role="button"
            onClick={() => {
              toggleLayer(type)
              if (spotlit) setHighlightType(null)
            }}
            onMouseEnter={() => setHighlightType(enabled ? type : null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              padding: '5px 6px',
              margin: '0 -6px',
              borderRadius: 6,
              cursor: 'pointer',
              opacity: enabled ? 1 : 0.35,
              background: spotlit ? `${spec.color}1a` : 'transparent',
              transition: 'background 120ms, opacity 120ms'
            }}
            title={enabled ? `Click to hide ${spec.plural}` : `Click to show ${spec.plural}`}
          >
            <ShapeGlyph shape={spec.shape} color={spec.color} hollow={!enabled} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, lineHeight: 1.2 }}>{spec.label}</div>
              <div style={{ fontSize: 8.5, color: 'var(--hud-text-dim)', letterSpacing: 0.3 }}>
                {spec.hint}
              </div>
            </div>
            <span
              style={{
                fontSize: 10,
                color: spec.color,
                textDecoration: enabled ? 'none' : 'line-through',
                flexShrink: 0
              }}
            >
              {counts[type]}
            </span>
          </div>
        )
      })}

      <div className="hud-divider" style={{ margin: '8px 0 6px' }} />
      <div style={{ fontSize: 8.5, color: 'var(--hud-text-dim)', letterSpacing: 0.4 }}>
        {isMobile ? 'TAP A ROW TO TOGGLE ITS LAYER' : 'HOVER TO SPOTLIGHT · CLICK TO TOGGLE'}
      </div>
    </div>
  )
}

/**
 * 2D rendition of the category's 3D silhouette, so the key visually matches
 * the shapes floating on the map (not just their colors).
 */
function ShapeGlyph({ shape, color, hollow }) {
  const fill = hollow ? 'none' : color
  const common = {
    width: 16,
    height: 16,
    viewBox: '0 0 16 16',
    strokeLinejoin: 'round',
    strokeLinecap: 'round',
    style: { flexShrink: 0, filter: hollow ? 'none' : `drop-shadow(0 0 3px ${color})` }
  }

  switch (shape) {
    case 'diamond':
      return (
        <svg {...common}>
          <path d="M8 1 L13.5 8 L8 15 L2.5 8 Z" fill={fill} stroke={color} strokeWidth="1.2" />
        </svg>
      )
    case 'tower':
      return (
        <svg {...common}>
          <rect x="4.5" y="2.5" width="7" height="11" rx="1.5" fill={fill} stroke={color} strokeWidth="1.2" />
        </svg>
      )
    case 'pyramid':
      return (
        <svg {...common}>
          <path d="M8 2 L14 13.5 L2 13.5 Z" fill={fill} stroke={color} strokeWidth="1.2" />
        </svg>
      )
    case 'core':
      return (
        <svg {...common}>
          <path d="M8 1.5 L13.6 4.75 L13.6 11.25 L8 14.5 L2.4 11.25 L2.4 4.75 Z" fill={fill} stroke={color} strokeWidth="1.2" />
        </svg>
      )
    case 'stack':
      return (
        <svg {...common}>
          <rect x="3" y="2" width="10" height="3.2" rx="1" fill={fill} stroke={color} strokeWidth="1.1" />
          <rect x="3" y="6.4" width="10" height="3.2" rx="1" fill={fill} stroke={color} strokeWidth="1.1" />
          <rect x="3" y="10.8" width="10" height="3.2" rx="1" fill={fill} stroke={color} strokeWidth="1.1" />
        </svg>
      )
    case 'ring':
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="5" fill="none" stroke={color} strokeWidth="2.4" opacity={hollow ? 0.6 : 1} />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="4.5" fill={fill} stroke={color} strokeWidth="1.2" />
        </svg>
      )
  }
}

export default memo(Legend)
