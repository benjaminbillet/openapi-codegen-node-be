import Handlebars from 'handlebars/runtime';
import { OpenApiNode } from 'openapi-ref-resolver';
import { configureHandlebars as configureForTypeGeneration } from '../../../src/type-generator';
import { configureHandlebars as configureForTypescriptGeneration } from '../../../src/type-generator/typescript';
import processModels, { ModelRegistry } from '../../../src/type-generator/typescript/schema';
import modelTemplate from '../../../src/type-generator/typescript/templates/model.hbs';

const handlebars = Handlebars.create();
configureForTypeGeneration(handlebars);
configureForTypescriptGeneration(handlebars);

const buildApi = (name: string, schema: OpenApiNode): OpenApiNode => ({
  components: {
    schemas: {
      [name]: schema,
    },
  },
});

describe('primitive code generation', () => {
  it('string type', () => {
    const api = buildApi('my-schema', {
      type: 'string',
    });
    const modelRegistry = new ModelRegistry();
    processModels(modelRegistry, api);
    const generated = handlebars.template(modelTemplate)(modelRegistry.getModels()['MySchema']);
    expect(generated).toBe('type MySchema = string;');
  });

  it('integer type', () => {
    const api = buildApi('my-schema', {
      type: 'integer',
      format: 'int32',
    });
    const modelRegistry = new ModelRegistry();
    processModels(modelRegistry, api);
    const generated = handlebars.template(modelTemplate)(modelRegistry.getModels()['MySchema']);
    expect(generated).toBe('type MySchema = number;');
  });

  it('date format', () => {
    const api = buildApi('my-schema', {
      type: 'string',
      format: 'date-time',
    });
    const modelRegistry = new ModelRegistry();
    processModels(modelRegistry, api);
    const generated = handlebars.template(modelTemplate)(modelRegistry.getModels()['MySchema']);
    expect(generated).toBe('type MySchema = Date;');
  });

  it('enum', () => {
    const api = buildApi('my-schema', {
      type: 'string',
      enum: ['value1', 'value2'],
    });
    const modelRegistry = new ModelRegistry();
    processModels(modelRegistry, api);
    const generated = handlebars.template(modelTemplate)(modelRegistry.getModels()['MySchema']);
    expect(generated).toBe(`type MySchema = 'value1' | 'value2';`);
  });
});
