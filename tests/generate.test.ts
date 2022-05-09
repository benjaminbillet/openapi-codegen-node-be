import { bundleOpenApiSpec } from 'openapi-ref-resolver';
import { generate as generateTypes } from '../src/type-generator';
import { generate as generateRoutes } from '../src/backend-generator';

describe('generate', () => {
  it('generate types', () => {
    const bundled = bundleOpenApiSpec(__dirname + '/api.yaml');
    generateTypes(bundled.document);
  });

  it('generate routes', () => {
    const bundled = bundleOpenApiSpec(__dirname + '/api.yaml');
    generateRoutes(bundled.document);
  });
});
