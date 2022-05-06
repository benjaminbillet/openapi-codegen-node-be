import Handlebars from 'handlebars';
import enumPartial from './templates/enum.hbs';
import nullable from './templates/nullable.hbs';
import required from './templates/required.hbs';
import array from './templates/array.hbs';
import object from './templates/object.hbs';
import inlineType from './templates/inline-type.hbs';
import composition from './templates/composition.hbs';
import union from './templates/union.hbs';
import intersection from './templates/intersection.hbs';
import primitive from './templates/primitive.hbs';

export const configureHandlebars = (handlebars: typeof Handlebars) => {
  handlebars.registerHelper('propName', (propName: string) => {
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(propName)) {
      return propName;
    }
    return `'${propName}'`;
  });

  handlebars.registerHelper('hasMapping', (index: number, options: Handlebars.HelperOptions) => {
    const composition = options.data.root;
    const schema = composition.subSchemas[index];
    return Boolean(composition.discriminator != null && schema && schema.discriminatorValue != null);
  });

  handlebars.registerPartial('enum', handlebars.template(enumPartial));
  handlebars.registerPartial('nullable', handlebars.template(nullable));
  handlebars.registerPartial('required', handlebars.template(required));
  handlebars.registerPartial('array', handlebars.template(array));
  handlebars.registerPartial('object', handlebars.template(object));
  handlebars.registerPartial('inline-type', handlebars.template(inlineType));
  handlebars.registerPartial('composition', handlebars.template(composition));
  handlebars.registerPartial('union', handlebars.template(union));
  handlebars.registerPartial('intersection', handlebars.template(intersection));
  handlebars.registerPartial('primitive', handlebars.template(primitive));
};
