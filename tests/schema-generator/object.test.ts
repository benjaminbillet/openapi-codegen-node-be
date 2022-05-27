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

describe('object schema generation', () => {
  it('empty object type', () => {
    const api = buildApi('my-schema', {
      type: 'object',
    });
    const { models } = processSpec(api);
    const generated = handlebars.template(schemaTemplate)(models['MySchema']);
    expect(generated).toBe('const MySchemaValidator = Joi.object({\n});');
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
    const { models } = processSpec(api);
    const generated = handlebars.template(schemaTemplate)(models['MySchema']);
    expect(generated).toBe(`const MySchemaValidator = Joi.object({\n  prop: Joi.string().allow(\'\'),\n});`);
  });

  it('any dict', () => {
    const api = buildApi('my-schema', {
      type: 'object',
      additionalProperties: true,
    });
    const { models } = processSpec(api);
    const generated = handlebars.template(schemaTemplate)(models['MySchema']);
    expect(generated).toBe('const MySchemaValidator = Joi.object();');
  });

  it('typed dict', () => {
    const api = buildApi('my-schema', {
      type: 'object',
      additionalProperties: {
        type: 'number',
      },
    });
    const { models } = processSpec(api);
    const generated = handlebars.template(schemaTemplate)(models['MySchema']);
    expect(generated).toBe('const MySchemaValidator = Joi.object().pattern(/.+/, [Joi.number()]);');
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
    const { models } = processSpec(api);
    const generated = handlebars.template(schemaTemplate)(models['MySchema']);
    expect(generated).toBe(
      `const MySchemaValidator = Joi.object({\n  prop: Joi.string().allow(''),\n}).pattern(/.+/, [Joi.any()];`,
    );
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
    const { models } = processSpec(api);
    const generated = handlebars.template(schemaTemplate)(models['MySchema']);
    expect(generated).toBe(
      `const MySchemaValidator = Joi.object({\n  prop: Joi.string().allow(''),\n}).pattern(/.+/, [Joi.string().allow('')];`,
    );
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
    const { models } = processSpec(api);
    const generated = handlebars.template(schemaTemplate)(models['MySchema']);
    expect(generated).toBe(
      `const MySchemaValidator = intersectionSchema(MySchemaOneOf, Joi.object({\n  prop: Joi.string().allow(''),\n}).pattern(/.+/, [Joi.string().allow('')]);`,
    );
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
    const { models } = processSpec(api);
    const generated = handlebars.template(schemaTemplate)(models['MySchema']);
    expect(generated).toBe(
      `const MySchemaValidator = Joi.object({\n  prop1: Joi.string().allow('').required(),\n  prop2: Joi.date().iso().allow(null).required(),\n  prop3: Joi.number(),\n  prop4: Joi.boolean().allow(null),\n  prop5: MySchemaProp5,\n});`,
    );
  });
});
