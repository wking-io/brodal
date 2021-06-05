import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export type BrodalState = boolean;

const initialState: BrodalState = false;

export const showBrodalSlice = createSlice({
  name: 'showBrodal',
  initialState,
  reducers: {
    toggleBrodal(state) {
      state = !state;
    }
  },
});

export const { toggleBrodal } = showBrodalSlice.actions;
export const selectShowBrodal = (state: RootState) => state.showBrodal;
export default showBrodalSlice.reducer