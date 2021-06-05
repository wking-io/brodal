import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { AsyncResourceState } from '../../app/types';
import { getBreedList } from './generatorAPI';

export type BreedList = { [key: string]: string[] }
export type BreedListState = {
  list: { [key: string]: string[] };
  status: AsyncResourceState;
}

const initialState: BreedListState = {
  list: {},
  status: AsyncResourceState.Idle,
}

export const fetchBreedList = createAsyncThunk(
  'breedList/fetchBreedList',
  getBreedList
);

export const breedListSlice = createSlice({
  name: 'breedList',
  initialState,
  reducers: {
    setBreedList(state, { payload }: PayloadAction<BreedList>) {
      state.list = payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBreedList.pending, (state) => {
        state.status = AsyncResourceState.Loading;
      })
      .addCase(fetchBreedList.fulfilled, (state, action) => {
        state.status = AsyncResourceState.Idle;
        state.list = action.payload;
      })
      .addCase(fetchBreedList.rejected, (state) => {
        state.status = AsyncResourceState.Failed;
      })
  }
});

export const { setBreedList } = breedListSlice.actions;
export const selectBreedList = (state: RootState) => state.breedList;
export default breedListSlice.reducer