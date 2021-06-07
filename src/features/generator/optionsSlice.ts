import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { assertExhaustive } from '../../utils/index';

export enum BreedOptionState {
  Empty,
  BreedAll,
  BreedSub,
}

interface Empty {
  type: BreedOptionState.Empty;
}

interface BreedAll {
  type: BreedOptionState.BreedAll;
  breed: string;
  count: number;
}

interface BreedSub {
  type: BreedOptionState.BreedSub;
  breed: string;
  subBreed: string;
  count: number;
}

export type BreedOptionRow = Empty | BreedAll | BreedSub;
export type BreedOptionsState = BreedOptionRow[];
export interface BreedOptionPayload {
  index: number;
  value: string;
}

const initialState: BreedOptionsState = [{ type: BreedOptionState.Empty }];

function addOptionRow(state: BreedOptionsState) {
  state.push({ type: BreedOptionState.Empty });
}

function withOptionRow(updater: (optionRow: BreedOptionRow, value: string) => BreedOptionRow) {
  return function(state: BreedOptionsState, { payload }: PayloadAction<BreedOptionPayload>) {
    state[payload.index] = updater(state[payload.index], payload.value);
  };
}

function setBreedOption(optionRow: BreedOptionRow, value: string): BreedOptionRow {
  switch (optionRow.type) {
    case BreedOptionState.Empty:
    case BreedOptionState.BreedSub:
      return { type: BreedOptionState.BreedAll, breed: value, count: 10 };
    case BreedOptionState.BreedAll:
      return { ...optionRow, type: BreedOptionState.BreedAll, breed: value };
    default:
      assertExhaustive(optionRow);
  }
}

function setSubBreedOption(optionRow: BreedOptionRow, value: string): BreedOptionRow {
  switch (optionRow.type) {
    case BreedOptionState.Empty:
      return optionRow;
    case BreedOptionState.BreedAll:
      return { ...optionRow, type: BreedOptionState.BreedSub, subBreed: value };
    case BreedOptionState.BreedSub:
      return { ...optionRow, subBreed: value };
    default:
      assertExhaustive(optionRow);
  }
}

function setImageCountOption(optionRow: BreedOptionRow, value: string): BreedOptionRow {
  let count: number = parseInt(value);
  // Even though there was a constraint added to the field
  // it neber hurts to add one more safety net.
  if (count < 0 || count > 50) {
    return optionRow;
  }
  switch (optionRow.type) {
    case BreedOptionState.Empty:
      return optionRow;
    case BreedOptionState.BreedAll:
    case BreedOptionState.BreedSub:
      return { ...optionRow, count };
    default:
      assertExhaustive(optionRow);
  }
}

export const optionsSlice = createSlice({
  name: 'options',
  initialState,
  reducers: {
    addRow: addOptionRow,
    setBreed: withOptionRow(setBreedOption),
    setSubBreed: withOptionRow(setSubBreedOption),
    setImageCount: withOptionRow(setImageCountOption),
  },
});

export const { addRow, setBreed, setSubBreed, setImageCount } = optionsSlice.actions;
export const selectOptions = (state: RootState) => state.options;
export function isEmpty(list: BreedOptionsState): boolean {
  return list.length === 0 || (list.length === 1 && list[0].type === BreedOptionState.Empty)
}
export default optionsSlice.reducer