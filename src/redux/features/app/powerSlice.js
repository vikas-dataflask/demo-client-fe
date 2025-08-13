import { createSlice } from "@reduxjs/toolkit";

// Load from localStorage
const loadFromLocalStorage = () => {
  try {
    const data = localStorage.getItem("powerState");
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

// Save to localStorage
const saveToLocalStorage = (state) => {
  try {
    localStorage.setItem("powerState", JSON.stringify(state));
  } catch {}
};

const persistedState = loadFromLocalStorage();

const initialState = {
  powerByRoom: {},
  combinedLoadByRoom: {},
  dbLoads: [], // [{ dbName, type, totalLoad }]
  totalConnectedLoad: 0,
  // New fields for device management
  devices: [], // Array of power devices
  deviceCounter: 0, // For generating unique IDs
};

// Merge persisted state with defaults to ensure all required fields exist
const mergedState = persistedState ? {
  ...initialState,
  ...persistedState,
  // Ensure arrays and objects are properly initialized
  devices: persistedState.devices || [],
  powerByRoom: persistedState.powerByRoom || {},
  combinedLoadByRoom: persistedState.combinedLoadByRoom || {},
  dbLoads: persistedState.dbLoads || [],
  // Ensure deviceCounter is properly set
  deviceCounter: persistedState.deviceCounter || 0,
} : initialState;

const powerSlice = createSlice({
  name: "power",
  initialState: mergedState,
  reducers: {
    setRoomPower(state, action) {
      const { roomId, powerPerButton, numberOfButtons, totalPower } =
        action.payload;
      state.powerByRoom[roomId] = {
        powerPerButton: powerPerButton || 0,
        numberOfButtons: numberOfButtons || 1,
        totalPower: totalPower || 0,
      };
      saveToLocalStorage(state);
    },
    setCombinedLoad(state, action) {
      const { roomId, totalLoad } = action.payload;
      state.combinedLoadByRoom[roomId] = totalLoad;
      saveToLocalStorage(state);
    },
    addDbLoad(state, action) {
      const { dbName, type, totalLoad } = action.payload;
      state.dbLoads.push({ dbName, type, totalLoad });
      state.totalConnectedLoad += totalLoad;
      saveToLocalStorage(state);
    },
    resetDbLoads(state) {
      state.dbLoads = [];
      state.totalConnectedLoad = 0;
      saveToLocalStorage(state);
    },
    clearPower(state) {
      state.powerByRoom = {};
      state.combinedLoadByRoom = {};
      saveToLocalStorage(state);
    },
    // New actions for device management
    addDevice(state, action) {
      // Ensure devices array exists
      if (!state.devices) {
        state.devices = [];
      }
      
      const newDevice = {
        ...action.payload,
        id: state.deviceCounter + 1,
        createdAt: new Date().toISOString(),
      };
      state.devices.push(newDevice);
      state.deviceCounter += 1;
      saveToLocalStorage(state);
    },
    removeDevice(state, action) {
      // Ensure devices array exists
      if (!state.devices) {
        state.devices = [];
        return;
      }
      
      const deviceId = action.payload;
      state.devices = state.devices.filter(device => device.id !== deviceId);
      saveToLocalStorage(state);
    },
    updateDevice(state, action) {
      // Ensure devices array exists
      if (!state.devices) {
        state.devices = [];
        return;
      }
      
      const { id, updates } = action.payload;
      const deviceIndex = state.devices.findIndex(device => device.id === id);
      if (deviceIndex !== -1) {
        state.devices[deviceIndex] = {
          ...state.devices[deviceIndex],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        saveToLocalStorage(state);
      }
      saveToLocalStorage(state);
    },
    clearDevices(state) {
      state.devices = [];
      state.deviceCounter = 0;
      saveToLocalStorage(state);
    },
    // Bulk operations
    setDevices(state, action) {
      state.devices = action.payload;
      // Update counter to be higher than any existing device ID
      if (action.payload.length > 0) {
        state.deviceCounter = Math.max(...action.payload.map(d => d.id), 0);
      }
      saveToLocalStorage(state);
    },
  },
});

export const {
  setRoomPower,
  setCombinedLoad,
  addDbLoad,
  resetDbLoads,
  clearPower,
  addDevice,
  removeDevice,
  updateDevice,
  clearDevices,
  setDevices,
} = powerSlice.actions;

export default powerSlice.reducer;
