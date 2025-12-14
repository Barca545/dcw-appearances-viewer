import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { isSerializedAppTab, SerializedAppTab, SerializedStartTab, TabDataUpdate } from "../../common/TypesAPI";
import { TabID } from "../../common/ipcAPI";
import { RootState } from "./store";

interface ListState {
  selected: TabID | null;
  record: Record<TabID, TabDataUpdate>;
}

// TODO: I need to be memoizing or something
// https://redux.js.org/usage/deriving-data-selectors#optimizing-selectors-with-memoization

const listStateSlice = createSlice({
  name: "listStateSlice",
  initialState: { selected: null, record: {} } as ListState,
  reducers: {
    updateEntry: (state, action: PayloadAction<TabDataUpdate>) => {
      state.record[action.payload.meta.ID] = action.payload;
    },
    updateSelected: (state, action: PayloadAction<TabID>) => {
      state.selected = action.payload;
    },
  },
});

export const selectAllTabs = createSelector(
  (state: RootState) => state.listState.record,
  (record) => Object.values(record),
);

export const selectBasicTabInfo = createSelector(
  (state: RootState) => state.listState.record,
  (record) =>
    Object.values(record).map((tab) => {
      return {
        ID: tab.meta.ID,
        tabName: tab.meta.tabName,
        type: isSerializedAppTab(tab) ? "APP" : "START",
      };
    }),
);

export const { updateEntry, updateSelected } = listStateSlice.actions;
export default listStateSlice.reducer;
