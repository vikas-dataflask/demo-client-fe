// // src/store/lightingSlice.js
// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   lightsByRoom: {
//     // [roomId]: { lights: [...], points: [...], count: number }
//   },
// };

// const lightingSlice = createSlice({
//   name: "lighting",
//   initialState,
//   reducers: {
//     setRoomLights(state, action) {
//       const { roomId, lights, points, count } = action.payload;
//       state.lightsByRoom[roomId] = { lights, points, count };
//     },
//     clearRoomLights(state) {
//       state.lightsByRoom = {}; // clears all lights for all rooms
//     },
//   },
// });

// export const { setRoomLights, clearRoomLights } = lightingSlice.actions;
// export default lightingSlice.reducer;

// src/store/lightingSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  lightsByRoom: {
    // [roomId]: { lights: [...], points: [...], count: number, mode: "line" | "grid", gridConfig?: { rows, cols } }
  },
};

const lightingSlice = createSlice({
  name: "lighting",
  initialState,
  reducers: {
    setRoomLights(state, action) {
      const {
        roomId,
        lights,
        points,
        count,
        mode = "line",
        gridConfig = null,
      } = action.payload;
      state.lightsByRoom[roomId] = { lights, points, count, mode, gridConfig };
    },
    clearRoomLights(state) {
      state.lightsByRoom = {}; // clears all lights for all rooms
    },
  },
});

export const { setRoomLights, clearRoomLights } = lightingSlice.actions;
export default lightingSlice.reducer;

// lightingSlice.js
// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   lightsByRoom: {}, // Stores all lighting configurations by room ID
//   activeRoomId: null, // Currently edited room
// };

// // Helper function to calculate optimal grid dimensions
// const calculateGridDimensions = (count) => {
//   if (count <= 0) return { rows: 0, cols: 0 };

//   // Handle prime numbers by increasing count
//   const isPrime = (num) => {
//     for (let i = 2, s = Math.sqrt(num); i <= s; i++)
//       if (num % i === 0) return false;
//     return num > 1;
//   };

//   let adjustedCount = count;
//   if (isPrime(count)) adjustedCount = count + 1;

//   // Find most square-like arrangement
//   let bestRows = 1;
//   let bestCols = adjustedCount;
//   let minDiff = adjustedCount;

//   for (let i = 1; i <= Math.sqrt(adjustedCount); i++) {
//     if (adjustedCount % i === 0) {
//       const rows = i;
//       const cols = adjustedCount / i;
//       const diff = Math.abs(rows - cols);
//       if (diff < minDiff) {
//         minDiff = diff;
//         bestRows = rows;
//         bestCols = cols;
//       }
//     }
//   }

//   return { rows: bestRows, cols: bestCols };
// };

// // Helper to clamp positions within room boundaries
// const clampPosition = (point, room) => ({
//   x: Math.max(room.x, Math.min(point.x, room.x + room.width)),
//   y: Math.max(room.y, Math.min(point.y, room.y + room.height)),
// });

// // Calculate light positions based on configuration
// const calculateLightPositions = (config) => {
//   const { points, count, mode, room } = config;
//   if (!points || points.length !== 4 || count < 1 || !room) return [];

//   const [x1, y1, x2, y2] = points;

//   if (mode === "line") {
//     const totalLength = Math.hypot(x2 - x1, y2 - y1);
//     if (totalLength === 0) return [];

//     const directionX = (x2 - x1) / totalLength;
//     const directionY = (y2 - y1) / totalLength;
//     const margin = Math.min(20, totalLength * 0.1);
//     const effectiveLength = totalLength - 2 * margin;
//     const spacing = count > 1 ? effectiveLength / (count - 1) : 0;

//     return Array.from({ length: count }, (_, i) => {
//       const distance = margin + spacing * i;
//       return clampPosition(
//         {
//           x: x1 + directionX * distance,
//           y: y1 + directionY * distance,
//         },
//         room
//       );
//     });
//   }

//   if (mode === "grid") {
//     const left = Math.min(x1, x2);
//     const right = Math.max(x1, x2);
//     const top = Math.min(y1, y2);
//     const bottom = Math.max(y1, y2);
//     const width = right - left;
//     const height = bottom - top;

//     const { rows, cols } = calculateGridDimensions(count);
//     const colSpacing = cols > 1 ? width / (cols - 1) : 0;
//     const rowSpacing = rows > 1 ? height / (rows - 1) : 0;

//     const positions = [];
//     for (let row = 0; row < rows; row++) {
//       for (let col = 0; col < cols; col++) {
//         if (positions.length >= count) break;
//         positions.push(
//           clampPosition(
//             {
//               x: left + col * colSpacing,
//               y: top + row * rowSpacing,
//             },
//             room
//           )
//         );
//       }
//     }
//     return positions;
//   }

//   return [];
// };

// const lightingSlice = createSlice({
//   name: "lighting",
//   initialState,
//   reducers: {
//     // Initialize or update lighting for a room
//     setRoomLighting: {
//       reducer(state, action) {
//         const { roomId, config } = action.payload;
//         state.lightsByRoom[roomId] = config;
//         state.activeRoomId = roomId;
//       },
//       prepare({ roomId, points, count, mode, room }) {
//         const lights = calculateLightPositions({ points, count, mode, room });
//         const gridConfig =
//           mode === "grid" ? calculateGridDimensions(count) : null;

