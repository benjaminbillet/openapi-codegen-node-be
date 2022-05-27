import Handlebars from 'handlebars/runtime';
import { OpenApiNode } from 'openapi-ref-resolver';
import { configureHandlebars } from '../../src/schema-generator';
import schemaTemplate from '../../src/schema-generator/templates/schema.hbs';
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

describe('composition schema generation', () => {
  it('primitive union', () => {
    const api = buildApi('my-schema', {
      oneOf: [{ type: 'string' }, { type: 'number' }],
    });
    const { models } = processSpec(api);
    const generated = handlebars.template(schemaTemplate)(models['MySchema']);
    expect(generated).toBe(
      `const MySchemaValidator = unionSchema(\n  {},\n  [Joi.string().allow(''), Joi.number()],\n  'oneOf',\n  undefined,\n);`,
    );
  });

  it('intersection of objects', () => {
    const api = buildApi('my-schema', {
      allOf: [{ type: 'object' }, { $ref: '#/components/schemas/another-schema' }, { type: 'object' }],
    });
    api.components.schemas['another-schema'] = { type: 'object' };

    const { models } = processSpec(api);
    const generated = handlebars.template(schemaTemplate)(models['MySchema']);
    expect(generated).toBe(
      `const MySchemaValidator = intersectionSchema(\n  [MySchemaPart1, AnotherSchema, MySchemaPart3],\n);`,
    );
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
    const generated = handlebars.template(schemaTemplate)(models['MySchema']);
    expect(generated).toBe(
      `const MySchemaValidator = unionSchema(\n  {'value-1': MySchemaOption1, 'value-2': MySchemaOption2},\n  [MySchemaOption3],\n  'oneOf',\n  'discriminator',\n);`,
    );
  });
});
