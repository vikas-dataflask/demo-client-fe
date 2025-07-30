// redux/slices/areaMarkupSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  grid: true,
};

const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    setGrid(state, action) {
      state.grid = action.payload;
    },
  },
});

export const { setGrid } = editorSlice.actions;

export default editorSlice.reducer;
