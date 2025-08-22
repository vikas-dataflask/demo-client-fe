

import { createSlice } from "@reduxjs/toolkit";

const newRoomSlice = createSlice({
  name: "newRooms",
  initialState: {
    rooms: []
  },
  reducers: {
    createRooms: (state, action) => {
      // Check if this is a clear action
      if (action.payload && action.payload.type === 'clear') {
        state.rooms = [];
        console.log("ROOMIE: Cleared all rooms");
        return;
      }
      
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
      console.log("ROOMIE",id,x,y,width,height,area,name,roomType,wallThickness,falseCeiling,floorId)

          const newRoom = {
            name: name ,
            id: id,
            x: x,
            y: y,
            width: width,
            height: height,
            area: height * width,
            roomType: roomType,
            wallThickness: wallThickness,
            falseCeiling: falseCeiling,
            floorId: floorId,
          };
          console.log("ROOMIE in the slice",newRoom)
          state.rooms.push(newRoom);
          console.log("ROOMIE set in redux state")
        },
    updateRoomPosition: (state, action) => {
      const { id, x, y } = action.payload;
      const room = state.rooms.find((r) => r.id === id);
      if (room) {
        room.x = x;
        room.y = y;
        console.log("ROOMIE: Updated room position", { id, x, y });
      }
    },
    updateRoomProperties: (state, action) => {
      const { id, updates } = action.payload;
      const room = state.rooms.find((r) => r.id === id);
      if (room) {
        Object.assign(room, updates);
        console.log("ROOMIE: Updated room properties", { id, updates });
      }
    },
    clearRooms: (state) => {
      state.rooms = [];
      console.log("ROOMIE: Cleared all rooms");
    }
  },
});

export const {
  createRooms,
  updateRoomPosition,
  updateRoomProperties,
  clearRooms
} = newRoomSlice.actions;

export default newRoomSlice.reducer;
