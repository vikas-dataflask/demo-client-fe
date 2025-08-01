// redux/slices/areaMarkupSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  scale: "m", // Display unit
  dxf_unit: "METERS", // DXF file unit
  drawing_scale: "ARCHITECTURAL", // Drawing scale type
  floor_length: 0,
  floor_width: 0,
  floor_height: 0,
  floor_area: 0,
  floor_volume: 0,
  floor_rect: null, // Store the floor rectangle from Editor.jsx
  floor_dxf: null,
  floor_bounds: null,
  // Multi-floor support
  floors: [], // Array of all floors
  currentFloorId: null, // ID of currently selected floor
  floorMode: 'rectangle', // 'rectangle', 'polygon', 'manual'
  isDrawingFloor: false,
  // Legacy support - keep for backward compatibility
  floor: null, // Current floor object (deprecated, use floors array instead)
};

const floorSlice = createSlice({
  name: "floor",
  initialState,
  reducers: {
    setScale(state, action) {
      state.scale = action.payload;
    },
    setDxfUnit(state, action) {
      state.dxf_unit = action.payload;
    },
    setDrawingScale(state, action) {
      state.drawing_scale = action.payload;
    },
    setFloorLength(state, action) {
      state.floor_length = action.payload;
    },
    setFloorWidth(state, action) {
      state.floor_width = action.payload;
    },
    setFloorHeight(state, action) {
      state.floor_height = action.payload;
    },
    setFloorArea(state, action) {
      state.floor_area = action.payload;
    },
    setFloorVolume(state, action) {
      state.floor_volume = action.payload;
    },
    setFloorRect(state, action) {
      state.floor_rect = action.payload;
    },
    setFloorDxf(state, action) {
      state.floor_dxf = action.payload;
    },
    setFloorBounds(state, action) {
      state.floor_dxf = action.payload;
    },
    // Multi-floor actions
    setFloors(state, action) {
      state.floors = action.payload;
    },
    addFloor(state, action) {
      state.floors.push(action.payload);
      if (!state.currentFloorId) {
        state.currentFloorId = action.payload.id;
      }
    },
    updateFloor(state, action) {
      const { id, updates } = action.payload;
      const floorIndex = state.floors.findIndex(floor => floor.id === id);
      if (floorIndex !== -1) {
        state.floors[floorIndex] = { ...state.floors[floorIndex], ...updates };
      }
    },
    removeFloor(state, action) {
      const floorId = action.payload;
      state.floors = state.floors.filter(floor => floor.id !== floorId);
      
      // If we removed the current floor, select the first available floor
      if (state.currentFloorId === floorId) {
        state.currentFloorId = state.floors.length > 0 ? state.floors[0].id : null;
      }
    },
    setCurrentFloorId(state, action) {
      state.currentFloorId = action.payload;
    },
    setFloorMode(state, action) {
      state.floorMode = action.payload;
    },
    setIsDrawingFloor(state, action) {
      state.isDrawingFloor = action.payload;
    },
    // Legacy actions (for backward compatibility)
    setFloor(state, action) {
      state.floor = action.payload;
      // Also update the floors array for compatibility
      if (action.payload) {
        const existingFloorIndex = state.floors.findIndex(f => f.id === action.payload.id);
        if (existingFloorIndex !== -1) {
          state.floors[existingFloorIndex] = action.payload;
        } else {
          state.floors.push(action.payload);
        }
        state.currentFloorId = action.payload.id;
      }
    },
    clearFloor(state) {
      state.floor = null;
      state.floor_length = 0;
      state.floor_width = 0;
      state.floor_area = 0;
      state.floor_volume = 0;
      state.floor_rect = null;
      state.floor_bounds = null;
      // Don't clear floors array, just clear current floor
      state.currentFloorId = null;
    },
    clearAllFloors(state) {
      state.floors = [];
      state.currentFloorId = null;
      state.floor = null;
      state.floor_length = 0;
      state.floor_width = 0;
      state.floor_area = 0;
      state.floor_volume = 0;
      state.floor_rect = null;
      state.floor_bounds = null;
    },
  },
});

export const {
  setScale,
  setDxfUnit,
  setDrawingScale,
  setFloorLength,
  setFloorWidth,
  setFloorHeight,
  setFloorArea,
  setFloorVolume,
  setFloorRect,
  setFloorDxf,
  setFloorBounds,
  // Multi-floor actions
  setFloors,
  addFloor,
  updateFloor,
  removeFloor,
  setCurrentFloorId,
  setFloorMode,
  setIsDrawingFloor,
  // Legacy actions
  setFloor,
  clearFloor,
  clearAllFloors,
} = floorSlice.actions;

export default floorSlice.reducer;
