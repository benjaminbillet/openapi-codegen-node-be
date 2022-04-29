import { OpenApiNode } from 'openapi-ref-resolver';

export const PRIMITIVE_TYPES = ['string', 'number', 'integer', 'boolean'] as const;
export const isPrimitive = (schema: OpenApiNode) => {
  return PRIMITIVE_TYPES.includes(schema.type);
};

export const isNullable = (schema: OpenApiNode) => {
  return schema.nullable != null ? schema.nullable : false;
};

export const isArray = (schema: OpenApiNode) => {
  return schema.type === 'array' || schema.items != null;
};

export const isObject = (schema: OpenApiNode) => {
  return schema.type === 'object' || schema.properties != null || schema.additionalProperties != null;
};

export const isReference = (node: OpenApiNode) => {
  return node.$ref != null;
};

export const isEnum = (schema: OpenApiNode) => {
  return schema.enum != null;
};

export const isComposition = (schema: OpenApiNode) => {
  return schema.oneOf != null || schema.allOf != null || schema.anyOf != null;
};
