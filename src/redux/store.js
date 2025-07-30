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
import { backofficeApi } from "./features/api/backofficeApi";
import editorReducer from "./features/app/editorSlice";
import floorReducer from "./features/app/floorSlice";

const userFromStorage = JSON.parse(localStorage.getItem("user"));

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["rooms", "floorPlan", "project", "dailux", "lighting"], // this must match the key in combineReducers
};

const rootReducer = combineReducers({
  user: userReducer,
  project: projectReducer,
  floorPlan: floorPlanReducer,
  areaMarkup: areaMarkupReducer,
  dxf: dxfReducer,
  rooms: roomReducer,
  dialux: dialuxReducer,
  lighting: lightingReducer,
  power: powerReducer,
  editor: editorReducer,
  floor: floorReducer,

  [apiSlice.reducerPath]: apiSlice.reducer,
  [backofficeApi.reducerPath]: backofficeApi.reducer,
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
      },
    })
      .concat(apiSlice.middleware)
      .concat(backofficeApi.middleware),
});

export const persistor = persistStore(store);
