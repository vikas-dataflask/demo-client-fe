import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  createWindow, 
  getWindowsByRoom, 
  getWindowsByWall, 
  updateWindow, 
  deleteWindow 
} from '../../../utils/windowApi';

// Async thunks
export const fetchWindowsByRoom = createAsyncThunk(
  'windows/fetchByRoom',
  async ({ roomId, projectId, floorId }) => {
    const windows = await getWindowsByRoom(roomId, projectId, floorId);
    return { roomId, windows };
  }
);

export const fetchWindowsByWall = createAsyncThunk(
  'windows/fetchByWall',
  async ({ wallId }) => {
    const windows = await getWindowsByWall(wallId);
    return { wallId, windows };
  }
);

export const addWindow = createAsyncThunk(
  'windows/add',
  async (windowData) => {
    const window = await createWindow(windowData);
    return window;
  }
);

export const updateWindowAsync = createAsyncThunk(
  'windows/update',
  async ({ windowId, updates }) => {
    const window = await updateWindow(windowId, updates);
    return window;
  }
);

export const deleteWindowAsync = createAsyncThunk(
  'windows/delete',
  async ({ windowId }) => {
    await deleteWindow(windowId);
    return { windowId };
  }
);

const initialState = {
  windows: [],
  windowsByRoom: {}, // windows grouped by room ID
  windowsByWall: {}, // windows grouped by wall ID
  selectedWindow: null,
  isLoading: false,
  error: null,
};

