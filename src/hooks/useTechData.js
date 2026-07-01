import { create } from 'zustand'
import { universities } from '../data/universities.js'
import { employers, dataCenters } from '../data/employers.js'
import { startups } from '../data/startups.js'
import { events } from '../data/events.js'
import { internshipRoutes, fullTimeHires, sessionStats } from '../data/internships.js'
import { fetchLiveJobs, fetchEconPulse } from '../services/liveData.js'

/**
 * useTechData is the single source of truth for the simulation.
 *
 * It is seeded from static local modules under /src/data, then
 * `loadLiveData` overlays real public data on top: live job counts from
 * Greenhouse/Lever/Ashby (via /api/jobs) merged onto matching employer
 * nodes by id, and a Miami-metro employment trend from BLS (via /api/bls).
 * Both requests are timeout-guarded and fail closed to the static seed, so
 * a slow/down upstream never breaks the map.
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

  // ---- Live public data (see loadLiveData below) ----
  liveData: {
    status: 'idle', // 'idle' | 'loading' | 'ready' | 'error'
    updatedAt: null,
    trackedCount: 0,
    econPulse: null // { area, series: [{ id, label, latestValue, latestPeriod, pctChangeYoY }] }
  },

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

  /** Fetches live job counts + the BLS econ trend and overlays them on the seed data. */
  loadLiveData: async () => {
    set((state) => ({ liveData: { ...state.liveData, status: 'loading' } }))

    try {
      const [liveEmployers, econPulse] = await Promise.all([fetchLiveJobs(), fetchEconPulse()])
      const liveById = new Map((liveEmployers || []).map((e) => [e.id, e]))

      const overlayLive = (nodes) =>
        nodes.map((node) => {
          const live = liveById.get(node.id)
          if (!live) return node
          return { ...node, openRoles: live.openRoles, liveRoles: live.roles, isLive: true }
        })

      set((state) => ({
        employers: overlayLive(state.employers),
        startups: overlayLive(state.startups),
        liveData: {
          status: 'ready',
          updatedAt: Date.now(),
          trackedCount: liveById.size,
          econPulse
        }
      }))
    } catch {
      set((state) => ({ liveData: { ...state.liveData, status: 'error' } }))
    }
  }
}))
