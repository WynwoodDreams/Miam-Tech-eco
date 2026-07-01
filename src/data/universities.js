// Universities & Colleges feeding Miami's tech talent pipeline.
// Positions are in world-space units on the 3D map (x, y, z), where the
// map plane sits at y = 0 and roughly mirrors Miami-Dade's real geography
// (west -> east = x negative -> positive, south -> north = z positive -> negative).
//
// This shape is intentionally API-ready: swap this static array for a
// fetch() to a College Scorecard / Lightcast education feed
// without touching any rendering component.
export const universities = [
  {
    id: 'mdc-wolfson',
    name: 'Miami Dade College — Wolfson Campus',
    type: 'University',
    position: [2, 0, 6],
    students: 18000,
    aiPrograms: 12,
    description: 'Home of MDC WORKS Next Generation Career Studio, downtown Miami.',
    color: '#38e0ff'
  },
  {
    id: 'mdc-kendall',
    name: 'Miami Dade College — Kendall Campus',
    type: 'University',
    position: [-6, 0, 12],
    students: 15500,
    aiPrograms: 8,
    description: 'Largest MDC campus by enrollment, strong IT & engineering tracks.',
    color: '#38e0ff'
  },
  {
    id: 'mdc-north',
    name: 'Miami Dade College — North Campus',
    type: 'University',
    position: [1, 0, -9],
    students: 11200,
    aiPrograms: 6,
    description: 'North Miami-Dade satellite campus with growing cybersecurity program.',
    color: '#38e0ff'
  },
  {
    id: 'mdc-padron',
    name: 'Miami Dade College — Padron Campus',
    type: 'University',
    position: [-9, 0, -3],
    students: 9800,
    aiPrograms: 5,
    description: 'Hialeah campus, bilingual technical workforce pipeline.',
    color: '#38e0ff'
  },
  {
    id: 'fiu',
    name: 'Florida International University',
    type: 'University',
    position: [-14, 0, 2],
    students: 58000,
    aiPrograms: 21,
    description: 'R1 research university, major CS & AI research output.',
    color: '#38e0ff'
  },
  {
    id: 'um',
    name: 'University of Miami',
    type: 'University',
    position: [4, 0, 16],
    students: 19000,
    aiPrograms: 14,
    description: 'Coral Gables research institution with a growing data science school.',
    color: '#38e0ff'
  }
]
