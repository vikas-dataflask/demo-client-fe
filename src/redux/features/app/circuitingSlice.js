import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Zone management
  selectedZone: null,
  zoneManagement: [], // Array of zone objects with id, name, rooms, etc.
  zones: {}, // Multi-zone circuiting data keyed by zoneId
  
  // Circuit management
  circuits: {}, // { circuitId: { id, name, fixtures: [], phase: 'R/Y/B', db: 'DB1', load: 0 } }
  circuitMapping: {}, // { fixtureId: circuitId }
  
  // Distribution Boards
  distributionBoards: {
    'DB1': { name: 'DB1', label: 'Lighting DB East', circuits: [] },
    'DB2': { name: 'DB2', label: 'Lighting DB West', circuits: [] },
    'DB3': { name: 'DB3', label: 'Lighting DB North', circuits: [] },
    'DB4': { name: 'DB4', label: 'Lighting DB South', circuits: [] }
  },
  
  // UI state
  showPhaseOverlay: false,
  isLoading: false,
  error: null,
  
  // Phase colors
  phaseColors: {
    'R': '#FF4444', // Red
    'Y': '#FFAA00', // Yellow/Orange
    'B': '#4444FF'  // Blue
  },
  
  // Multi-zone circuiting data
  zones: {}, // { zoneId: { fixtures: [], circuits: [], labels: [] } }
  
  // Legacy circuiting summary data (keeping for backward compatibility)
  circuitingSummary: [] // Array of zone circuiting summaries
};

const circuitingSlice = createSlice({
  name: "circuiting",
  initialState,
  reducers: {
    // Zone management
    setSelectedZone: (state, action) => {
      state.selectedZone = action.payload;
    },
    setZoneManagement: (state, action) => {
      state.zoneManagement = action.payload;
    },
    setZones: (state, action) => {
      state.zones = action.payload;
    },
    
    // Circuit management
    setCircuits: (state, action) => {
      state.circuits = action.payload;
    },
    addCircuit: (state, action) => {
      const { id, ...circuitData } = action.payload;
      state.circuits[id] = { id, ...circuitData };
    },
    updateCircuit: (state, action) => {
      const { id, ...updates } = action.payload;
      if (state.circuits[id]) {
        state.circuits[id] = { ...state.circuits[id], ...updates };
      }
    },
    removeCircuit: (state, action) => {
      delete state.circuits[action.payload];
    },
    
    // Circuit mapping
    setCircuitMapping: (state, action) => {
      state.circuitMapping = action.payload;
    },
    assignFixtureToCircuit: (state, action) => {
      const { fixtureId, circuitId } = action.payload;
      state.circuitMapping[fixtureId] = circuitId;
    },
    
    // Distribution Board management
    setDistributionBoards: (state, action) => {
      state.distributionBoards = action.payload;
    },
    updateDistributionBoard: (state, action) => {
      const { id, ...updates } = action.payload;
      if (state.distributionBoards[id]) {
        state.distributionBoards[id] = { ...state.distributionBoards[id], ...updates };
      }
    },
    assignCircuitToDB: (state, action) => {
      const { circuitId, dbId } = action.payload;
      if (state.circuits[circuitId]) {
        state.circuits[circuitId].db = dbId;
      }
    },
    
    // UI state
    setShowPhaseOverlay: (state, action) => {
      state.showPhaseOverlay = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    // Load balancing
    balanceLoads: (state, action) => {
      const { circuitPhases } = action.payload;
      Object.entries(circuitPhases).forEach(([circuitId, phase]) => {
        if (state.circuits[circuitId]) {
          state.circuits[circuitId].phase = phase;
        }
      });
    },
    
    // Save circuiting data for a specific zone
    saveZoneCircuiting: (state, action) => {
      const { zoneId, fixtures, circuits, labels } = action.payload;
      
      // Save zone circuiting data
      state.zones[zoneId] = {
        fixtures,
        circuits,
        labels,
        timestamp: new Date().toISOString()
      };
    },
    
    // Save circuiting summary for a zone (legacy - keeping for backward compatibility)
    saveZoneCircuitingSummary: (state, action) => {
      const { zoneId, zoneName, fixturesCount, circuits, labels } = action.payload;
      
      // Check if summary for this zone already exists
      const existingIndex = state.circuitingSummary.findIndex(summary => summary.zoneId === zoneId);
      
      if (existingIndex >= 0) {
        // Update existing summary
        state.circuitingSummary[existingIndex] = {
          zoneId,
          zoneName,
          fixturesCount,
          circuits,
          labels,
          timestamp: new Date().toISOString()
        };
      } else {
        // Add new summary
        state.circuitingSummary.push({
          zoneId,
          zoneName,
          fixturesCount,
          circuits,
          labels,
          timestamp: new Date().toISOString()
        });
      }
    },
    
    // Clear circuiting data for a specific zone
    clearZoneCircuiting: (state, action) => {
      const zoneId = action.payload;
      delete state.zones[zoneId];
    },
    
    // Clear all circuiting data
    clearCircuiting: (state) => {
      state.circuits = {};
      state.circuitMapping = {};
      state.selectedZone = null;
      state.showPhaseOverlay = false;
      state.isLoading = false;
      state.error = null;
      state.circuitingSummary = [];
      state.zones = {};
      state.zoneManagement = [];
    }
  },
});

export const {
  setSelectedZone,
  setZoneManagement,
  setZones,
  setCircuits,
  addCircuit,
  updateCircuit,
  removeCircuit,
  setCircuitMapping,
  assignFixtureToCircuit,
  setDistributionBoards,
  updateDistributionBoard,
  assignCircuitToDB,
  setShowPhaseOverlay,
  setLoading,
  setError,
  balanceLoads,
  saveZoneCircuiting,
  saveZoneCircuitingSummary,
  clearZoneCircuiting,
  clearCircuiting
} = circuitingSlice.actions;

export default circuitingSlice.reducer;
