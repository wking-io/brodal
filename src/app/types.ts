export enum AsyncResourceState {
  Idle,
  Loading,
  Failed
}

export type Resource<T> = {
  read: () => T;
}