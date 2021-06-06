export function assertExhaustive(
  value: never,
  message: string = 'Reached unexpected case in exhaustive switch'
): never {
  throw new Error(message);
}

// An implementation of the Durstenfeld shuffle. Normally I would just use a function from a library like Ramda if the rest of the application called for more of the functions.
export function shuffle(array: any[]) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  return array;
}