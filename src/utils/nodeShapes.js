import { PALETTE } from './colors.js'

/**
 * Single source of truth for how each node category is drawn and named.
 * The map encodes category redundantly — silhouette AND color — so a node
 * is identifiable at a glance even when hue alone is ambiguous (small dots,
 * bloom, color-blind viewers). The Legend renders the same `shape` as a 2D
 * glyph, so what you see in the key is literally what floats on the map.
 *
 * `altitude` staggers how high each category hovers above the ground so
 * co-located nodes (e.g. an Event held at a Startup Hub) stack vertically
 * instead of intersecting.
 */
export const NODE_TYPES = {
  University: {
    label: 'University',
    plural: 'Universities',
    color: PALETTE.cyan,
    icon: '🎓',
    shape: 'diamond', // octahedron — a "campus beacon"
    altitude: 0.62,
    hint: 'Talent pipeline'
  },
  Employer: {
    label: 'Established Co.',
    plural: 'Established Companies',
    color: PALETTE.pink,
    icon: '💼',
    shape: 'tower', // box tower — corporate campus
    altitude: 0.58,
    hint: 'Enterprise employer'
  },
  Startup: {
    label: 'Startup',
    plural: 'Startups',
    color: PALETTE.coral,
    icon: '🌱',
    shape: 'orb', // smooth sphere — young company, still taking shape
    altitude: 0.66,
    hint: 'Venture-stage company'
  },
  StartupHub: {
    label: 'Startup Hub',
    plural: 'Startup Hubs',
    color: PALETTE.purple,
    icon: '🚀',
    shape: 'pyramid', // 4-sided cone — launchpad
    altitude: 0.72,
    hint: 'Accelerator / coworking'
  },
  AICompany: {
    label: 'AI Company',
    plural: 'AI Companies',
    color: PALETTE.green,
    icon: '🤖',
    shape: 'core', // icosahedron — compute core
    altitude: 0.86,
    hint: 'AI-native company'
  },
  DataCenter: {
    label: 'Data Center',
    plural: 'Data Centers',
    color: PALETTE.amber,
    icon: '🖥',
    shape: 'stack', // hex cylinder — server stack
    altitude: 0.5,
    hint: 'Compute infrastructure'
  },
  Event: {
    label: 'Tech Event',
    plural: 'Tech Events',
    color: PALETTE.orange,
    icon: '📅',
    shape: 'ring', // upright spinning ring — radar ping origin
    altitude: 0.52,
    hint: 'Conference / meetup'
  }
}

/** Legend/Sidebar row order (stable, most permanent layers first). */
export const NODE_TYPE_ORDER = [
  'University',
  'Employer',
  'Startup',
  'StartupHub',
  'AICompany',
  'DataCenter',
  'Event'
]

const FALLBACK_TYPE = {
  label: 'Node',
  plural: 'Nodes',
  color: PALETTE.white,
  icon: '●',
  shape: 'diamond',
  altitude: 0.55,
  hint: ''
}

export function getNodeType(type) {
  return NODE_TYPES[type] || FALLBACK_TYPE
}

/**
 * Compact display name for the always-on 3D labels. Data records can
 * provide an explicit `shortName`; otherwise long names are truncated so
 * labels never sprawl across the map.
 */
export function displayLabel(node, labelField = 'name') {
  const name = node.shortName || node[labelField] || ''
  return name.length > 22 ? `${name.slice(0, 21)}…` : name
}
