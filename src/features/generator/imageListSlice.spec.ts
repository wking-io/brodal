  
import imageListReducer, {
  ImageListState,
  setImageList,
} from './imageListSlice';
import { AsyncResourceState } from '../../app/types';
import { setImageCount } from './optionsSlice';

describe('imageList reducer', () => {
  const initialState: ImageListState = {
    list: [],
    status: AsyncResourceState.Idle,
  };
  
  it('should handle initial state', () => {
    expect(imageListReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setImageList', () => {
    const actual = imageListReducer(initialState, setImageList(['image']));
    expect(actual.list[0]).toEqual('image');
  });
});