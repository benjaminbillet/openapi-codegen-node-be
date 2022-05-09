import Handlebars from 'handlebars/runtime';
import { OpenApiNode } from 'openapi-ref-resolver';
import { configureHandlebars } from '../../src/type-generator';
import modelTemplate from '../../src/type-generator/templates/model.hbs';
import { processSpec } from '../../src/generator/model';

const handlebars = Handlebars.create();
configureHandlebars(handlebars);

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
    const { models } = processSpec(api);
    const generated = handlebars.template(modelTemplate)(models['MySchema']);
    expect(generated).toBe('type MySchema = string | number;');
  });

  it('intersection of objects', () => {
    const api = buildApi('my-schema', {
      allOf: [{ type: 'object' }, { $ref: '#/components/schemas/another-schema' }, { type: 'object' }],
    });
    api.components.schemas['another-schema'] = { type: 'object' };

    const { models } = processSpec(api);
    const generated = handlebars.template(modelTemplate)(models['MySchema']);
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
    const { models } = processSpec(api);
    const generated = handlebars.template(modelTemplate)(models['MySchema']);
    expect(generated).toBe(
      `type MySchema = Derived<MySchemaOption1, 'discriminator', { discriminator: 'value-1' }> | Derived<MySchemaOption2, 'discriminator', { discriminator: 'value-2' }> | MySchemaOption3;`,
    );
  });
});
