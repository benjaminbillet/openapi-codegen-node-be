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

describe('primitive schema generation', () => {
  it('string type', () => {
    const api = buildApi('my-schema', {
      type: 'string',
    });
    const { models } = processSpec(api);
    const generated = handlebars.template(schemaTemplate)(models['MySchema']);
    expect(generated).toBe(`const MySchemaValidator = Joi.string().allow('');`);
  });

  it('integer type', () => {
    const api = buildApi('my-schema', {
      type: 'integer',
      format: 'int32',
    });
    const { models } = processSpec(api);
    const generated = handlebars.template(schemaTemplate)(models['MySchema']);
    expect(generated).toBe('const MySchemaValidator = Joi.number();');
  });

  it('date format', () => {
    const api = buildApi('my-schema', {
      type: 'string',
      format: 'date-time',
    });
    const { models } = processSpec(api);
    const generated = handlebars.template(schemaTemplate)(models['MySchema']);
    expect(generated).toBe('const MySchemaValidator = Joi.date().iso();');
  });

  it('enum', () => {
    const api = buildApi('my-schema', {
      type: 'string',
      enum: ['value1', 'value2'],
    });
    const { models } = processSpec(api);
    const generated = handlebars.template(schemaTemplate)(models['MySchema']);
    expect(generated).toBe(`const MySchemaValidator = Joi.string().valid('value1', 'value2');`);
  });

  it('min/max', () => {
    const api = buildApi('my-schema', {
      type: 'number',
      exclusiveMinimum: true,
      minimum: 5,
      maximum: 10,
    });
    const { models } = processSpec(api);
    const generated = handlebars.template(schemaTemplate)(models['MySchema']);
    expect(generated).toBe(`const MySchemaValidator = Joi.number().greater(5).max(10);`);
  });

  it('nullable', () => {
    const api = buildApi('my-schema', {
      type: 'boolean',
      nullable: true,
    });
    const { models } = processSpec(api);
    const generated = handlebars.template(schemaTemplate)(models['MySchema']);
    expect(generated).toBe(`const MySchemaValidator = Joi.boolean().allow(null);`);
  });
});
