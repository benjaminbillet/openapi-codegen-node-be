import { OpenApiNode } from 'openapi-ref-resolver';

export const followLocalPath = (document: OpenApiNode, path: string): OpenApiNode => {
  const parts = path.split('/');
  const value = parts.reduce((result, part) => {
    return result[part.replaceAll('~0', '~').replaceAll('~1', '/')];
  }, document);
  return value;
};