//         return {
//           payload: {
//             roomId,
//             config: {
//               lights,
//               points,
//               count,
//               mode,
//               gridConfig,
//               room,
//               lastUpdated: Date.now(),
//             },
//           },
//         };
//       },
//     },

//     // Update just the grid dimensions for a room
//     updateGridDimensions: {
//       reducer(state, action) {
//         const { roomId, points } = action.payload;
//         if (!state.lightsByRoom[roomId]) return;

//         state.lightsByRoom[roomId] = {
//           ...state.lightsByRoom[roomId],
//           points,
//           lastUpdated: Date.now(),
//         };
//       },
//       prepare({ roomId, points }) {
//         const roomData = JSON.parse(
//           JSON.stringify(this.getState().lighting.lightsByRoom[roomId])
//         );
//         if (!roomData) return { payload: { roomId, points } };

//         const lights = calculateLightPositions({
//           points,
//           count: roomData.count,
//           mode: roomData.mode,
//           room: roomData.room,
//         });

//         return {
//           payload: {
//             roomId,
//             points,
//             lights,
//           },
//         };
//       },
//     },

//     // Update line endpoints
//     updateLineEndpoints: {
//       reducer(state, action) {
//         const { roomId, points } = action.payload;
//         if (!state.lightsByRoom[roomId]) return;

//         state.lightsByRoom[roomId] = {
//           ...state.lightsByRoom[roomId],
//           points,
//           lastUpdated: Date.now(),
//         };
//       },
//       prepare({ roomId, points }) {
//         const roomData = JSON.parse(
//           JSON.stringify(this.getState().lighting.lightsByRoom[roomId])
//         );
//         if (!roomData) return { payload: { roomId, points } };

//         const lights = calculateLightPositions({
//           points,
//           count: roomData.count,
//           mode: roomData.mode,
//           room: roomData.room,
//         });

//         return {
//           payload: {
//             roomId,
//             points,
//             lights,
//           },
//         };
//       },
//     },

//     // Change the number of lights for a room
//     updateLightCount: {
//       reducer(state, action) {
//         const { roomId, count } = action.payload;
//         if (!state.lightsByRoom[roomId]) return;

//         state.lightsByRoom[roomId] = {
//           ...state.lightsByRoom[roomId],
//           count,
//           lastUpdated: Date.now(),
//         };
//       },
//       prepare({ roomId, count }) {
//         const roomData = JSON.parse(
//           JSON.stringify(this.getState().lighting.lightsByRoom[roomId])
//         );
//         if (!roomData) return { payload: { roomId, count } };

//         const lights = calculateLightPositions({
//           points: roomData.points,
//           count,
//           mode: roomData.mode,
//           room: roomData.room,
//         });

//         const gridConfig =
//           roomData.mode === "grid" ? calculateGridDimensions(count) : null;

//         return {
//           payload: {
//             roomId,
//             count,
//             lights,
//             gridConfig,
//           },
//         };
//       },
//     },

//     // Change the lighting mode for a room
//     changeLightingMode: {
//       reducer(state, action) {
//         const { roomId, mode } = action.payload;
//         if (!state.lightsByRoom[roomId]) return;

//         state.lightsByRoom[roomId] = {
//           ...state.lightsByRoom[roomId],
//           mode,
//           lastUpdated: Date.now(),
//         };
//       },
//       prepare({ roomId, mode }) {
//         const roomData = JSON.parse(
//           JSON.stringify(this.getState().lighting.lightsByRoom[roomId])
//         );
//         if (!roomData) return { payload: { roomId, mode } };

//         const lights = calculateLightPositions({
//           points: roomData.points,
//           count: roomData.count,
//           mode,
//           room: roomData.room,
//         });

//         const gridConfig =
//           mode === "grid" ? calculateGridDimensions(roomData.count) : null;

//         return {
//           payload: {
//             roomId,
//             mode,
//             lights,
//             gridConfig,
//           },
//         };
//       },
//     },

//     // Set the active room being edited
//     setActiveRoom(state, action) {
//       state.activeRoomId = action.payload;
//     },

//     // Clear all lighting configurations
//     clearAllLighting(state) {
//       state.lightsByRoom = {};
//       state.activeRoomId = null;
//     },

//     // Remove lighting for a specific room
//     removeRoomLighting(state, action) {
//       const roomId = action.payload;
//       delete state.lightsByRoom[roomId];
//       if (state.activeRoomId === roomId) {
//         state.activeRoomId = null;
//       }
//     },
//   },
// });

// // Selectors
// export const selectAllLighting = (state) => state.lighting.lightsByRoom;
// export const selectRoomLighting = (roomId) => (state) =>
//   state.lighting.lightsByRoom[roomId];
// export const selectActiveRoomId = (state) => state.lighting.activeRoomId;
// export const selectActiveRoomLighting = (state) =>
//   state.lighting.lightsByRoom[state.lighting.activeRoomId];

// // Actions
// export const {
//   setRoomLighting,
//   updateGridDimensions,
//   updateLineEndpoints,
//   updateLightCount,
//   changeLightingMode,
//   setActiveRoom,
//   clearAllLighting,
//   removeRoomLighting,
// } = lightingSlice.actions;

// export default lightingSlice.reducer;
