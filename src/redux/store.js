import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import { projectLoggerMiddleware } from "./middleware/projectLogger";

import projectReducer from "./features/app/projectSlice";
import userReducer from "./features/app/userSLice";
import { apiSlice } from "./features/api/api";
import floorPlanReducer from "./features/app/FloorPlanSlice";
import areaMarkupReducer from "./features/app/areaMarkupSlice";
import dxfReducer from "./features/app/dxfSlice";
import roomReducer from "./features/app/roomSlice";
import dialuxReducer from "./features/app/dialuxSlice";
import lightingReducer from "./features/app/lightingSlice";
import powerReducer from "./features/app/powerSlice";
import fixtureReducer from "./features/app/fixtureSlice";
import { backofficeApi } from "./features/api/backofficeApi";
import { floorRoomApi } from "./features/api/floorRoomApi";
import { newAdminApi } from "./features/api/newAdminApi";
import { latestAdminApi } from "./features/api/latestAdminApi";
import { aiApi } from "./features/api/aiApi";
import editorReducer from "./features/app/editorSlice";
import floorReducer from "./features/app/floorSlice";
import wallReducer from "./features/app/wallSlice";
import doorReducer from "./features/app/doorSlice";
import windowReducer from "./features/app/windowSlice";
import newRoomReducer from "./features/app/newRoomSlice";
import circuitingReducer from "./features/app/circuitingSlice";
import circuitingSummaryReducer from "./features/app/circuitingSummarySlice";
import powerCircuitingReducer from "./features/app/powerCircuitingSlice";
import { adminApiSlice } from "./features/api/adminApi";

const userFromStorage = JSON.parse(localStorage.getItem("user"));

const persistConfig = {
  key: "root",
  storage,
  whitelist: [
    "rooms",
    "floorPlan",
    "project",
    "dailux",
    "floor",
    "newRooms",
    "power",
    "powerCircuiting",
    "circuiting",
  ], // Added circuiting for lighting zones
};

const rootReducer = combineReducers({
  user: userReducer,
  project: projectReducer,
  floorPlan: floorPlanReducer,
  areaMarkup: areaMarkupReducer,
  dxf: dxfReducer,
  rooms: roomReducer,
  newRooms: newRoomReducer,
  dialux: dialuxReducer,
  lighting: lightingReducer,
  power: powerReducer,
  fixture: fixtureReducer,
  editor: editorReducer,
  floor: floorReducer,
  walls: wallReducer,
  doors: doorReducer,
  windows: windowReducer,
  circuiting: circuitingReducer,
  circuitingSummary: circuitingSummaryReducer,
  powerCircuiting: powerCircuitingReducer,

  [apiSlice.reducerPath]: apiSlice.reducer,
  [backofficeApi.reducerPath]: backofficeApi.reducer,
  [adminApiSlice.reducerPath]: adminApiSlice.reducer,

  [floorRoomApi.reducerPath]: floorRoomApi.reducer,
  [newAdminApi.reducerPath]: newAdminApi.reducer,
  [latestAdminApi.reducerPath]: latestAdminApi.reducer,
  [aiApi.reducerPath]: aiApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  preloadedState: {
    user: userFromStorage || {},
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // Disable serializable check in development for better performance
        warnAfter: 128,
      },
      immutableCheck: {
        warnAfter: 128,
      },
    })
      .concat(apiSlice.middleware)
      .concat(backofficeApi.middleware)
      .concat(floorRoomApi.middleware)
      .concat(newAdminApi.middleware)
      .concat(adminApiSlice.middleware)

      .concat(aiApi.middleware)
      .concat(latestAdminApi.middleware)
      .concat(projectLoggerMiddleware),
});

export const persistor = persistStore(store);
