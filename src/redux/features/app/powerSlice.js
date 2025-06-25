// import { createSlice } from "@reduxjs/toolkit";

// // load persisted state
// const loadFromLocalStorage = () => {
//   try {
//     const data = localStorage.getItem("powerState");
//     return data ? JSON.parse(data) : null;
//   } catch {
//     return null;
//   }
// };

// // save state on changes
// const saveToLocalStorage = (state) => {
//   try {
//     localStorage.setItem("powerState", JSON.stringify(state));
//   } catch {}
// };

// const persisted = loadFromLocalStorage();

// const initialState = persisted || {
//   powerByRoom: {}, // { roomId: { powerPerButton, numberOfButtons, totalPower } }
//   combinedLoadByRoom: {}, // { roomId: totalLighting + power }
//   dbLoads: [], // [ { dbName, type, totalLoad   } ]
//   totalConnectedLoad: 0, // sum of dbLoads
// };

// const powerSlice = createSlice({
//   name: "power",
//   initialState,
//   reducers: {
//     setRoomPower(state, action) {
//       const { roomId, powerPerButton, numberOfButtons, totalPower } =
//         action.payload;
//       state.powerByRoom[roomId] = {
//         powerPerButton,
//         numberOfButtons,
//         totalPower,
//       };
//       saveToLocalStorage(state);
//     },
//     setCombinedLoad(state, action) {
//       const { roomId, totalLoad } = action.payload;
//       state.combinedLoadByRoom[roomId] = totalLoad;
//       saveToLocalStorage(state);
//     },
//     addDbLoad(state, action) {
//       const { dbName, type, totalLoad } = action.payload;
//       state.dbLoads.push({ dbName, type, totalLoad });
//       state.totalConnectedLoad += totalLoad;
//       saveToLocalStorage(state);
//     },
//     resetDbLoads(state) {
//       state.dbLoads = [];
//       state.totalConnectedLoad = 0;
//       saveToLocalStorage(state);
//     },
//     // optional: clear all power entries alone
//     clearPower(state) {
//       state.powerByRoom = {};
//       state.combinedLoadByRoom = {};
//       saveToLocalStorage(state);
//     },
//   },
// });

// export const {
//   setRoomPower,
//   setCombinedLoad,
//   addDbLoad,
//   resetDbLoads,
//   clearPower,
// } = powerSlice.actions;
// export default powerSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

// Load from localStorage
const loadFromLocalStorage = () => {
  try {
    const data = localStorage.getItem("powerState");
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

// Save to localStorage
const saveToLocalStorage = (state) => {
  try {
    localStorage.setItem("powerState", JSON.stringify(state));
  } catch {}
};

const persistedState = loadFromLocalStorage();

const initialState = persistedState || {
  powerByRoom: {},
  combinedLoadByRoom: {},
  dbLoads: [], // [{ dbName, type, totalLoad }]
  totalConnectedLoad: 0,
};

const powerSlice = createSlice({
  name: "power",
  initialState,
  reducers: {
    setRoomPower(state, action) {
      const { roomId, powerPerButton, numberOfButtons, totalPower } =
        action.payload;
      state.powerByRoom[roomId] = {
        powerPerButton,
        numberOfButtons,
        totalPower,
      };
      saveToLocalStorage(state);
    },
    setCombinedLoad(state, action) {
      const { roomId, totalLoad } = action.payload;
      state.combinedLoadByRoom[roomId] = totalLoad;
      saveToLocalStorage(state);
    },
    addDbLoad(state, action) {
      const { dbName, type, totalLoad } = action.payload;
      state.dbLoads.push({ dbName, type, totalLoad });
      state.totalConnectedLoad += totalLoad;
      saveToLocalStorage(state);
    },
    resetDbLoads(state) {
      state.dbLoads = [];
      state.totalConnectedLoad = 0;
      saveToLocalStorage(state);
    },
    clearPower(state) {
      state.powerByRoom = {};
      state.combinedLoadByRoom = {};
      saveToLocalStorage(state);
    },
  },
});

export const {
  setRoomPower,
  setCombinedLoad,
  addDbLoad,
  resetDbLoads,
  clearPower,
} = powerSlice.actions;

export default powerSlice.reducer;
