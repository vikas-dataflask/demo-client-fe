// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   result: null,
// };

// const dialuxSlice = createSlice({
//   name: "dialux",
//   initialState,
//   reducers: {
//     setDialuxResult: (state, action) => {
//       state.result = action.payload;
//     },
//     resetDialuxResult: (state) => {
//       state.result = null;
//     },
//   },
// });

// export const { setDialuxResult, resetDialuxResult } = dialuxSlice.actions;
// export default dialuxSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  result: null,
  gridOptions: [], // array of { rows, cols } options for current luminaire count
};

const dialuxSlice = createSlice({
  name: "dialux",
  initialState,
  reducers: {
    setDialuxResult: (state, action) => {
      state.result = action.payload;
    },

    resetDialuxResult: (state) => {
      state.result = null;
      state.gridOptions = [];
    },
    setGridOptions: (state, action) => {
      state.gridOptions = action.payload; // e.g., [{ rows: 6, cols: 3 }, { rows: 9, cols: 2 }]
    },
  },
});

export const { setDialuxResult, resetDialuxResult, setGridOptions } =
  dialuxSlice.actions;
export default dialuxSlice.reducer;
