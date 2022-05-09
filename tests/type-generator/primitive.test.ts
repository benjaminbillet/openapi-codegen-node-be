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

describe('primitive code generation', () => {
  it('string type', () => {
    const api = buildApi('my-schema', {
      type: 'string',
    });
    const { models } = processSpec(api);
    const generated = handlebars.template(modelTemplate)(models['MySchema']);
    expect(generated).toBe('type MySchema = string;');
  });

  it('integer type', () => {
    const api = buildApi('my-schema', {
      type: 'integer',
      format: 'int32',
    });
    const { models } = processSpec(api);
    const generated = handlebars.template(modelTemplate)(models['MySchema']);
    expect(generated).toBe('type MySchema = number;');
  });

  it('date format', () => {
    const api = buildApi('my-schema', {
      type: 'string',
      format: 'date-time',
    });
    const { models } = processSpec(api);
    const generated = handlebars.template(modelTemplate)(models['MySchema']);
    expect(generated).toBe('type MySchema = Date;');
  });

  it('enum', () => {
    const api = buildApi('my-schema', {
      type: 'string',
      enum: ['value1', 'value2'],
    });
    const { models } = processSpec(api);
    const generated = handlebars.template(modelTemplate)(models['MySchema']);
    expect(generated).toBe(`type MySchema = 'value1' | 'value2';`);
  });
});
