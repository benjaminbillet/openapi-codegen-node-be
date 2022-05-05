import path from 'path';
import { bundleOpenApiSpec } from 'openapi-ref-resolver';
import * as Handlebars from 'handlebars/runtime';
import { configureHandlebars as configureForTypeGeneration } from '../src/type-generator';
import { configureHandlebars as configureForTypescriptGeneration } from '../src/type-generator/typescript';
import processModels, { ModelRegistry } from '../src/type-generator/typescript/schema';
import modelTemplate from '../src/type-generator/typescript/templates/model.hbs';
import enumPartial from '../src/type-generator/typescript/templates/enum.hbs';
import nullable from '../src/type-generator/typescript/templates/nullable.hbs';
import required from '../src/type-generator/typescript/templates/required.hbs';
import array from '../src/type-generator/typescript/templates/array.hbs';
import object from '../src/type-generator/typescript/templates/object.hbs';
import inlineType from '../src/type-generator/typescript/templates/inline-type.hbs';
import composition from '../src/type-generator/typescript/templates/composition.hbs';
import union from '../src/type-generator/typescript/templates/union.hbs';
import intersection from '../src/type-generator/typescript/templates/intersection.hbs';
import dict from '../src/type-generator/typescript/templates/dict.hbs';

describe('bundle', () => {
  it('test', () => {
    const handlebars = Handlebars.create();
    configureForTypeGeneration(handlebars);
    configureForTypescriptGeneration(handlebars);

    handlebars.registerPartial('enum', handlebars.template(enumPartial));
    handlebars.registerPartial('nullable', handlebars.template(nullable));
    handlebars.registerPartial('required', handlebars.template(required));
    handlebars.registerPartial('array', handlebars.template(array));
    handlebars.registerPartial('object', handlebars.template(object));
    handlebars.registerPartial('inline-type', handlebars.template(inlineType));
    handlebars.registerPartial('composition', handlebars.template(composition));
    handlebars.registerPartial('union', handlebars.template(union));
    handlebars.registerPartial('intersection', handlebars.template(intersection));
    handlebars.registerPartial('dict', handlebars.template(dict));

    const rootFile = path.resolve(__dirname, 'api.yaml');
    const spec = bundleOpenApiSpec(rootFile);

    const modelRegistry = new ModelRegistry();
    processModels(modelRegistry, spec);

    Object.values(modelRegistry.getModels()).forEach((model) => {
      console.log(model.name, handlebars.template(modelTemplate)(model));
    });
  });
});
