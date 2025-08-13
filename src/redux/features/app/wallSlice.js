import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  getWallsByFloor, 
  getWallsByRoom, 
  createWall, 
  updateWall, 
  deleteWall, 
  processRoomWalls 
} from '../../../utils/wallApi';

// Async thunks
export const fetchWallsByFloor = createAsyncThunk(
  'walls/fetchByFloor',
  async ({ projectId, floorId }) => {
    const walls = await getWallsByFloor(projectId, floorId);
    return walls;
  }
);

export const fetchWallsByRoom = createAsyncThunk(
  'walls/fetchByRoom',
  async ({ roomId, projectId, floorId }) => {
    const walls = await getWallsByRoom(roomId, projectId, floorId);
    return { roomId, walls };
  }
);

export const addWall = createAsyncThunk(
  'walls/add',
  async (wallData) => {
    const wall = await createWall(wallData);
    return wall;
  }
);

export const updateWallAsync = createAsyncThunk(
  'walls/update',
  async ({ wallId, updates }) => {
    const wall = await updateWall(wallId, updates);
    return wall;
  }
);

export const deleteWallAsync = createAsyncThunk(
  'walls/delete',
  async ({ wallId, roomId }) => {
    await deleteWall(wallId, roomId);
    return { wallId, roomId };
  }
);

export const processRoomWallsAsync = createAsyncThunk(
  'walls/processRoom',
  async ({ projectId, floorId, roomId, roomGeometry }) => {
    const walls = await processRoomWalls(projectId, floorId, roomId, roomGeometry);
    return { roomId, walls };
  }
);

const initialState = {
  walls: [],
  wallsByRoom: {}, // walls grouped by room ID
  selectedWall: null,
  isLoading: false,
  error: null,
  wallStats: null,
  highlightedWalls: [], // walls to highlight when room is selected
};

