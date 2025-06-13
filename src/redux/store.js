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
import { backofficeApi } from "./features/api/backofficeApi";

const userFromStorage = JSON.parse(localStorage.getItem("user"));

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["rooms", "floorPlan", "project"], // this must match the key in combineReducers
};

const rootReducer = combineReducers({
  user: userReducer,
  project: projectReducer,
  floorPlan: floorPlanReducer,
  areaMarkup: areaMarkupReducer,
  dxf: dxfReducer,
  rooms: roomReducer, // this key must match the whitelist
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
