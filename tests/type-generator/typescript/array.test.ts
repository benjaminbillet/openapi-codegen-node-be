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

describe('array code generation', () => {
  it('any array', () => {
    const api = buildApi('my-schema', {
      type: 'array',
    });
    const modelRegistry = new ModelRegistry();
    processModels(modelRegistry, api);
    const generated = handlebars.template(modelTemplate)(modelRegistry.getModels()['MySchema']);
    expect(generated).toBe('type MySchema = Array<any>;');
  });

  it('primitive array', () => {
    const api = buildApi('my-schema', {
      type: 'array',
      items: {
        type: 'string',
      },
    });
    const modelRegistry = new ModelRegistry();
    processModels(modelRegistry, api);
    const generated = handlebars.template(modelTemplate)(modelRegistry.getModels()['MySchema']);
    expect(generated).toBe('type MySchema = Array<string>;');
  });

  it('primitive nullable array', () => {
    const api = buildApi('my-schema', {
      type: 'array',
      items: {
        type: 'string',
        nullable: true,
      },
    });
    const modelRegistry = new ModelRegistry();
    processModels(modelRegistry, api);
    const generated = handlebars.template(modelTemplate)(modelRegistry.getModels()['MySchema']);
    expect(generated).toBe('type MySchema = Array<string | null>;');
  });

  it('object array', () => {
    const api = buildApi('my-schema', {
      type: 'array',
      items: {
        type: 'object',
      },
    });
    const modelRegistry = new ModelRegistry();
    processModels(modelRegistry, api);

    const generatedArray = handlebars.template(modelTemplate)(modelRegistry.getModels()['MySchema']);
    const generatedArrayItem = handlebars.template(modelTemplate)(modelRegistry.getModels()['MySchemaItem']);

    expect(generatedArrayItem).toBe('type MySchemaItem = {\n};');
    expect(generatedArray).toBe('type MySchema = Array<MySchemaItem>;');
  });

  it('array of array', () => {
    const api = buildApi('my-schema', {
      type: 'array',
      items: {
        type: 'array',
        items: {
          type: 'integer',
        },
      },
    });
    const modelRegistry = new ModelRegistry();
    processModels(modelRegistry, api);

    const generatedArray = handlebars.template(modelTemplate)(modelRegistry.getModels()['MySchema']);
    expect(generatedArray).toBe('type MySchema = Array<Array<number>>;');
  });
});
