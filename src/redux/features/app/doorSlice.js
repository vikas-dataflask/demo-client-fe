import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  createDoor, 
  getDoorsByRoom, 
  getDoorsByWall, 
  updateDoor, 
  deleteDoor 
} from '../../../utils/doorApi';

// Async thunks
export const fetchDoorsByRoom = createAsyncThunk(
  'doors/fetchByRoom',
  async ({ roomId, projectId, floorId }) => {
    const doors = await getDoorsByRoom(roomId, projectId, floorId);
    return { roomId, doors };
  }
);

export const fetchDoorsByWall = createAsyncThunk(
  'doors/fetchByWall',
  async ({ wallId }) => {
    const doors = await getDoorsByWall(wallId);
    return { wallId, doors };
  }
);

export const addDoor = createAsyncThunk(
  'doors/add',
  async (doorData) => {
    const door = await createDoor(doorData);
    return door;
  }
);

export const updateDoorAsync = createAsyncThunk(
  'doors/update',
  async ({ doorId, updates }) => {
    const door = await updateDoor(doorId, updates);
    return door;
  }
);

export const deleteDoorAsync = createAsyncThunk(
  'doors/delete',
  async ({ doorId }) => {
    await deleteDoor(doorId);
    return { doorId };
  }
);

const initialState = {
  doors: [],
  doorsByRoom: {}, // doors grouped by room ID
  doorsByWall: {}, // doors grouped by wall ID
  selectedDoor: null,
  isLoading: false,
  error: null,
};

