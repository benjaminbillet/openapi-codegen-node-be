import { OpenApiNode } from '../../../../openapi-ref-resolver';
import { ModelRegistry } from './model-registry';
import { processModels } from './schema';
import { processOperations } from './operation';

export const processSpec = (spec: OpenApiNode) => {
  const modelRegistry = new ModelRegistry();

  processModels(spec, modelRegistry);
  const operations = processOperations(spec, modelRegistry);

  return {
    operations,
    models: modelRegistry.getModels(),
  };
};
