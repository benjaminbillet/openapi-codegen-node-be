import { Dict } from '../../types/common';

const ALLOWED_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJIKLMNOPQRSTUVWXYZ123456789_';
export const escapeName = (s: string) => {
  const original = [...s];
  let capitalizeNext = true;
  const nameArray = original.map((char) => {
    if (ALLOWED_CHARS.indexOf(char) >= 0) {
      if (capitalizeNext) {
        capitalizeNext = false;
        return char.toUpperCase();
      }
      return char;
    }
    capitalizeNext = true;
    return null;
  });

  let name = nameArray.filter((c) => c != null).join('');
  if (name.match(/^[0-9]/)) {
    name = `_${name}`;
  }
  return name;
};

export const getNameFromRef = (ref: string) => {
  const [, , , name] = ref.split('/');
  return escapeName(name);
};

export class ModelRegistry {
  private models: Dict<any> = {};

  registerModel(name: string, model: any) {
    this.models[name] = model;
  }
  getModel(name: string) {
    return this.models[name];
  }
  hasModel(name: string) {
    return this.getModel(name) != null;
  }
  getModels() {
    return this.models;
  }
}
