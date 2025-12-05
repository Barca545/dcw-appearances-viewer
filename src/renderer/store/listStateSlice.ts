import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppearanceData, FilterDensity, SubmitResponse } from "../../common/apiTypes";

interface ListState {
  density: FilterDensity;
  character: string;
  list: AppearanceData[];
}

// Needs to be a serializable value (so not a list entry)

const initialState = { density: FilterDensity.Normal, character: "", list: [] };

const listStateSlice = createSlice({
  name: "listStateSlice",
  initialState: initialState as ListState,
  reducers: {
    setListState: (state, action: PayloadAction<SubmitResponse>) => {
      const newState = action.payload;
      state.density = newState.density;
      state.character = newState.character;
      state.list = newState.appearances;
    },
  },
});

export const { setListState } = listStateSlice.actions;
export default listStateSlice.reducer;