const doorSlice = createSlice({
  name: 'doors',
  initialState,
  reducers: {
    setSelectedDoor: (state, action) => {
      state.selectedDoor = action.payload;
    },
    clearSelectedDoor: (state) => {
      state.selectedDoor = null;
    },
    addDoorToState: (state, action) => {
      const door = {
        ...action.payload,
        id: action.payload.id || action.payload._id
      };
      const existingIndex = state.doors.findIndex(d => d.id === door.id || d._id === door._id);
      
      if (existingIndex >= 0) {
        state.doors[existingIndex] = door;
      } else {
        state.doors.push(door);
      }
      
      // Update doorsByRoom
      if (!state.doorsByRoom[door.roomId]) {
        state.doorsByRoom[door.roomId] = [];
      }
      const roomDoors = state.doorsByRoom[door.roomId];
      const existingRoomDoorIndex = roomDoors.findIndex(d => d.id === door.id || d._id === door._id);
      
      if (existingRoomDoorIndex >= 0) {
        roomDoors[existingRoomDoorIndex] = door;
      } else {
        roomDoors.push(door);
      }
      
      // Update doorsByWall
      if (!state.doorsByWall[door.wallId]) {
        state.doorsByWall[door.wallId] = [];
      }
      const wallDoors = state.doorsByWall[door.wallId];
      const existingWallDoorIndex = wallDoors.findIndex(d => d.id === door.id || d._id === door._id);
      
      if (existingWallDoorIndex >= 0) {
        wallDoors[existingWallDoorIndex] = door;
      } else {
        wallDoors.push(door);
      }
    },
    removeDoorFromState: (state, action) => {
      const doorId = action.payload;
      state.doors = state.doors.filter(d => d.id !== doorId && d._id !== doorId);
      
      // Remove from doorsByRoom
      Object.keys(state.doorsByRoom).forEach(roomId => {
        state.doorsByRoom[roomId] = state.doorsByRoom[roomId].filter(d => d.id !== doorId && d._id !== doorId);
      });
      
      // Remove from doorsByWall
      Object.keys(state.doorsByWall).forEach(wallId => {
        state.doorsByWall[wallId] = state.doorsByWall[wallId].filter(d => d.id !== doorId && d._id !== doorId);
      });
    },
    clearDoors: (state) => {
      state.doors = [];
      state.doorsByRoom = {};
      state.doorsByWall = {};
      state.selectedDoor = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch doors by room
      .addCase(fetchDoorsByRoom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDoorsByRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        const { roomId, doors } = action.payload;
        
        // Ensure doors have both id and _id for compatibility
        const doorsWithIds = doors.map(door => ({
          ...door,
          id: door.id || door._id
        }));
        
        state.doorsByRoom[roomId] = doorsWithIds;
        
        // Add to global doors array
        doorsWithIds.forEach(door => {
          const existingIndex = state.doors.findIndex(d => d.id === door.id || d._id === door._id);
          if (existingIndex >= 0) {
            state.doors[existingIndex] = door;
          } else {
            state.doors.push(door);
          }
        });
      })
      .addCase(fetchDoorsByRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      
      // Fetch doors by wall
      .addCase(fetchDoorsByWall.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDoorsByWall.fulfilled, (state, action) => {
        state.isLoading = false;
        const { wallId, doors } = action.payload;
        
        // Ensure doors have both id and _id for compatibility
        const doorsWithIds = doors.map(door => ({
          ...door,
          id: door.id || door._id
        }));
        
        state.doorsByWall[wallId] = doorsWithIds;
      })
      .addCase(fetchDoorsByWall.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      
      // Add door
      .addCase(addDoor.fulfilled, (state, action) => {
        const door = {
          ...action.payload,
          id: action.payload.id || action.payload._id
        };
        state.doors.push(door);
        
        // Add to doorsByRoom
        if (!state.doorsByRoom[door.roomId]) {
          state.doorsByRoom[door.roomId] = [];
        }
        state.doorsByRoom[door.roomId].push(door);
        
        // Add to doorsByWall
        if (!state.doorsByWall[door.wallId]) {
          state.doorsByWall[door.wallId] = [];
        }
        state.doorsByWall[door.wallId].push(door);
      })
      
      // Update door
      .addCase(updateDoorAsync.fulfilled, (state, action) => {
        const updatedDoor = {
          ...action.payload,
          id: action.payload.id || action.payload._id
        };
        const index = state.doors.findIndex(d => d.id === updatedDoor.id || d._id === updatedDoor._id);
        
        if (index >= 0) {
          state.doors[index] = updatedDoor;
          
          // Update in doorsByRoom
          if (state.doorsByRoom[updatedDoor.roomId]) {
            const roomDoorIndex = state.doorsByRoom[updatedDoor.roomId].findIndex(d => d.id === updatedDoor.id || d._id === updatedDoor._id);
            if (roomDoorIndex >= 0) {
              state.doorsByRoom[updatedDoor.roomId][roomDoorIndex] = updatedDoor;
            }
          }
          
          // Update in doorsByWall
          if (state.doorsByWall[updatedDoor.wallId]) {
            const wallDoorIndex = state.doorsByWall[updatedDoor.wallId].findIndex(d => d.id === updatedDoor.id || d._id === updatedDoor._id);
            if (wallDoorIndex >= 0) {
              state.doorsByWall[updatedDoor.wallId][wallDoorIndex] = updatedDoor;
            }
          }
        }
      })
      
      // Delete door
      .addCase(deleteDoorAsync.fulfilled, (state, action) => {
        const { doorId } = action.payload;
        
        // Remove from doors array
        state.doors = state.doors.filter(d => d.id !== doorId && d._id !== doorId);
        
        // Remove from doorsByRoom
        Object.keys(state.doorsByRoom).forEach(roomId => {
          state.doorsByRoom[roomId] = state.doorsByRoom[roomId].filter(d => d.id !== doorId && d._id !== doorId);
        });
        
        // Remove from doorsByWall
        Object.keys(state.doorsByWall).forEach(wallId => {
          state.doorsByWall[wallId] = state.doorsByWall[wallId].filter(d => d.id !== doorId && d._id !== doorId);
        });
      });
  },
});

export const {
  setSelectedDoor,
  clearSelectedDoor,
  addDoorToState,
  removeDoorFromState,
  clearDoors,
} = doorSlice.actions;

// Selectors
export const selectAllDoors = (state) => state.doors.doors;
export const selectDoorsByRoom = (state, roomId) => state.doors.doorsByRoom[roomId] || [];
export const selectDoorsByWall = (state, wallId) => state.doors.doorsByWall[wallId] || [];
export const selectSelectedDoor = (state) => state.doors.selectedDoor;
export const selectDoorsLoading = (state) => state.doors.isLoading;
export const selectDoorsError = (state) => state.doors.error;

export default doorSlice.reducer; 