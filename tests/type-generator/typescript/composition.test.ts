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

describe('composition code generation', () => {
  it('primitive union', () => {
    const api = buildApi('my-schema', {
      oneOf: [{ type: 'string' }, { type: 'number' }],
    });
    const modelRegistry = new ModelRegistry();
    processModels(modelRegistry, api);
    const generated = handlebars.template(modelTemplate)(modelRegistry.getModels()['MySchema']);
    expect(generated).toBe('type MySchema = string | number;');
  });

  it('intersection of objects', () => {
    const api = buildApi('my-schema', {
      allOf: [{ type: 'object' }, { $ref: '#/components/schemas/another-schema' }, { type: 'object' }],
    });
    api.components.schemas['another-schema'] = { type: 'object' };
    const modelRegistry = new ModelRegistry();
    processModels(modelRegistry, api);
    const generated = handlebars.template(modelTemplate)(modelRegistry.getModels()['MySchema']);
    expect(generated).toBe('type MySchema = MySchemaPart1 & AnotherSchema & MySchemaPart3;');
  });

  it('union with discriminator mapping', () => {
    const api = buildApi('my-schema', {
      oneOf: [
        { type: 'object', prop: { discriminator: { type: 'string' } } },
        { type: 'object', prop: { discriminator: { type: 'string' } } },
        { type: 'object', prop: { discriminator: { type: 'string' } } },
      ],
      discriminator: {
        propertyName: 'discriminator',
        mapping: {
          'value-1': '#/components/schemas/my-schema/oneOf/0',
          'value-2': '#/components/schemas/my-schema/oneOf/1',
        },
      },
    });
    const modelRegistry = new ModelRegistry();
    processModels(modelRegistry, api);
    const generated = handlebars.template(modelTemplate)(modelRegistry.getModels()['MySchema']);
    expect(generated).toBe(
      `type MySchema = Derived<MySchemaOption1, 'discriminator', { discriminator: 'value-1' }> | Derived<MySchemaOption2, 'discriminator', { discriminator: 'value-2' }> | MySchemaOption3;`,
    );
  });
});
