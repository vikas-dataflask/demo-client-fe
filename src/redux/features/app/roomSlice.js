// import { createSlice } from "@reduxjs/toolkit";

// const roomsSlice = createSlice({
//   name: "rooms",
//   initialState: [],
//   reducers: {
//     // 1st reducer: Save full room details when room is created
//     addRoom: (state, action) => {
//       const { id, area, x, y, width, height } = action.payload;
//       state.push({
//         id,
//         area,
//         x,
//         y,
//         width,
//         height,
//         name: "", // initialize with empty name
//       });
//     },

//     // 2nd reducer: Update the room name by matching room id
//     updateRoomName: (state, action) => {
//       const { id, name } = action.payload;
//       const room = state.find((r) => r.id === id);
//       if (room) {
//         room.name = name;
//       }
//     },

//     // ✅ New: Update room position
//     updateRoomPosition: (state, action) => {
//       const { id, x, y } = action.payload;
//       const room = state.find((r) => r.id === id);
//       if (room) {
//         room.x = x;
//         room.y = y;
//       }
//     },

//     // redux/features/app/roomSlice.js
//     updateRoomArea(state, action) {
//       const { id, area } = action.payload;
//       const room = state.find((r) => r.id === id);
//       if (room) {
//         room.area = area;
//       }
//     },

//     // ✅ New: Update room dimensions (width and height)
//     updateRoomDimensions: (state, action) => {
//       const { id, width, height } = action.payload;
//       const room = state.find((r) => r.id === id);
//       if (room) {
//         room.width = width;
//         room.height = height;
//       }
//     },

//     // 4th reducer: Reset all rooms
//     resetRooms: () => {
//       return [];
//     },
//   },
// });

// export const {
//   addRoom,
//   updateRoomName,
//   updateRoomPosition,
//   updateRoomArea,
//   updateRoomDimensions,
//   resetRooms,
// } = roomsSlice.actions;

// export default roomsSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

const roomsSlice = createSlice({
  name: "rooms",
  initialState: [],
  reducers: {
    // Add full room details when created
    addRoom: (state, action) => {
      const { id, x, y, width, height, area } = action.payload;
      state.push({
        id,
        name: "",
        x,
        y,
        width,
        height,
        area: area || width * height, // Use provided area or calculate from dimensions
      });
    },

    // Update room name
    updateRoomName: (state, action) => {
      const { id, name } = action.payload;
      const room = state.find((r) => r.id === id);
      if (room) {
        room.name = name;
      }
    },

    // Update position
    updateRoomPosition: (state, action) => {
      const { id, x, y } = action.payload;
      const room = state.find((r) => r.id === id);
      if (room) {
        room.x = x;
        room.y = y;
      }
    },

    // Update dimensions and recalculate area
    updateRoomDimensions: (state, action) => {
      const { id, width, height } = action.payload;
      const room = state.find((r) => r.id === id);
      if (room) {
        room.width = width;
        room.height = height;
        room.area = width * height; // Store raw pixel area
      }
    },

    // Separate area update (optional if needed independently)
    updateRoomArea: (state, action) => {
      const { id, area } = action.payload;
      const room = state.find((r) => r.id === id);
      if (room) {
        room.area = area;
      }
    },

    // Reset all rooms
    resetRooms: () => {
      return [];
    },
  },
});

export const {
  addRoom,
  updateRoomName,
  updateRoomPosition,
  updateRoomDimensions,
  updateRoomArea,
  resetRooms,
} = roomsSlice.actions;

export default roomsSlice.reducer;
