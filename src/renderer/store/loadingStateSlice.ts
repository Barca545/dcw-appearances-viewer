import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export enum LoadState {
  Null,
  Loading,
  Loaded,
}

const initialState = LoadState.Null;

const loadStateSlice = createSlice({
  name: "loadStateSlice",
  initialState: initialState as LoadState | Error,
  reducers: {
    setLoadState: (state, action: PayloadAction<LoadState>) => (state = action.payload),
    setError: (state, action: PayloadAction<Error>) => {
      state = action.payload;
    },
  },
});

export const { setLoadState, setError } = loadStateSlice.actions;
export default loadStateSlice.reducer;
