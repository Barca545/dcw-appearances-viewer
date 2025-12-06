import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppearanceData, FilterDensity, TabData, TEMP_ID_WHILE_ONLY_ONE_TAB } from "../../common/apiTypes";
import { UUID } from "crypto";

interface ListState {
  density: FilterDensity;
  character: string;
  list: AppearanceData[];
}

interface ListStateMap {
  [id: UUID]: ListState; // key by UUID string
}

const listStateSlice = createSlice({
  name: "listStateSlice",
  initialState: { [TEMP_ID_WHILE_ONLY_ONE_TAB]: { density: FilterDensity.Normal, character: "", list: [] } } as ListStateMap,
  reducers: {
    updateEntry: (state, action: PayloadAction<TabData>) => {
      const currentState = state[action.payload.meta.id];
      if (currentState) {
        const newState = action.payload;
        currentState.density = newState.options.density;
        currentState.character = newState.meta.character;
        currentState.list = newState.appearances;
      } else {
        const newState = action.payload;
        state[action.payload.meta.id] = {
          density: newState.options.density,
          character: newState.meta.character,
          list: [...newState.appearances],
        };
      }
      console.log(state[action.payload.meta.id].list);
    },
  },
});

export const { updateEntry } = listStateSlice.actions;
export default listStateSlice.reducer;