const wallSlice = createSlice({
  name: 'walls',
  initialState,
  reducers: {
    setSelectedWall: (state, action) => {
      state.selectedWall = action.payload;
    },
    clearSelectedWall: (state) => {
      state.selectedWall = null;
    },
    setHighlightedWalls: (state, action) => {
      state.highlightedWalls = action.payload;
    },
    clearHighlightedWalls: (state) => {
      state.highlightedWalls = [];
    },
    addWallToState: (state, action) => {
      const wall = {
        ...action.payload,
        id: action.payload.id || action.payload._id
      };
      const existingIndex = state.walls.findIndex(w => w.id === wall.id || w._id === wall._id);
      
      if (existingIndex >= 0) {
        state.walls[existingIndex] = wall;
      } else {
        state.walls.push(wall);
      }
      
      // Update wallsByRoom
      wall.connectedRooms.forEach(roomId => {
        if (!state.wallsByRoom[roomId]) {
          state.wallsByRoom[roomId] = [];
        }
        const roomWalls = state.wallsByRoom[roomId];
        const existingRoomWallIndex = roomWalls.findIndex(w => w.id === wall.id || w._id === wall._id);
        
        if (existingRoomWallIndex >= 0) {
          roomWalls[existingRoomWallIndex] = wall;
        } else {
          roomWalls.push(wall);
        }
      });
    },
    removeWallFromState: (state, action) => {
      const wallId = action.payload;
      state.walls = state.walls.filter(w => w.id !== wallId && w._id !== wallId);
      
      // Remove from wallsByRoom
      Object.keys(state.wallsByRoom).forEach(roomId => {
        state.wallsByRoom[roomId] = state.wallsByRoom[roomId].filter(w => w.id !== wallId && w._id !== wallId);
      });
    },
    updateWallInState: (state, action) => {
      const updatedWall = {
        ...action.payload,
        id: action.payload.id || action.payload._id
      };
      const index = state.walls.findIndex(w => w.id === updatedWall.id || w._id === updatedWall._id);
      
      if (index >= 0) {
        state.walls[index] = updatedWall;
        
        // Update in wallsByRoom
        updatedWall.connectedRooms.forEach(roomId => {
          if (state.wallsByRoom[roomId]) {
            const roomWallIndex = state.wallsByRoom[roomId].findIndex(w => w.id === updatedWall.id || w._id === updatedWall._id);
            if (roomWallIndex >= 0) {
              state.wallsByRoom[roomId][roomWallIndex] = updatedWall;
            }
          }
        });
      }
    },
    clearWalls: (state) => {
      state.walls = [];
      state.wallsByRoom = {};
      state.selectedWall = null;
      state.highlightedWalls = [];
    },
    setWallStats: (state, action) => {
      state.wallStats = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch walls by floor
      .addCase(fetchWallsByFloor.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWallsByFloor.fulfilled, (state, action) => {
        state.isLoading = false;
        // Ensure walls have both id and _id for compatibility
        const wallsWithIds = action.payload.map(wall => ({
          ...wall,
          id: wall.id || wall._id
        }));
        state.walls = wallsWithIds;
        
        // Group walls by room
        state.wallsByRoom = {};
        wallsWithIds.forEach(wall => {
          wall.connectedRooms.forEach(roomId => {
            if (!state.wallsByRoom[roomId]) {
              state.wallsByRoom[roomId] = [];
            }
            state.wallsByRoom[roomId].push(wall);
          });
        });
      })
      .addCase(fetchWallsByFloor.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      
      // Fetch walls by room
      .addCase(fetchWallsByRoom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWallsByRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        const { roomId, walls } = action.payload;
        state.wallsByRoom[roomId] = walls;
      })
      .addCase(fetchWallsByRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      
      // Add wall
      .addCase(addWall.fulfilled, (state, action) => {
        const wall = {
          ...action.payload,
          id: action.payload.id || action.payload._id
        };
        state.walls.push(wall);
        
        // Add to wallsByRoom
        wall.connectedRooms.forEach(roomId => {
          if (!state.wallsByRoom[roomId]) {
            state.wallsByRoom[roomId] = [];
          }
          state.wallsByRoom[roomId].push(wall);
        });
      })
      
      // Update wall
      .addCase(updateWallAsync.fulfilled, (state, action) => {
        const updatedWall = {
          ...action.payload,
          id: action.payload.id || action.payload._id
        };
        const index = state.walls.findIndex(w => w.id === updatedWall.id || w._id === updatedWall._id);
        
        if (index >= 0) {
          state.walls[index] = updatedWall;
          
          // Update in wallsByRoom
          updatedWall.connectedRooms.forEach(roomId => {
            if (state.wallsByRoom[roomId]) {
              const roomWallIndex = state.wallsByRoom[roomId].findIndex(w => w.id === updatedWall.id || w._id === updatedWall._id);
              if (roomWallIndex >= 0) {
                state.wallsByRoom[roomId][roomWallIndex] = updatedWall;
              }
            }
          });
        }
      })
      
      // Delete wall
      .addCase(deleteWallAsync.fulfilled, (state, action) => {
        const { wallId, roomId } = action.payload;
        
        // Remove from walls array
        state.walls = state.walls.filter(w => w.id !== wallId && w._id !== wallId);
        
        // Remove from wallsByRoom
        if (state.wallsByRoom[roomId]) {
          state.wallsByRoom[roomId] = state.wallsByRoom[roomId].filter(w => w.id !== wallId && w._id !== wallId);
        }
      })
      
      // Process room walls
      .addCase(processRoomWallsAsync.fulfilled, (state, action) => {
        const { roomId, walls } = action.payload;
        
        // Ensure walls have both id and _id for compatibility
        const wallsWithIds = walls.map(wall => ({
          ...wall,
          id: wall.id || wall._id
        }));
        
        // Add new walls to global state (don't overwrite existing walls)
        wallsWithIds.forEach(wall => {
          const existingIndex = state.walls.findIndex(w => w.id === wall.id || w._id === wall._id);
          if (existingIndex >= 0) {
            // Update existing wall (in case it's now shared)
            state.walls[existingIndex] = wall;
          } else {
            // Add new wall to global array
            state.walls.push(wall);
          }
        });
        
        // Update wallsByRoom for this specific room
        if (!state.wallsByRoom[roomId]) {
          state.wallsByRoom[roomId] = [];
        }
        
        // Add walls to this room's array (don't overwrite)
        wallsWithIds.forEach(wall => {
          const existingIndex = state.wallsByRoom[roomId].findIndex(w => w.id === wall.id || w._id === wall._id);
          if (existingIndex >= 0) {
            state.wallsByRoom[roomId][existingIndex] = wall;
          } else {
            state.wallsByRoom[roomId].push(wall);
          }
        });
      });
  },
});

export const {
  setSelectedWall,
  clearSelectedWall,
  setHighlightedWalls,
  clearHighlightedWalls,
  addWallToState,
  removeWallFromState,
  updateWallInState,
  clearWalls,
  setWallStats,
} = wallSlice.actions;

// Selectors
export const selectAllWalls = (state) => state.walls.walls;
export const selectWallsByRoom = (state, roomId) => state.walls.wallsByRoom[roomId] || [];
export const selectSelectedWall = (state) => state.walls.selectedWall;
export const selectHighlightedWalls = (state) => state.walls.highlightedWalls;
export const selectWallsLoading = (state) => state.walls.isLoading;
export const selectWallsError = (state) => state.walls.error;
export const selectWallStats = (state) => state.walls.wallStats;

export default wallSlice.reducer; 