const windowSlice = createSlice({
  name: 'windows',
  initialState,
  reducers: {
    setSelectedWindow: (state, action) => {
      state.selectedWindow = action.payload;
    },
    clearSelectedWindow: (state) => {
      state.selectedWindow = null;
    },
    addWindowToState: (state, action) => {
      const window = {
        ...action.payload,
        id: action.payload.id || action.payload._id
      };
      const existingIndex = state.windows.findIndex(w => w.id === window.id || w._id === window._id);
      
      if (existingIndex >= 0) {
        state.windows[existingIndex] = window;
      } else {
        state.windows.push(window);
      }
      
      // Update windowsByRoom
      if (!state.windowsByRoom[window.roomId]) {
        state.windowsByRoom[window.roomId] = [];
      }
      const roomWindows = state.windowsByRoom[window.roomId];
      const existingRoomWindowIndex = roomWindows.findIndex(w => w.id === window.id || w._id === window._id);
      
      if (existingRoomWindowIndex >= 0) {
        roomWindows[existingRoomWindowIndex] = window;
      } else {
        roomWindows.push(window);
      }
      
      // Update windowsByWall
      if (!state.windowsByWall[window.wallId]) {
        state.windowsByWall[window.wallId] = [];
      }
      const wallWindows = state.windowsByWall[window.wallId];
      const existingWallWindowIndex = wallWindows.findIndex(w => w.id === window.id || w._id === window._id);
      
      if (existingWallWindowIndex >= 0) {
        wallWindows[existingWallWindowIndex] = window;
      } else {
        wallWindows.push(window);
      }
    },
    removeWindowFromState: (state, action) => {
      const windowId = action.payload;
      state.windows = state.windows.filter(w => w.id !== windowId && w._id !== windowId);
      
      // Remove from windowsByRoom
      Object.keys(state.windowsByRoom).forEach(roomId => {
        state.windowsByRoom[roomId] = state.windowsByRoom[roomId].filter(w => w.id !== windowId && w._id !== windowId);
      });
      
      // Remove from windowsByWall
      Object.keys(state.windowsByWall).forEach(wallId => {
        state.windowsByWall[wallId] = state.windowsByWall[wallId].filter(w => w.id !== windowId && w._id !== windowId);
      });
    },
    clearWindows: (state) => {
      state.windows = [];
      state.windowsByRoom = {};
      state.windowsByWall = {};
      state.selectedWindow = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch windows by room
      .addCase(fetchWindowsByRoom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWindowsByRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        const { roomId, windows } = action.payload;
        
        // Ensure windows have both id and _id for compatibility
        const windowsWithIds = windows.map(window => ({
          ...window,
          id: window.id || window._id
        }));
        
        state.windowsByRoom[roomId] = windowsWithIds;
        
        // Add to global windows array
        windowsWithIds.forEach(window => {
          const existingIndex = state.windows.findIndex(w => w.id === window.id || w._id === window._id);
          if (existingIndex >= 0) {
            state.windows[existingIndex] = window;
          } else {
            state.windows.push(window);
          }
        });
      })
      .addCase(fetchWindowsByRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      
      // Fetch windows by wall
      .addCase(fetchWindowsByWall.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWindowsByWall.fulfilled, (state, action) => {
        state.isLoading = false;
        const { wallId, windows } = action.payload;
        
        // Ensure windows have both id and _id for compatibility
        const windowsWithIds = windows.map(window => ({
          ...window,
          id: window.id || window._id
        }));
        
        state.windowsByWall[wallId] = windowsWithIds;
      })
      .addCase(fetchWindowsByWall.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      
      // Add window
      .addCase(addWindow.fulfilled, (state, action) => {
        const window = {
          ...action.payload,
          id: action.payload.id || action.payload._id
        };
        state.windows.push(window);
        
        // Add to windowsByRoom
        if (!state.windowsByRoom[window.roomId]) {
          state.windowsByRoom[window.roomId] = [];
        }
        state.windowsByRoom[window.roomId].push(window);
        
        // Add to windowsByWall
        if (!state.windowsByWall[window.wallId]) {
          state.windowsByWall[window.wallId] = [];
        }
        state.windowsByWall[window.wallId].push(window);
      })
      
      // Update window
      .addCase(updateWindowAsync.fulfilled, (state, action) => {
        const updatedWindow = {
          ...action.payload,
          id: action.payload.id || action.payload._id
        };
        const index = state.windows.findIndex(w => w.id === updatedWindow.id || w._id === updatedWindow._id);
        
        if (index >= 0) {
          state.windows[index] = updatedWindow;
          
          // Update in windowsByRoom
          if (state.windowsByRoom[updatedWindow.roomId]) {
            const roomWindowIndex = state.windowsByRoom[updatedWindow.roomId].findIndex(w => w.id === updatedWindow.id || w._id === updatedWindow._id);
            if (roomWindowIndex >= 0) {
              state.windowsByRoom[updatedWindow.roomId][roomWindowIndex] = updatedWindow;
            }
          }
          
          // Update in windowsByWall
          if (state.windowsByWall[updatedWindow.wallId]) {
            const wallWindowIndex = state.windowsByWall[updatedWindow.wallId].findIndex(w => w.id === updatedWindow.id || w._id === updatedWindow._id);
            if (wallWindowIndex >= 0) {
              state.windowsByWall[updatedWindow.wallId][wallWindowIndex] = updatedWindow;
            }
          }
        }
      })
      
      // Delete window
      .addCase(deleteWindowAsync.fulfilled, (state, action) => {
        const { windowId } = action.payload;
        
        // Remove from windows array
        state.windows = state.windows.filter(w => w.id !== windowId && w._id !== windowId);
        
        // Remove from windowsByRoom
        Object.keys(state.windowsByRoom).forEach(roomId => {
          state.windowsByRoom[roomId] = state.windowsByRoom[roomId].filter(w => w.id !== windowId && w._id !== windowId);
        });
        
        // Remove from windowsByWall
        Object.keys(state.windowsByWall).forEach(wallId => {
          state.windowsByWall[wallId] = state.windowsByWall[wallId].filter(w => w.id !== windowId && w._id !== windowId);
        });
      });
  },
});

export const {
  setSelectedWindow,
  clearSelectedWindow,
  addWindowToState,
  removeWindowFromState,
  clearWindows,
} = windowSlice.actions;

// Selectors
export const selectAllWindows = (state) => state.windows.windows;
export const selectWindowsByRoom = (state, roomId) => state.windows.windowsByRoom[roomId] || [];
export const selectWindowsByWall = (state, wallId) => state.windows.windowsByWall[wallId] || [];
export const selectSelectedWindow = (state) => state.windows.selectedWindow;
export const selectWindowsLoading = (state) => state.windows.isLoading;
export const selectWindowsError = (state) => state.windows.error;

export default windowSlice.reducer; 