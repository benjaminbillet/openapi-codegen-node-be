import { Dict } from '../types/common';
import { generate as generateTypes } from '../type-generator';
import { Generator } from './types';

const GENERATORS: Dict<Generator<any>> = {
  'type-generator': { generate: generateTypes },
};
