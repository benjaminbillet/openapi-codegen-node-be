import * as Handlebars from 'handlebars';
import { isArray, isObject, isPrimitive } from '../openapi/v3/schema';

export const configureHandlebars = (handlebars: typeof Handlebars) => {
  handlebars.registerHelper('isPrimitive', isPrimitive);
  handlebars.registerHelper('isArray', isArray);
  handlebars.registerHelper('isObject', isObject);
  handlebars.registerHelper(
    'equals',
    function (this: unknown, a: string, b: string, options: Handlebars.HelperOptions): string {
      return a === b ? options.fn(this) : options.inverse(this);
    },
  );

  handlebars.registerHelper(
    'notEquals',
    function (this: unknown, a: string, b: string, options: Handlebars.HelperOptions): string {
      return a !== b ? options.fn(this) : options.inverse(this);
    },
  );

  handlebars.registerHelper('join', (array, separator) => array.join(separator));
};
