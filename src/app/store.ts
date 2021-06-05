import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import optionsReducer from '../features/generator/optionsSlice';
import breedListReducer from '../features/generator/breedListSlice';
import imageListReducer from '../features/generator/imageListSlice';
import showBrodalReducer from '../features/generator/showBrodalSlice';

export const store = configureStore({
  reducer: {
    options: optionsReducer,
    breedList: breedListReducer,
    imageList: imageListReducer,
    showBrodal: showBrodalReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
