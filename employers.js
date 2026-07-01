import { create } from 'zustand'
import { universities } from '../data/universities.js'
import { employers, dataCenters } from '../data/employers.js'
import { startups } from '../data/startups.js'
import { events } from '../data/events.js'
import { internshipRoutes, fullTimeHires, sessionStats } from '../data/internships.js'

/**
 * useTechData is the single source of truth for the simulation.
 *
 * Today it is seeded from static local modules under /src/data. To wire in
 * live data later (LinkedIn Jobs, Lightcast, Crunchbase, Eventbrite, the
 * MDC internship database, etc.), replace the `loadLiveData` implementation
 * with real fetch() calls that resolve to the same shapes and call
 * `set({ ... })` — no component below needs to change, since everything
 * reads from this store rather than importing /data directly at render time.
 */
export const useTechData = create((set, get) => ({
  // ---- Raw datasets (API-replaceable) ----
  universities,
  employers,
  dataCenters,
  startups,
  events,
  internshipRoutes,
  fullTimeHires,
  sessionStats,

  // ---- Simulation control sliders (0-100 unless noted) ----
  talentFlow: 65,
  employerDemand: 55,
  aiActivity: 70,
  eventDensity: 40,
  internshipPlacements: 60,
  traffic: 30,
  timeOfDay: 19, // 0-24 hour clock, defaults to dusk for a cinematic first impression

  // ---- View state ----
  isNightMode: true,
  layerFilters: {
    University: true,
    Employer: true,
    DataCenter: true,
    StartupHub: true,
    AICompany: true,
    Event: true,
    TalentFlow: true,
    Internships: true,
    Drones: true
  },
  searchQuery: '',
  selectedNodeId: null,
  focusTarget: null, // [x,y,z] the CameraController should fly to
  isPlaying: true, // timeline playback toggle

  // ---- Actions ----
  setSlider: (key, value) => set({ [key]: value }),
  setTimeOfDay: (hour) => set({ timeOfDay: hour, isNightMode: hour < 6.5 || hour > 18.5 }),
  toggleNightMode: () => set((state) => ({ isNightMode: !state.isNightMode })),
  toggleLayer: (layer) =>
    set((state) => ({
      layerFilters: { ...state.layerFilters, [layer]: !state.layerFilters[layer] }
    })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectNode: (nodeId, position) => set({ selectedNodeId: nodeId, focusTarget: position || null }),
  clearSelection: () => set({ selectedNodeId: null, focusTarget: null }),
  togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),

  /** Returns every node across all collections as a single flat array. */
  getAllNodes: () => {
    const state = get()
    return [
      ...state.universities,
      ...state.employers,
      ...state.dataCenters,
      ...state.startups,
      ...state.events
    ]
  },

  /** Placeholder for future live-data integration (see module docstring). */
  loadLiveData: async () => {
    // Example of the intended future shape:
    // const jobs = await fetch('/api/linkedin-jobs').then(r => r.json())
    // set({ employers: jobs.map(mapLinkedInJobToEmployerNode) })
    return Promise.resolve()
  }
}))
