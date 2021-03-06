import { assertExhaustive } from '../../utils';
import { BreedList } from './breedListSlice';
import { ImageList } from './imageListSlice';
import { BreedOptionState, BreedOptionRow, BreedOptionsState } from './optionsSlice';
import { shuffle } from '../../utils/index';

async function mapOptions(optionRow: BreedOptionRow): 
Promise<ImageList> {
  switch (optionRow.type) {
    case BreedOptionState.Empty:
      return [];
    case BreedOptionState.BreedAll:
      const breedResponse = await fetch(`https://dog.ceo/api/breed/${optionRow.breed}/images/random/${optionRow.count}`);

      if (!breedResponse.ok) {
        console.log(`No breeds found for ${breedResponse.url}`);
        return [];
      }

      const breedResult = await breedResponse.json();
      return breedResult.message;
    case BreedOptionState.BreedSub:
      let response = await fetch(`https://dog.ceo/api/breed/${optionRow.breed}/${optionRow.subBreed}/images/random/${optionRow.count}`);


      if (!response.ok) {
        console.log(`No breeds found for ${response.url}`);
        return [];
      }

      let { message }: { message: ImageList } = await response.json();
      return message;
    default:
      assertExhaustive(optionRow);
  }
}

export async function getImageList(options: BreedOptionsState): Promise<ImageList> {
  try {
    return Promise.all(options.map(mapOptions)).then((lists) => shuffle(lists.flat()));
  } catch (e) {
    throw new Error('Error fetching breed images');
  }
}

export async function getBreedList(): Promise<BreedList> {
  const response = await fetch('https://dog.ceo/api/breeds/list/all');
  if (!response.ok) {
    throw new Error('No breeds were found');
  }
  const { message } = await response.json();
  return message;
}