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

describe('array code generation', () => {
  it('any array', () => {
    const api = buildApi('my-schema', {
      type: 'array',
    });
    const { models } = processSpec(api);
    const generated = handlebars.template(modelTemplate)(models['MySchema']);
    expect(generated).toBe('type MySchema = Array<any>;');
  });

  it('primitive array', () => {
    const api = buildApi('my-schema', {
      type: 'array',
      items: {
        type: 'string',
      },
    });
    const { models } = processSpec(api);
    const generated = handlebars.template(modelTemplate)(models['MySchema']);
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
    const { models } = processSpec(api);
    const generated = handlebars.template(modelTemplate)(models['MySchema']);
    expect(generated).toBe('type MySchema = Array<string | null>;');
  });

  it('object array', () => {
    const api = buildApi('my-schema', {
      type: 'array',
      items: {
        type: 'object',
      },
    });
    const { models } = processSpec(api);
    const generatedArray = handlebars.template(modelTemplate)(models['MySchema']);
    const generatedArrayItem = handlebars.template(modelTemplate)(models['MySchemaItem']);

    expect(generatedArrayItem).toBe('interface MySchemaItem {\n};');
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
    const { models } = processSpec(api);
    const generated = handlebars.template(modelTemplate)(models['MySchema']);
    expect(generated).toBe('type MySchema = Array<Array<number>>;');
  });
});
