import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export type BrodalState = boolean;

const initialState: BrodalState = false;

export const showBrodalSlice = createSlice({
  name: 'showBrodal',
  initialState,
  reducers: {
    toggleBrodal(state) {
      return !state;
    }
  },
});

export const { toggleBrodal } = showBrodalSlice.actions;
export const selectOptions = (state: RootState) => state.options;
export default showBrodalSlice.reducer