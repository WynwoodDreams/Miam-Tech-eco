// Shared position styling for the floating HUD panels (Sidebar,
// ControlPanel, StatsPanel, Timeline, Legend). Desktop keeps each panel's
// own corner-anchored style; mobile swaps to a single bottom-sheet slot
// above the MobileTabBar, sized the same way for every panel so switching
// tabs doesn't jump the layout around.
export const MOBILE_TABBAR_HEIGHT = 56

export function panelPositionStyle(isMobile, desktopStyle) {
  if (!isMobile) return desktopStyle

  return {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: MOBILE_TABBAR_HEIGHT,
    maxHeight: '58vh',
    padding: 14,
    borderRadius: '14px 14px 0 0',
    zIndex: 30,
    pointerEvents: 'auto',
    overflowY: 'auto'
  }
}
