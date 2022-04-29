import * as Handlebars from 'handlebars';
import { isArray, isObject, isPrimitive } from '../openapi/v3/schema';

export const configureHandlebars = (handlebars: typeof Handlebars) => {
  handlebars.registerHelper('isPrimitive', isPrimitive);
  handlebars.registerHelper('isArray', isArray);
  handlebars.registerHelper('isObject', isObject);
};
