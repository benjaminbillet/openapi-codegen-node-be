import { OpenApiNode } from 'openapi-ref-resolver';
import Handlebars from 'handlebars/runtime';
import { EOL } from 'os';
import path from 'path';
import fs from 'fs';
import enumPartial from './templates/enum.hbs';
import array from './templates/array.hbs';
import object from './templates/object.hbs';
import inlineType from './templates/inline-type.hbs';
import composition from './templates/composition.hbs';
import union from './templates/union.hbs';
import intersection from './templates/intersection.hbs';
import primitive from './templates/primitive.hbs';
import inlinePrimitive from './templates/inline/primitive.hbs';
import inlineString from './templates/inline/string.hbs';
import inlineNumber from './templates/inline/number.hbs';
import inlineObject from './templates/inline/object.hbs';
import schema from './templates/schema.hbs';
import schemasTemplate from './templates/schemas.hbs';
import { isArray, isObject, isPrimitive } from '../openapi/v3/schema';
import { Dict } from '../types/common';
import { ModelType } from '../generator/types';
import { processSpec } from '../generator/model';

export const configureHandlebars = (handlebars: typeof Handlebars) => {
  handlebars.registerHelper('propName', (propName: string) => {
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(propName)) {
      return propName;
    }
    return `'${propName}'`;
  });

  handlebars.registerHelper('hasMapping', (composition: OpenApiNode, index: number) => {
    const schema = composition.subSchemas[index];
    return Boolean(composition.discriminator != null && schema && schema.discriminatorValue != null);
  });

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

  Handlebars.registerHelper('escapeComment', function (value: string): string {
    return value
      .replace(/\*\//g, '*')
      .replace(/\/\*/g, '*')
      .replace(/\r?\n(.*)/g, (_, w) => `${EOL} * ${w.trim()}`);
  });

  Handlebars.registerHelper('escapeDescription', function (value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');
  });

  handlebars.registerPartial('enum', handlebars.template(enumPartial));
  handlebars.registerPartial('array', handlebars.template(array));
  handlebars.registerPartial('object', handlebars.template(object));
  handlebars.registerPartial('inline-type', handlebars.template(inlineType));
  handlebars.registerPartial('composition', handlebars.template(composition));
  handlebars.registerPartial('union', handlebars.template(union));
  handlebars.registerPartial('intersection', handlebars.template(intersection));
  handlebars.registerPartial('primitive', handlebars.template(primitive));
  handlebars.registerPartial('schema', handlebars.template(schema));

  handlebars.registerPartial('inline/primitive', handlebars.template(inlinePrimitive));
  handlebars.registerPartial('inline/string', handlebars.template(inlineString));
  handlebars.registerPartial('inline/number', handlebars.template(inlineNumber));
  handlebars.registerPartial('inline/object', handlebars.template(inlineObject));
};

export const generate = (spec: OpenApiNode, options: Dict = { outputDir: 'gen' }) => {
  const { models } = processSpec(spec);
  const modelsToGenerate = Object.values(models).filter(
    (model: any) =>
      (model.modelType === ModelType.OBJECT || model.modelType === ModelType.COMPOSITION || model.enum) &&
      !model.isDictionary,
  );
  const handlebars = Handlebars.create();
  configureHandlebars(handlebars);

  const template = handlebars.template(schemasTemplate);

  const outputFile = path.resolve(options.outputDir, 'schemas.ts');
  const code = template({ models: modelsToGenerate });
  fs.writeFileSync(outputFile, code, { flag: 'w' });
};
