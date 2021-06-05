import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { AsyncResourceState } from '../../app/types';
import { getImageList } from './generatorAPI';

export type ImageList = string[]
export type ImageListState = {
  list: string[];
  status: AsyncResourceState;
}

const initialState: ImageListState = {
  list: [],
  status: AsyncResourceState.Idle,
}

export const fetchImageList = createAsyncThunk(
  'imageList/fetchImageList',
  getImageList
)

export const imageListSlice = createSlice({
  name: 'imageList',
  initialState,
  reducers: {
    setImageList(state, { payload }: PayloadAction<ImageList>) {
      state.list = payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchImageList.pending, (state) => {
        state.status = AsyncResourceState.Loading;
      })
      .addCase(fetchImageList.fulfilled, (state, action) => {
        state.status = AsyncResourceState.Idle;
        state.list = action.payload;
      })
      .addCase(fetchImageList.rejected, (state) => {
        state.status = AsyncResourceState.Failed;
      })
  }
});

export const { setImageList } = imageListSlice.actions;
export const selectOptions = (state: RootState) => state.options;
export default imageListSlice.reducer