

import { createSlice } from "@reduxjs/toolkit";

const roomsSlice = createSlice({
  name: "rooms",
  initialState: {
    rooms: [],
    currentProjectId: null,
    isLoading: false,
    error: null,
  },
  // Add state migration to handle old array structure
  extraReducers: (builder) => {
    // Handle state rehydration from localStorage
    builder.addMatcher(
      (action) => action.type === 'persist/REHYDRATE',
      (state, action) => {
        if (action.payload && action.payload.rooms) {
          const oldState = action.payload.rooms;
          
          // If old state is an array, convert it to new structure
          if (Array.isArray(oldState)) {
            state.rooms = oldState;
            state.currentProjectId = null;
            state.isLoading = false;
            state.error = null;
          } else if (oldState && typeof oldState === 'object') {
            // If it's already the new structure, use it as is
            state.rooms = oldState.rooms || [];
            state.currentProjectId = oldState.currentProjectId || null;
            state.isLoading = oldState.isLoading || false;
            state.error = oldState.error || null;
          }
        }
      }
    );
  },
  reducers: {
    // Add full room details when created (prevent duplicates)
    addRoom: (state, action) => {
      console.log("🔍 RoomSlice: addRoom called with payload_______&*&*:", action.payload);
      const { 
        id, 
        x, 
        y, 
        width, 
        height, 
        area, 
        name, 
        roomType, 
        wallThickness, 
        falseCeiling, 
        floorId 
      } = action.payload;
      
      console.log("🔍 RoomSlice: Destructured values:", {
        id, x, y, width, height, area, name, roomType, wallThickness, falseCeiling, floorId
      });
      
      // Check if room already exists (by id or _id)
      const existingRoomIndex = state.rooms.findIndex(room => 
        room.id === id || room._id === id || room.id === action.payload._id || room._id === action.payload._id
      );
      
      if (existingRoomIndex >= 0) {
        // Update existing room
        state.rooms[existingRoomIndex] = {
          ...state.rooms[existingRoomIndex],
          ...action.payload,
          id: id || action.payload._id || state.rooms[existingRoomIndex].id,
          _id: action.payload._id || state.rooms[existingRoomIndex]._id,
          name: name || state.rooms[existingRoomIndex].name || "",
          x: x || state.rooms[existingRoomIndex].x,
          y: y || state.rooms[existingRoomIndex].y,
          width: state.rooms[existingRoomIndex].width,
          height: state.rooms[existingRoomIndex].height,
          area: area || width * height || state.rooms[existingRoomIndex].area,
          roomType: roomType || state.rooms[existingRoomIndex].roomType || "",
          wallThickness: wallThickness || state.rooms[existingRoomIndex].wallThickness || 0.2,
          falseCeiling: falseCeiling || state.rooms[existingRoomIndex].falseCeiling || "",
          floorId: floorId || state.rooms[existingRoomIndex].floorId || null,
          createdAt: state.rooms[existingRoomIndex].createdAt || new Date().toISOString(),
        };
      } else {
        // Add new room
        const newRoom = {
          name: name || "",
          width: width,
          height: height,
          area: area || (width || 0) * (height || 0),
          roomType: roomType || "",
          wallThickness: wallThickness || 0.2,
          falseCeiling: falseCeiling || "",
          floorId: floorId || null,
        };
        state.rooms.push(newRoom);
      }
    },

    // Update room name
    updateRoomName: (state, action) => {
      const { id, name } = action.payload;
      const room = state.rooms.find((r) => r.id === id);
      if (room) {
        room.name = name;
      }
    },

    // Update position
    updateRoomPosition: (state, action) => {
      const { id, x, y } = action.payload;
      const room = state.rooms.find((r) => r.id === id);
      if (room) {
        room.x = x;
        room.y = y;
      }
    },

    // Update dimensions and recalculate area
    updateRoomDimensions: (state, action) => {
      console.log("🔍 RoomSlice: updateRoomDimensions called with:", action.payload);
      const { id, width, height } = action.payload;
      const room = state.rooms.find((r) => r.id === id);
      if (room) {
        console.log("🔍 RoomSlice: Room before dimension update:", {
          id: room.id,
          width: room.width,
          height: room.height,
          area: room.area
        });
        room.width = width;
        room.height = height;
        room.area = width * height; // Store raw pixel area
        console.log("🔍 RoomSlice: Room after dimension update:", {
          id: room.id,
          width: room.width,
          height: room.height,
          area: room.area
        });
      } else {
        console.log("🔍 RoomSlice: Room not found for dimension update:", id);
      }
    },

    // Separate area update (optional if needed independently)
    updateRoomArea: (state, action) => {
      const { id, area } = action.payload;
      const room = state.rooms.find((r) => r.id === id);
      if (room) {
        room.area = area;
      }
    },

    // Update room type
    updateRoomType: (state, action) => {
      const { id, roomType } = action.payload;
      const room = state.rooms.find((r) => r.id === id);
      if (room) {
        room.roomType = roomType;
      }
    },

    // Update wall thickness
    updateWallThickness: (state, action) => {
      const { id, wallThickness } = action.payload;
      const room = state.rooms.find((r) => r.id === id);
      if (room) {
        room.wallThickness = wallThickness;
      }
    },

    // Update false ceiling
    updateFalseCeiling: (state, action) => {
      const { id, falseCeiling } = action.payload;
      const room = state.rooms.find((r) => r.id === id);
      if (room) {
        room.falseCeiling = falseCeiling;
      }
    },

    // Update multiple room properties at once
    updateRoomProperties: (state, action) => {
      console.log("🔍 RoomSlice: updateRoomProperties called with:", action.payload);
      const { id, updates } = action.payload;
      const room = state.rooms.find((r) => r.id === id);
      if (room) {
        console.log("🔍 RoomSlice: Room before update:", {
          id: room.id,
          width: room.width,
          height: room.height,
          area: room.area
        });
        Object.assign(room, updates);
        console.log("🔍 RoomSlice: Room after update:", {
          id: room.id,
          width: room.width,
          height: room.height,
          area: room.area
        });
      } else {
        console.log("🔍 RoomSlice: Room not found for update:", id);
      }
    },

    // Remove a specific room
    removeRoom: (state, action) => {
      const roomId = action.payload;
      state.rooms = state.rooms.filter(room => room.id !== roomId);
    },

    // Set rooms from backend (replace all rooms)
    setRooms: (state, action) => {
      const { rooms, projectId } = action.payload;
      
      // Ensure state has the correct structure
      if (!state.rooms) {
        state.rooms = [];
      }
      if (typeof state.currentProjectId === 'undefined') {
        state.currentProjectId = null;
      }
      if (typeof state.isLoading === 'undefined') {
        state.isLoading = false;
      }
      if (typeof state.error === 'undefined') {
        state.error = null;
      }
      
      // Ensure rooms is an array
      const roomsArray = Array.isArray(rooms) ? rooms : [];
      
      state.rooms = roomsArray.map(room => ({
        id: room.id || room._id,
        _id: room._id,
        name: room.name || "",
        x: room.x || 0,
        y: room.y || 0,
        width: room.width || 0,
        height: room.height || 0,
        area: room.area || 0,
        roomType: room.roomType || "",
        wallThickness: room.wallThickness || 0.2,
        falseCeiling: room.falseCeiling || "",
        floorId: room.floorId || null,
        createdAt: room.createdAt || new Date().toISOString(),
      }));
      state.currentProjectId = projectId;
    },

    // Reset all rooms
    resetRooms: (state) => {
      // Ensure state has the correct structure
      if (!state.rooms) {
        state.rooms = [];
      }
      if (typeof state.currentProjectId === 'undefined') {
        state.currentProjectId = null;
      }
      if (typeof state.isLoading === 'undefined') {
        state.isLoading = false;
      }
      if (typeof state.error === 'undefined') {
        state.error = null;
      }
      state.rooms = [];
    },

    // Project-specific actions
    setCurrentProjectId: (state, action) => {
      // Ensure state has the correct structure
      if (!state.rooms) {
        state.rooms = [];
      }
      if (typeof state.isLoading === 'undefined') {
        state.isLoading = false;
      }
      if (typeof state.error === 'undefined') {
        state.error = null;
      }
      state.currentProjectId = action.payload;
    },

    setLoadingState: (state, action) => {
      // Ensure state has the correct structure
      if (!state.rooms) {
        state.rooms = [];
      }
      if (typeof state.currentProjectId === 'undefined') {
        state.currentProjectId = null;
      }
      if (typeof state.error === 'undefined') {
        state.error = null;
      }
      state.isLoading = action.payload;
    },

    setErrorState: (state, action) => {
      // Ensure state has the correct structure
      if (!state.rooms) {
        state.rooms = [];
      }
      if (typeof state.currentProjectId === 'undefined') {
        state.currentProjectId = null;
      }
      if (typeof state.isLoading === 'undefined') {
        state.isLoading = false;
      }
      state.error = action.payload;
    },

    clearProjectData: (state) => {
      // Ensure state has the correct structure
      if (!state.rooms) {
        state.rooms = [];
      }
      if (typeof state.currentProjectId === 'undefined') {
        state.currentProjectId = null;
      }
      if (typeof state.isLoading === 'undefined') {
        state.isLoading = false;
      }
      if (typeof state.error === 'undefined') {
        state.error = null;
      }
      state.rooms = [];
      state.currentProjectId = null;
      state.error = null;
    },
  },
});

export const {
  addRoom,
  updateRoomName,
  updateRoomPosition,
  updateRoomDimensions,
  updateRoomArea,
  updateRoomType,
  updateWallThickness,
  updateFalseCeiling,
  updateRoomProperties,
  removeRoom,
  setRooms,
  resetRooms,
  // Project-specific actions
  setCurrentProjectId,
  setLoadingState,
  setErrorState,
  clearProjectData,
} = roomsSlice.actions;

export default roomsSlice.reducer;
