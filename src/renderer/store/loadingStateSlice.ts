import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = false;

const loadStateSlice = createSlice({
  name: "loadStateSlice",
  initialState: initialState as boolean | Error,
  reducers: {
    setLoadState: (state, action: PayloadAction<boolean>) => (state = action.payload),
    setError: (state, action: PayloadAction<Error>) => {
      state = action.payload;
    },
  },
});

export const { setLoadState, setError } = loadStateSlice.actions;
export default loadStateSlice.reducer;
