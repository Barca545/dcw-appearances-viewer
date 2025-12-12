import { configureStore } from "@reduxjs/toolkit";
import loadStateSliceReducer from "./loadingStateSlice";
import listStateSliceReducer from "./listStateSlice";

export const store = configureStore({
  reducer: {
    listState: listStateSliceReducer,
    loadState: loadStateSliceReducer,
  },
});

export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
