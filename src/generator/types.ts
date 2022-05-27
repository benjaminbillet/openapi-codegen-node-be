import { OpenApiNode } from '../../../openapi-ref-resolver';
import { Dict } from '../types/common';

export interface Generator<T extends BaseOptions> {
  generate: (spec: OpenApiNode, options: T) => void;
}

export interface BaseOptions {
  outputDir: string;
}

interface BaseModel {
  name: string;
  nullable?: boolean;
  title?: string;
  description?: string;
  deprecated?: boolean;
  default?: string;
}

export enum ModelType {
  PRIMITIVE = 'primitive',
  OBJECT = 'object',
  ARRAY = 'array',
  COMPOSITION = 'composition',
}

export interface PrimitiveModel extends BaseModel {
  modelType: 'primitive';
  enum?: string[];
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: boolean;
  minimum?: number;
  exclusiveMinimum?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  format?: string;
}

export interface ObjectModel extends BaseModel {
  modelType: 'object';
  composition?: CompositionModel;
  properties?: Array<Model & { propName: string; required: boolean }>;
  hasAnyAdditionalProperties?: boolean;
  additionalProperties?: Model;
  isDictionary?: boolean;
  interface?: boolean;

  maxProperties?: number;
  minProperties?: number;
}

export interface ArrayModel extends BaseModel {
  modelType: 'array';
  items?: Model;

  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
}

export interface CompositionModel extends BaseModel {
  modelType: 'composition';
  compositionType: 'oneOf' | 'anyOf' | 'allOf';
  subSchemas: Array<Model & { discriminatorValue?: string }>;
  mappedSubSchemas: Array<DiscriminatedModel>;
  unmappedSubSchemas: Array<Model>;
  discriminator?: string;
  hasMapping: boolean;
}

export type Model = PrimitiveModel | ArrayModel | ObjectModel | CompositionModel;
export type DiscriminatedModel = Model & { discriminatorValue: string };

export interface OperationParameter {
  name: string;
  in: 'path' | 'header' | 'query' | 'cookie';
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  style?: 'form' | 'simple';
  explode?: boolean;
  allowReserved?: boolean;
  mimeType?: string;
  schema: Model;
}

export interface Operation {
  path: string;
  constantName: string;
  method: string;
  operationId: string;
  parameters: OperationParameter[];
}

export interface GenerateContext {
  models: Dict<Model>;
  operations: Dict<Operation[]>;
}
