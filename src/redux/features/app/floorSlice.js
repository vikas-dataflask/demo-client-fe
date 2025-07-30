// redux/slices/areaMarkupSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  scale: "meter",
  floor_length: 0,
  floor_width: 0,
  floor_height: 0,
  floor_area: 0,
  floor_volume: 0,
};

const floorSlice = createSlice({
  name: "floor",
  initialState,
  reducers: {
    setScale(state, action) {
      state.scale = action.payload;
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
  },
});

export const {
  setScale,
  setFloorLength,
  setFloorWidth,
  setFloorHeight,
  setFloorArea,
  setFloorVolume,
} = floorSlice.actions;

export default floorSlice.reducer;
