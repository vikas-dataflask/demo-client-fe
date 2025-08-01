import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from 'uuid';

const wallSlice = createSlice({
  name: "walls",
  initialState: [],
  reducers: {
    // Add a new wall
    addWall: (state, action) => {
      const { id, start, end, thickness, type, roomIds } = action.payload;
      state.push({
        id,
        start,
        end,
        thickness: thickness || 200, // Default 200mm thickness
        type: type || "RCC", // Default RCC type
        roomIds: roomIds || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    },

    // Update wall properties
    updateWall: (state, action) => {
      const { id, updates } = action.payload;
      const wall = state.find(w => w.id === id);
      if (wall) {
        Object.assign(wall, updates, { updatedAt: new Date().toISOString() });
      }
    },

    // Add room to wall (for shared walls)
    addRoomToWall: (state, action) => {
      const { wallId, roomId } = action.payload;
      const wall = state.find(w => w.id === wallId);
      if (wall && !wall.roomIds.includes(roomId)) {
        wall.roomIds.push(roomId);
        wall.updatedAt = new Date().toISOString();
      }
    },

    // Remove room from wall
    removeRoomFromWall: (state, action) => {
      const { wallId, roomId } = action.payload;
      const wall = state.find(w => w.id === wallId);
      if (wall) {
        wall.roomIds = wall.roomIds.filter(id => id !== roomId);
        wall.updatedAt = new Date().toISOString();
      }
    },

    // Delete wall
    deleteWall: (state, action) => {
      const wallId = action.payload;
      return state.filter(wall => wall.id !== wallId);
    },

    // Delete walls by room ID (when room is deleted)
    deleteWallsByRoom: (state, action) => {
      const roomId = action.payload;
      return state.filter(wall => !wall.roomIds.includes(roomId));
    },

    // Generate walls for a room
    generateWallsForRoom: (state, action) => {
      const { roomId, room } = action.payload;
      
      // Check if walls already exist for this room
      const existingWallsForRoom = state.filter(wall => wall.roomIds.includes(roomId));
      if (existingWallsForRoom.length > 0) {
        console.log(`Walls already exist for room ${roomId}, skipping generation`);
        return;
      }
      
      console.log(`Generating walls for room ${roomId}:`, room);
      
      // Calculate wall segments for rectangle room
      const walls = [];
      
      // Top wall
      walls.push({
        id: uuidv4(),
        start: { x: room.x, y: room.y },
        end: { x: room.x + room.width, y: room.y },
        thickness: 200,
        type: "RCC",
        roomIds: [roomId],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Right wall
      walls.push({
        id: uuidv4(),
        start: { x: room.x + room.width, y: room.y },
        end: { x: room.x + room.width, y: room.y + room.height },
        thickness: 200,
        type: "RCC",
        roomIds: [roomId],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Bottom wall
      walls.push({
        id: uuidv4(),
        start: { x: room.x + room.width, y: room.y + room.height },
        end: { x: room.x, y: room.y + room.height },
        thickness: 200,
        type: "RCC",
        roomIds: [roomId],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Left wall
      walls.push({
        id: uuidv4(),
        start: { x: room.x, y: room.y + room.height },
        end: { x: room.x, y: room.y },
        thickness: 200,
        type: "RCC",
        roomIds: [roomId],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Add walls to state
      state.push(...walls);
    },

    // Detect and merge shared walls
    detectSharedWalls: (state, action) => {
      const tolerance = action.payload?.tolerance || 1; // 1px tolerance
      
      for (let i = 0; i < state.length; i++) {
        for (let j = i + 1; j < state.length; j++) {
          const wall1 = state[i];
          const wall2 = state[j];
          
          // Check if walls are aligned (same start/end points within tolerance)
          const isAligned = (
            (Math.abs(wall1.start.x - wall2.start.x) <= tolerance &&
             Math.abs(wall1.start.y - wall2.start.y) <= tolerance &&
             Math.abs(wall1.end.x - wall2.end.x) <= tolerance &&
             Math.abs(wall1.end.y - wall2.end.y) <= tolerance) ||
            (Math.abs(wall1.start.x - wall2.end.x) <= tolerance &&
             Math.abs(wall1.start.y - wall2.end.y) <= tolerance &&
             Math.abs(wall1.end.x - wall2.start.x) <= tolerance &&
             Math.abs(wall1.end.y - wall2.start.y) <= tolerance)
          );
          
          if (isAligned) {
            // Merge room IDs
            const allRoomIds = [...new Set([...wall1.roomIds, ...wall2.roomIds])];
            wall1.roomIds = allRoomIds;
            wall1.updatedAt = new Date().toISOString();
            
            // Remove the duplicate wall
            state.splice(j, 1);
            j--; // Adjust index after removal
          }
        }
      }
    },

    // Reset all walls
    resetWalls: () => {
      return [];
    }
  }
});

export const {
  addWall,
  updateWall,
  addRoomToWall,
  removeRoomFromWall,
  deleteWall,
  deleteWallsByRoom,
  generateWallsForRoom,
  detectSharedWalls,
  resetWalls
} = wallSlice.actions;

export default wallSlice.reducer; 