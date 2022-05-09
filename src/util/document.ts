import { OpenApiNode } from 'openapi-ref-resolver';
import { isReference } from '../openapi/v3/schema';
import { followLocalPath } from './openapi';

export const resolveReference = (document: OpenApiNode, node: OpenApiNode) => {
  if (isReference(node)) {
    return followLocalPath(document, node.$ref.substring(2));
  }
  return node;
};
