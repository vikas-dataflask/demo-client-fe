import { createSlice } from "@reduxjs/toolkit";

/**
 * Circuiting Summary Slice
 * 
 * This slice permanently stores completed fixture labeling results for all zones.
 * It is completely independent of the main circuiting slice and persists data
 * across zone switches and circuit resets.
 * 
 * Structure:
 * {
 *   zones: {
 *     Z1: ["Z1/C1/1R1", "Z1/C1/1Y1", "Z1/C1/1B1", ...],
 *     Z2: ["Z2/C1/1R1", "Z2/C1/1Y1", "Z2/C1/1B1", ...],
 *     Z3: ["Z3/C1/1R1", "Z3/C1/1Y1", "Z3/C1/1B1", ...]
 *   }
 * }
 */

const initialState = {
  // Permanent storage for completed zone circuiting summaries
  zones: {} // { zoneId: string[] } - Array of fixture labels for each zone
};

const circuitingSummarySlice = createSlice({
  name: "circuitingSummary",
  initialState,
  reducers: {
    /**
     * Save completed fixture labeling results for a specific zone
     * If the zone already exists, overwrite its data with the new list
     * 
     * @param {Object} state - Current state
     * @param {Object} action - Action payload: { zoneId, fixtures }
     * @param {string} action.payload.zoneId - Zone identifier (e.g., "Z1", "Z2")
     * @param {string[]} action.payload.fixtures - Array of fixture labels for the zone
     */
    saveZoneSummary: (state, action) => {
      const { zoneId, fixtures } = action.payload;
      
      if (zoneId && Array.isArray(fixtures)) {
        state.zones[zoneId] = [...fixtures]; // Create a copy to avoid mutation issues
      }
    },

    /**
     * Clear summary data for a specific zone
     * 
     * @param {Object} state - Current state
     * @param {Object} action - Action payload: { zoneId }
     * @param {string} action.payload.zoneId - Zone identifier to clear
     */
    clearZoneSummary: (state, action) => {
      const { zoneId } = action.payload;
      
      if (zoneId && state.zones[zoneId]) {
        delete state.zones[zoneId];
      }
    },

    /**
     * Clear all zone summaries
     * Resets the entire slice to initial state
     */
    clearAllSummaries: (state) => {
      state.zones = {};
    },

    /**
     * Update specific fixture labels for a zone
     * Useful for editing individual fixtures without regenerating the entire zone
     * 
     * @param {Object} state - Current state
     * @param {Object} action - Action payload: { zoneId, fixtureIndex, newLabel }
     * @param {string} action.payload.zoneId - Zone identifier
     * @param {number} action.payload.fixtureIndex - Index of fixture to update
     * @param {string} action.payload.newLabel - New label for the fixture
     */
    updateFixtureLabel: (state, action) => {
      const { zoneId, fixtureIndex, newLabel } = action.payload;
      
      if (zoneId && state.zones[zoneId] && Array.isArray(state.zones[zoneId])) {
        if (fixtureIndex >= 0 && fixtureIndex < state.zones[zoneId].length) {
          state.zones[zoneId][fixtureIndex] = newLabel;
        }
      }
    },

    /**
     * Add a single fixture label to an existing zone
     * 
     * @param {Object} state - Current state
     * @param {Object} action - Action payload: { zoneId, fixtureLabel }
     * @param {string} action.payload.zoneId - Zone identifier
     * @param {string} action.payload.fixtureLabel - New fixture label to add
     */
    addFixtureLabel: (state, action) => {
      const { zoneId, fixtureLabel } = action.payload;
      
      if (zoneId && fixtureLabel) {
        if (!state.zones[zoneId]) {
          state.zones[zoneId] = [];
        }
        state.zones[zoneId].push(fixtureLabel);
      }
    }
  }
});

// Export actions
export const {
  saveZoneSummary,
  clearZoneSummary,
  clearAllSummaries,
  updateFixtureLabel,
  addFixtureLabel
} = circuitingSummarySlice.actions;

// Export selectors
export const selectCircuitingSummary = (state) => state.circuitingSummary.zones;

export const selectZoneSummary = (state, zoneId) => state.circuitingSummary.zones[zoneId] || [];

export const selectAllZoneIds = (state) => Object.keys(state.circuitingSummary.zones);

export const selectTotalZones = (state) => Object.keys(state.circuitingSummary.zones).length;

export const selectTotalFixtures = (state) => {
  return Object.values(state.circuitingSummary.zones).reduce((total, fixtures) => {
    return total + (Array.isArray(fixtures) ? fixtures.length : 0);
  }, 0);
};

// Export reducer
export default circuitingSummarySlice.reducer;
