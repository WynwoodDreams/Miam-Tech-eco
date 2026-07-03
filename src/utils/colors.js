/**
 * Shared color palette for the "mission control" 3D aesthetic, plus a
 * lookup from node `type` to its brand color. Kept in sync with the
 * `color` field already baked into each /src/data record.
 */
export const PALETTE = {
  cyan: '#38e0ff',
  pink: '#ff5da2',
  purple: '#7c5cff',
  green: '#39ff88',
  amber: '#ffd23f',
  orange: '#ffb347',
  coral: '#ff5e4f',
  white: '#ffffff',
  gridLine: '#1a5f73',
  gridLineDay: '#5f97a8',
  backgroundNight: '#030712',
  backgroundDay: '#bfe4f5'
}

export const NODE_TYPE_COLORS = {
  University: PALETTE.cyan,
  Employer: PALETTE.pink,
  Startup: PALETTE.coral,
  DataCenter: PALETTE.amber,
  StartupHub: PALETTE.purple,
  AICompany: PALETTE.green,
  Event: PALETTE.orange
}
