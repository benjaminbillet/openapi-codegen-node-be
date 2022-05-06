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
  primitiveType: string;
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
  discriminator?: string;
  hasMapping: boolean;
}

export type Model = PrimitiveModel | ArrayModel | ObjectModel | CompositionModel;
