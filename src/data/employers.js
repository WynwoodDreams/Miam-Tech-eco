// Employers, corporate campuses, and physical data centers.
// `type` distinguishes rendering treatment in EmployerNodes / DataStreams.
// Replace with a live Handshake / LinkedIn Jobs / Crunchbase feed later —
// the consuming components only care about the fields below.
export const employers = [
  {
    id: 'miami-heat',
    name: 'Miami Heat (AmericanAirlines Arena Tech Ops)',
    shortName: 'Miami Heat Tech Ops',
    type: 'Employer',
    position: [3, 0, 3],
    industry: 'Sports & Entertainment Tech',
    openRoles: 4,
    hires: 1,
    color: '#ff5da2'
  },
  {
    id: 'att',
    name: 'AT&T Miami',
    type: 'Employer',
    position: [-3, 0, 5],
    industry: 'Telecommunications',
    openRoles: 12,
    hires: 1,
    color: '#ff5da2'
  },
  {
    id: 'baptist-health',
    name: 'Baptist Health South Florida',
    shortName: 'Baptist Health',
    type: 'Employer',
    position: [-2, 0, 10],
    industry: 'Healthcare IT',
    openRoles: 9,
    hires: 1,
    color: '#ff5da2'
  },
  {
    id: 'chg-healthcare',
    name: 'CHG Healthcare',
    type: 'Employer',
    position: [-8, 0, 8],
    industry: 'Healthcare Staffing Tech',
    openRoles: 5,
    hires: 1,
    color: '#ff5da2'
  },
  {
    id: 'sherwood-aviation',
    name: 'Sherwood Aviation',
    type: 'Employer',
    position: [6, 0, -6],
    industry: 'Aviation Systems',
    openRoles: 3,
    hires: 1,
    color: '#ff5da2'
  },
  {
    id: 'take2',
    name: 'Take2 Consulting',
    type: 'Employer',
    position: [2, 0, -4],
    industry: 'IT Consulting',
    openRoles: 6,
    hires: 1,
    color: '#ff5da2'
  },
  {
    id: 'pharmcorx',
    name: 'PharmcoRx',
    type: 'Employer',
    position: [-5, 0, -8],
    industry: 'Pharmacy Tech',
    openRoles: 4,
    hires: 1,
    color: '#ff5da2'
  },
  {
    id: 'everglades-housing',
    name: 'Everglades Housing Group',
    shortName: 'Everglades Housing',
    type: 'Employer',
    position: [-11, 0, -5],
    industry: 'Property & Civic Tech',
    openRoles: 3,
    hires: 1,
    color: '#ff5da2'
  },
  {
    id: 'fragrance-directory',
    name: 'Fragrance Directory',
    type: 'Employer',
    position: [7, 0, 8],
    industry: 'E-commerce / Web Dev',
    openRoles: 2,
    hires: 0,
    color: '#ff5da2'
  },
  {
    id: 'moonpay',
    name: 'MoonPay',
    type: 'Employer',
    position: [5, 0, 3.5],
    industry: 'Crypto & Fintech Payments',
    // Seed value shown until /api/jobs (Lever) overlays the live count —
    // see useTechData.loadLiveData and api/jobs.js.
    openRoles: 5,
    color: '#ff5da2'
  },
  {
    id: 'kaseya',
    name: 'Kaseya',
    type: 'Employer',
    position: [3.4, 0, 4.2],
    industry: 'IT Management & Cybersecurity Software',
    openRoles: 14,
    hires: 2,
    color: '#ff5da2'
  },
  {
    id: 'citadel-securities',
    name: 'Citadel Securities',
    type: 'Employer',
    position: [5.4, 0, 5.6],
    industry: 'Quantitative Trading Technology',
    openRoles: 8,
    hires: 1,
    color: '#ff5da2'
  },
  {
    id: 'royal-caribbean',
    name: 'Royal Caribbean Group',
    shortName: 'Royal Caribbean',
    type: 'Employer',
    position: [7, 0, 4.2],
    industry: 'Cruise Digital & Innovation Lab',
    openRoles: 7,
    hires: 1,
    color: '#ff5da2'
  },
  {
    id: 'microsoft-latam',
    name: 'Microsoft LatAm HQ',
    type: 'Employer',
    position: [-6.5, 0, 3.2],
    industry: 'Cloud & Enterprise Software',
    openRoles: 10,
    hires: 1,
    color: '#ff5da2'
  },
  {
    id: 'spotify-miami',
    name: 'Spotify Miami',
    type: 'Employer',
    position: [0.6, 0, -0.9],
    industry: 'Music Streaming — LatAm Hub',
    openRoles: 4,
    hires: 0,
    color: '#ff5da2'
  },
  {
    id: 'reef-technology',
    name: 'REEF Technology',
    type: 'Employer',
    position: [1.9, 0, 3.4],
    industry: 'Proximity Logistics Platform',
    openRoles: 5,
    hires: 1,
    color: '#ff5da2'
  },
  {
    id: 'blockchain-com',
    name: 'Blockchain.com',
    type: 'Employer',
    position: [4.4, 0, 6.3],
    industry: 'Crypto Exchange & Wallets',
    openRoles: 6,
    hires: 0,
    color: '#ff5da2'
  },
  {
    id: 'quicknode',
    name: 'QuickNode',
    type: 'Employer',
    position: [2.6, 0, 0.6],
    industry: 'Blockchain RPC Infrastructure',
    openRoles: 9,
    hires: 1,
    color: '#ff5da2'
  },
  {
    id: 'papa',
    name: 'Papa',
    type: 'Employer',
    position: [1.4, 0, 7.6],
    industry: 'Health Tech — Companion Care',
    openRoles: 5,
    hires: 0,
    color: '#ff5da2'
  },
  {
    id: 'assurant',
    name: 'Assurant',
    type: 'Employer',
    position: [-2.6, 0, 7.2],
    industry: 'Insurance & Connected-Device Tech',
    openRoles: 6,
    hires: 1,
    color: '#ff5da2'
  },
  {
    id: 'magic-leap',
    name: 'Magic Leap',
    type: 'Employer',
    position: [-9, 0, -13],
    industry: 'AR & Spatial Computing (Plantation)',
    openRoles: 4,
    hires: 0,
    color: '#ff5da2'
  },
  {
    id: 'chewy',
    name: 'Chewy',
    type: 'Employer',
    position: [-11.5, 0, -14.5],
    industry: 'Pet E-commerce & Logistics Tech (Plantation)',
    openRoles: 12,
    hires: 2,
    color: '#ff5da2'
  }
]

// Physical infrastructure powering the region's compute + connectivity.
export const dataCenters = [
  {
    id: 'nap-of-the-americas',
    name: 'NAP of the Americas',
    type: 'DataCenter',
    position: [1, 0, 1],
    capacityMW: 34,
    tier: 'Tier III+',
    color: '#ffd23f'
  },
  {
    id: 'equinix-mi1',
    name: 'Equinix MI1',
    type: 'DataCenter',
    position: [-4, 0, -1],
    capacityMW: 18,
    tier: 'Tier III',
    color: '#ffd23f'
  },
  {
    id: 'digital-realty-mia',
    name: 'Digital Realty MIA',
    type: 'DataCenter',
    position: [9, 0, 2],
    capacityMW: 22,
    tier: 'Tier IV',
    color: '#ffd23f'
  }
]
