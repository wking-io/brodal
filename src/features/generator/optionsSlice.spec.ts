  
import optionsReducer, {
  BreedOptionsState,
  BreedOptionState,
  addRow,
  setBreed,
  setSubBreed,
  setImageCount
} from './optionsSlice';

describe('options reducer', () => {
  const initialState: BreedOptionsState = [{
    type: BreedOptionState.Empty,
  }];

  const initialStateWithBreedAll: BreedOptionsState = [{
    type: BreedOptionState.BreedAll,
    breed: 'australian',
    count: 10,
  }];

  const initialStateWithBreedSub: BreedOptionsState = [{
    type: BreedOptionState.BreedSub,
    breed: 'australian',
    subBreed: 'shepherd',
    count: 10,
  }];
  
  it('should handle initial state', () => {
    expect(optionsReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle addRow', () => {
    const actual = optionsReducer(initialState, addRow());
    expect(actual[1].type).toEqual(BreedOptionState.Empty);
  });

  it('should handle setBreed when Empty', () => {
    const actual = optionsReducer(initialState, setBreed({index: 0, value: 'poodle'}));
    expect(actual[0].type).toEqual(BreedOptionState.BreedAll);
    expect(actual[0].breed).toEqual('poodle');
  });



  it('should be in the BreedAll state after running setBreed on a BreedSub state.', () => {
    const actual = optionsReducer(initialStateWithBreedSub, setBreed({index: 0, value: 'poodle'}));
    expect(actual[0].type).toEqual(BreedOptionState.BreedAll);
    expect(actual[0].breed).toEqual('poodle');
  });

  it('should handle setSubBreed', () => {
    const actual = optionsReducer(initialStateWithBreedAll, setSubBreed({index: 0, value: 'shepherd'}));
    expect(actual[0].type).toEqual(BreedOptionState.BreedSub);
    expect(actual[0].subBreed).toEqual('shepherd');
  });

  it('should not change if running setSubBreed on Empty state', () => {
    const actual = optionsReducer(initialState, setSubBreed({index: 0, value: 'shepherd'}));
    expect(actual[0].type).toEqual(BreedOptionState.Empty);
  });

  it('should handle setImageCount', () => {
    const actual = optionsReducer(initialStateWithBreedAll, setImageCount({ index: 0, value: '5'}));
    expect(actual[0].count).toEqual(5);
  });

  it('should not change if running setImageCount on Empty state', () => {
    const actual = optionsReducer(initialState, setImageCount({ index: 0, value: '5'}));
    expect(actual[0].type).toEqual(BreedOptionState.Empty);
  });
});