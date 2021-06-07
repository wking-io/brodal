  
import brodalReducer, {
  BrodalState,
  toggleBrodal,
} from './showBrodalSlice';

describe('show brodal reducer', () => {
  const initialState: BrodalState = false;
  
  it('should handle initial state', () => {
    expect(brodalReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle toggleBrodal', () => {
    const actual = brodalReducer(initialState, toggleBrodal());
    expect(actual).toEqual(true);
  });
});