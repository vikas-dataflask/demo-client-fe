import { createSlice } from '@reduxjs/toolkit';

const aiRoomDataSlice = createSlice({
  name: 'aiRoomData',
  initialState: {
    rooms: [], // Array of rooms extracted from AI responses
    lastUpdated: null,
    isLoading: false,
    error: null
  },
  reducers: {
    // Set rooms extracted from AI response
    setAIRooms: (state, action) => {
      state.rooms = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    
    // Add a single room from AI response
    addAIRoom: (state, action) => {
      const existingIndex = state.rooms.findIndex(room => room.name === action.payload.name);
      if (existingIndex >= 0) {
        // Update existing room
        state.rooms[existingIndex] = { ...state.rooms[existingIndex], ...action.payload };
      } else {
        // Add new room
        state.rooms.push(action.payload);
      }
      state.lastUpdated = new Date().toISOString();
    },
    
    // Clear all AI room data
    clearAIRooms: (state) => {
      state.rooms = [];
      state.lastUpdated = null;
    },
    
    // Set loading state
    setAIRoomLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    
    // Set error state
    setAIRoomError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const { 
  setAIRooms, 
  addAIRoom, 
  clearAIRooms, 
  setAIRoomLoading, 
  setAIRoomError 
} = aiRoomDataSlice.actions;

export default aiRoomDataSlice.reducer;
