import { createSlice } from "@reduxjs/toolkit";

// Load from localStorage
const loadFromLocalStorage = () => {
  try {
    const data = localStorage.getItem("heatLoadState");
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

// Save to localStorage
const saveToLocalStorage = (state) => {
  try {
    localStorage.setItem("heatLoadState", JSON.stringify(state));
  } catch {}
};

const persistedState = loadFromLocalStorage();

const initialState = persistedState || {
  heatLoadByRoom: {}, // { roomName: { tonnage, totalLoad, loadWithSafetyFactor, sensibleLoad, latentLoad, breakdown, timestamp } }
  isLoading: false,
  error: null,
  lastCalculation: null,
};

const heatLoadSlice = createSlice({
  name: "heatLoad",
  initialState,
  reducers: {
    // Store heat load result for a specific room
    setRoomHeatLoad: (state, action) => {
      const { roomName, result } = action.payload;
      state.heatLoadByRoom[roomName] = {
        ...result,
        timestamp: new Date().toISOString(),
        calculatedAt: Date.now(),
      };
      state.lastCalculation = roomName;
      saveToLocalStorage(state);
    },

    // Update heat load for a room
    updateRoomHeatLoad: (state, action) => {
      const { roomName, updates } = action.payload;
      if (state.heatLoadByRoom[roomName]) {
        state.heatLoadByRoom[roomName] = {
          ...state.heatLoadByRoom[roomName],
          ...updates,
          timestamp: new Date().toISOString(),
        };
        saveToLocalStorage(state);
      }
    },

    // Remove heat load data for a room
    removeRoomHeatLoad: (state, action) => {
      const roomName = action.payload;
      delete state.heatLoadByRoom[roomName];
      if (state.lastCalculation === roomName) {
        state.lastCalculation = null;
      }
      saveToLocalStorage(state);
    },

    // Clear all heat load data
    clearHeatLoadData: (state) => {
      state.heatLoadByRoom = {};
      state.lastCalculation = null;
      state.error = null;
      saveToLocalStorage(state);
    },

    // Set loading state
    setHeatLoadLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    // Set error state
    setHeatLoadError: (state, action) => {
      state.error = action.payload;
    },

    // Clear error
    clearHeatLoadError: (state) => {
      state.error = null;
    },

    // Get heat load capacity for a room (derived selector helper)
    getRoomHeatLoadCapacity: (state, action) => {
      const roomName = action.payload;
      const roomData = state.heatLoadByRoom[roomName];
      if (roomData) {
        // Return tonnage converted to kW (1 TR = 3.517 kW)
        return roomData.tonnage ? (roomData.tonnage * 3.517).toFixed(2) : null;
      }
      return null;
    },
  },
});

export const {
  setRoomHeatLoad,
  updateRoomHeatLoad,
  removeRoomHeatLoad,
  clearHeatLoadData,
  setHeatLoadLoading,
  setHeatLoadError,
  clearHeatLoadError,
  getRoomHeatLoadCapacity,
} = heatLoadSlice.actions;

// Selectors
export const selectHeatLoadByRoom = (state) => state.heatLoad.heatLoadByRoom;
export const selectRoomHeatLoad = (roomName) => (state) =>
  state.heatLoad.heatLoadByRoom[roomName];
export const selectRoomHeatLoadCapacity = (roomName) => (state) => {
  const roomData = state.heatLoad.heatLoadByRoom[roomName];
  if (roomData && roomData.tonnage) {
    // Convert tonnage to kW (1 TR = 3.517 kW)
    return (roomData.tonnage * 3.517).toFixed(2);
  }
  return null;
};
export const selectHeatLoadLoading = (state) => state.heatLoad.isLoading;
export const selectHeatLoadError = (state) => state.heatLoad.error;
export const selectLastCalculation = (state) => state.heatLoad.lastCalculation;

export default heatLoadSlice.reducer;
