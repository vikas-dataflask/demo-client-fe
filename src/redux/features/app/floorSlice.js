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
  selectedObject: null, // Currently selected floor shape object
  // Floor creation state
  isDrawing: false, // Prevent duplicate floor creation
  firstFloorCoordinates: null, // Store first floor coordinates for consistency
  hasDrawn: false, // Track if floor was already created in current drag
  // Legacy support - keep for backward compatibility
  floor: null, // Current floor object (deprecated, use floors array instead)
  // Project-specific data
  currentProjectId: null, // Track current project for data persistence
  isLoading: false, // Loading state for API calls
  error: null, // Error state for API calls
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
      // Check if floor already exists to avoid duplicates
      const existingIndex = state.floors.findIndex(floor => floor.id === action.payload.id);
      if (existingIndex === -1) {
        state.floors.push(action.payload);
        if (!state.currentFloorId) {
          state.currentFloorId = action.payload.id;
        }
      } else {
        // Update existing floor
        state.floors[existingIndex] = { ...state.floors[existingIndex], ...action.payload };
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
      console.log('🔄 floorSlice: setCurrentFloorId called with:', action.payload);
      console.log('🔄 floorSlice: Previous currentFloorId:', state.currentFloorId);
      state.currentFloorId = action.payload;
      console.log('🔄 floorSlice: New currentFloorId:', state.currentFloorId);
    },
    setFloorMode(state, action) {
      state.floorMode = action.payload;
    },
    setIsDrawingFloor(state, action) {
      state.isDrawingFloor = action.payload;
    },
    setSelectedObject(state, action) {
      state.selectedObject = action.payload;
    },
    // Floor creation state management
    setIsDrawing(state, action) {
      state.isDrawing = action.payload;
    },
    setFirstFloorCoordinates(state, action) {
      state.firstFloorCoordinates = action.payload;
    },
    setHasDrawn(state, action) {
      state.hasDrawn = action.payload;
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
    // Project-specific actions
    setCurrentProjectId(state, action) {
      state.currentProjectId = action.payload;
    },
    setFloorsFromAPI(state, action) {
      const { floors, projectId } = action.payload;
      console.log('🔄 floorSlice: setFloorsFromAPI called with:', { floors: floors?.length || 0, projectId });
      console.log('🔄 floorSlice: Current state before update:', { 
        currentFloorId: state.currentFloorId, 
        floorsCount: state.floors?.length || 0 
      });
      
      state.floors = floors || [];
      state.currentProjectId = projectId;
      
      // Set first floor as current if no current floor is selected or if current floor is temporary
      if (floors && floors.length > 0) {
        const shouldSetFirstFloor = !state.currentFloorId || 
                                   state.currentFloorId.startsWith('floor-') ||
                                   !/^[0-9a-fA-F]{24}$/.test(state.currentFloorId);
        
        console.log('🔄 floorSlice: Floor ID setting logic:', {
          currentFloorId: state.currentFloorId,
          firstFloorId: floors[0].id,
          shouldSetFirstFloor,
          isNull: !state.currentFloorId,
          isTemporary: state.currentFloorId?.startsWith('floor-'),
          isInvalidObjectId: state.currentFloorId ? !/^[0-9a-fA-F]{24}$/.test(state.currentFloorId) : false
        });
        
        if (shouldSetFirstFloor) {
          state.currentFloorId = floors[0].id;
          console.log('🔄 floorSlice: Set currentFloorId to:', floors[0].id);
        }
      }
      
      console.log('🔄 floorSlice: Final state after update:', { 
        currentFloorId: state.currentFloorId, 
        floorsCount: state.floors?.length || 0 
      });
    },
    setLoadingState(state, action) {
      state.isLoading = action.payload;
    },
    setErrorState(state, action) {
      state.error = action.payload;
    },
    clearProjectData(state) {
      state.floors = [];
      state.currentFloorId = null;
      state.currentProjectId = null;
      state.floor = null;
      state.floor_length = 0;
      state.floor_width = 0;
      state.floor_area = 0;
      state.floor_volume = 0;
      state.floor_rect = null;
      state.floor_bounds = null;
      state.error = null;
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
  setSelectedObject,
  // Floor creation state management
  setIsDrawing,
  setFirstFloorCoordinates,
  setHasDrawn,
  // Legacy actions
  setFloor,
  clearFloor,
  clearAllFloors,
  // Project-specific actions
  setCurrentProjectId,
  setFloorsFromAPI,
  setLoadingState,
  setErrorState,
  clearProjectData,
} = floorSlice.actions;

// Selectors for user and project filtering
export const selectCurrentUserId = (state) => {
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        return user.user_id || user._id;
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
    return null;
  } catch (error) {
    console.error("Error in selectCurrentUserId:", error);
    return null;
  }
};

export const selectCurrentProjectId = (state) => {
  try {
    return state.floor.currentProjectId;
  } catch (error) {
    console.error("Error in selectCurrentProjectId:", error);
    return null;
  }
};

export const selectUserProjectFloors = (state) => {
  try {
    const currentUserId = selectCurrentUserId(state);
    const currentProjectId = selectCurrentProjectId(state);
    const allFloors = state.floor.floors || [];
    
    console.log('🔍 Floor Selector: Filtering floors', {
      currentUserId,
      currentProjectId,
      currentProjectIdType: typeof currentProjectId,
      totalFloors: allFloors.length,
      sampleFloor: allFloors.length > 0 ? {
        id: allFloors[0].id,
        name: allFloors[0].name,
        createdBy: allFloors[0].createdBy,
        createdByType: typeof allFloors[0].createdBy,
        projectId: allFloors[0].projectId,
        projectIdType: typeof allFloors[0].projectId
      } : null
    });
    
    // Filter floors by user and project
    const filteredFloors = allFloors.filter(floor => {
      // Convert ObjectId to string for comparison
      const floorCreatedBy = floor.createdBy ? floor.createdBy.toString() : null;
      const floorProjectId = floor.projectId ? floor.projectId.toString() : null;
      
      const matchesUser = !floorCreatedBy || floorCreatedBy === currentUserId;
      const matchesProject = !floorProjectId || floorProjectId === currentProjectId;
      
      console.log('🔍 Floor Selector: Floor filter check', {
        floorId: floor.id,
        floorName: floor.name,
        floorCreatedBy: floorCreatedBy,
        floorProjectId: floorProjectId,
        currentUserId,
        currentProjectId,
        matchesUser,
        matchesProject,
        included: matchesUser && matchesProject
      });
      
      return matchesUser && matchesProject;
    });
    
    console.log('🔍 Floor Selector: Filtered result', {
      originalCount: allFloors.length,
      filteredCount: filteredFloors.length,
      filteredFloors: filteredFloors.map(f => ({ id: f.id, name: f.name })),
      allFloors: allFloors.map(f => ({ 
        id: f.id, 
        name: f.name, 
        createdBy: f.createdBy, 
        projectId: f.projectId,
        shapesCount: f.shapes?.length || 0
      }))
    });
    
    return filteredFloors;
  } catch (error) {
    console.error("Error in selectUserProjectFloors:", error);
    return [];
  }
};

export const selectCurrentFloor = (state) => {
  try {
    const userProjectFloors = selectUserProjectFloors(state);
    const currentFloorId = state.floor.currentFloorId;
    return userProjectFloors.find(floor => floor.id === currentFloorId);
  } catch (error) {
    console.error("Error in selectCurrentFloor:", error);
    return null;
  }
};

export default floorSlice.reducer;
