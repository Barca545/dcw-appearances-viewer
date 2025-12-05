import { configureStore } from "@reduxjs/toolkit";
import loadStateReducer from "./loadingStateSlice";
import listStateReducer from "./listStateSlice";

export const store = configureStore({
  reducer: {
    listState: listStateReducer,
    loadState: loadStateReducer,
  },
});

export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
