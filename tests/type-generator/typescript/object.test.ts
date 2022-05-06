import Handlebars from 'handlebars/runtime';
import { OpenApiNode } from 'openapi-ref-resolver';
import { configureHandlebars as configureForTypeGeneration } from '../../../src/type-generator';
import { configureHandlebars as configureForTypescriptGeneration } from '../../../src/type-generator/typescript';
import processModels, { ModelRegistry } from '../../../src/type-generator/typescript/schema';
import modelTemplate from '../../../src/type-generator/typescript/templates/model.hbs';
import { Dict } from '../../../src/types/common';

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

describe('object code generation', () => {
  it('empty object type', () => {
    const api = buildApi('my-schema', {
      type: 'object',
    });
    const modelRegistry = new ModelRegistry();
    processModels(modelRegistry, api);
    const generated = handlebars.template(modelTemplate)(modelRegistry.getModels()['MySchema']);
    expect(generated).toBe('type MySchema = {\n};');
  });

  it('object with primitive prop', () => {
    const api = buildApi('my-schema', {
      type: 'object',
      properties: {
        prop: {
          type: 'string',
        },
      },
    });
    const modelRegistry = new ModelRegistry();
    processModels(modelRegistry, api);
    const generated = handlebars.template(modelTemplate)(modelRegistry.getModels()['MySchema']);
    expect(generated).toBe('type MySchema = {\n  prop?: string,\n};');
  });

  it('any dict', () => {
    const api = buildApi('my-schema', {
      type: 'object',
      additionalProperties: true,
    });
    const modelRegistry = new ModelRegistry();
    processModels(modelRegistry, api);
    const generated = handlebars.template(modelTemplate)(modelRegistry.getModels()['MySchema']);
    expect(generated).toBe('type MySchema = Dict<any>;');
  });

  it('typed dict', () => {
    const api = buildApi('my-schema', {
      type: 'object',
      additionalProperties: {
        type: 'number',
      },
    });
    const modelRegistry = new ModelRegistry();
    processModels(modelRegistry, api);
    const generated = handlebars.template(modelTemplate)(modelRegistry.getModels()['MySchema']);
    expect(generated).toBe('type MySchema = Dict<number>;');
  });

  it('properties + any dict', () => {
    const api = buildApi('my-schema', {
      type: 'object',
      additionalProperties: true,
      properties: {
        prop: {
          type: 'string',
        },
      },
    });
    const modelRegistry = new ModelRegistry();
    processModels(modelRegistry, api);
    const generated = handlebars.template(modelTemplate)(modelRegistry.getModels()['MySchema']);
    expect(generated).toBe('type MySchema = {\n  prop?: string,\n} & Dict<any>;');
  });

  it('properties + typed dict', () => {
    const api = buildApi('my-schema', {
      type: 'object',
      additionalProperties: {
        type: 'string',
      },
      properties: {
        prop: {
          type: 'string',
        },
      },
    });
    const modelRegistry = new ModelRegistry();
    processModels(modelRegistry, api);
    const generated = handlebars.template(modelTemplate)(modelRegistry.getModels()['MySchema']);
    expect(generated).toBe('type MySchema = {\n  prop?: string,\n} & Dict<unknown>;');
  });

  it('properties + typed dict + composition', () => {
    const api = buildApi('my-schema', {
      type: 'object',
      additionalProperties: {
        type: 'string',
      },
      properties: {
        prop: {
          type: 'string',
        },
      },
      oneOf: [{ type: 'object' }, { type: 'object' }],
    });
    const modelRegistry = new ModelRegistry();
    processModels(modelRegistry, api);
    const generated = handlebars.template(modelTemplate)(modelRegistry.getModels()['MySchema']);
    expect(generated).toBe('type MySchema = {\n  prop?: string,\n} & MySchemaOneOf & Dict<unknown>;');
  });

  it('required and nullable properties', () => {
    const api = buildApi('my-schema', {
      type: 'object',
      required: ['prop1', 'prop2'],
      properties: {
        prop1: {
          type: 'string',
        },
        prop2: {
          type: 'string',
          format: 'date',
          nullable: true,
        },
        prop3: {
          type: 'number',
        },
        prop4: {
          type: 'boolean',
          nullable: true,
        },
        prop5: {
          type: 'object',
        },
      },
    });
    const modelRegistry = new ModelRegistry();
    processModels(modelRegistry, api);
    const generated = handlebars.template(modelTemplate)(modelRegistry.getModels()['MySchema']);
    expect(generated).toBe(
      'type MySchema = {\n  prop1: string,\n  prop2: Date | null,\n  prop3?: number,\n  prop4?: boolean | null,\n  prop5?: MySchemaProp5,\n};',
    );
  });
});
