

import { createSlice } from "@reduxjs/toolkit";

const newRoomSlice = createSlice({
  name: "newRooms",
  initialState: {
    rooms: []
  },
  reducers: {
    createRooms: (state, action) => {
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
        }
  },
});

export const {
  createRooms,

} = newRoomSlice.actions;

export default newRoomSlice.reducer;
