  
import breedListReducer, {
  BreedListState,
  setBreedList,
} from './breedListSlice';
import { AsyncResourceState } from '../../app/types';

describe('breedList reducer', () => {
  const initialState: BreedListState = {
    list: {},
    status: AsyncResourceState.Idle,
  };
  
  it('should handle initial state', () => {
    expect(breedListReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setImageList', () => {
    const actual = breedListReducer(initialState, setBreedList({'breed': ['sub']}));
    expect(actual.list.breed).toEqual(['sub']);
  });
});