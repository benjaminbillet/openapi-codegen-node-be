import path from 'path';
import { bundleOpenApiSpec } from 'openapi-ref-resolver';

describe('bundle', () => {
  it('test', () => {
    const rootFile = path.resolve(__dirname, 'api.yaml');
    const spec = bundleOpenApiSpec(rootFile);

    console.log(JSON.stringify(spec, null, 2));
  });
});
