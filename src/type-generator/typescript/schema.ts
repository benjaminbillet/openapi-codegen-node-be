import { OpenApiNode } from 'openapi-ref-resolver';
import { isArray, isComposition, isEnum, isObject, isPrimitive, isReference } from '../../openapi/v3/schema';
import { Dict } from '../../types/common';
import { CompositionType } from '../../openapi/v3/types';
import { capitalize } from '../../util/capitalize';
import { ArrayModel, CompositionModel, Model, ModelType, ObjectModel, PrimitiveModel } from '../types';

const getPrimitiveType = (schema: OpenApiNode) => {
  if (schema.type === 'integer') {
    schema.type = 'number';
  }
  if (schema.type === 'string') {
    if (schema.format === 'date' || schema.format === 'date-time') {
      return 'Date';
    }
    if (schema.format === 'binary') {
      return 'Buffer';
    }
  }
  return schema.type;
};

const ALLOWED_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJIKLMNOPQRSTUVWXYZ123456789_';
const escapeName = (s: string) => {
  const original = [...s];
  let capitalizeNext = true;
  const nameArray = original.map((char) => {
    if (ALLOWED_CHARS.indexOf(char) >= 0) {
      if (capitalizeNext) {
        capitalizeNext = false;
        return char.toUpperCase();
      }
      return char;
    }
    capitalizeNext = true;
    return null;
  });

  let name = nameArray.filter((c) => c != null).join('');
  if (name.match(/^[0-9]/)) {
    name = `_${name}`;
  }
  return name;
};
const getNameFromRef = (ref: string) => {
  const [, , , name] = ref.split('/');
  return escapeName(name);
};

export class ModelRegistry {
  private models: Dict<any> = {};

  registerModel(name: string, model: any) {
    this.models[name] = model;
  }
  getModel(name: string) {
    return this.models[name];
  }
  hasModel(name: string) {
    return this.getModel(name) != null;
  }
  getModels() {
    return this.models;
  }
}

const resolveReference = (document: OpenApiNode, schema: OpenApiNode) => {
  if (isReference(schema)) {
    const [, , componentType, schemaName] = schema.$ref.split('/');
    return document.components[componentType][schemaName];
  }
  return schema;
};

const processComposition = (
  modelRegistry: ModelRegistry,
  document: OpenApiNode,
  schema: OpenApiNode,
  parentName: string,
  name?: string,
): CompositionModel => {
  const compositionType = Object.values(CompositionType).find((compositionType) => schema[compositionType] != null);
  if (compositionType == null) {
    throw new Error('Unknown composition type');
  }
  const myName = name || `${parentName}${capitalize(compositionType)}`;
  const refToIndex: Dict<number> = {};
  const subSchemas: CompositionModel['subSchemas'] = schema[compositionType].map(
    (subSchema: OpenApiNode, index: number) => {
      if (isReference(subSchema)) {
        refToIndex[subSchema.$ref] = index;
        const itemType = getNameFromRef(subSchema.$ref);
        return processSchema(modelRegistry, document, subSchema, myName, itemType);
      } else if (isPrimitive(subSchema)) {
        return processSchema(modelRegistry, document, subSchema, myName);
      }
      let suffix = 'Option';
      if (compositionType === 'allOf') {
        suffix = 'Part';
      }
      return processSchema(modelRegistry, document, subSchema, myName, myName + suffix + (index + 1));
    },
  );

  let discriminator;
  let hasMapping = false;
  if (schema.discriminator) {
    discriminator = schema.discriminator.propertyName;
    if (schema.discriminator.mapping) {
      hasMapping = true;
      Object.entries(schema.discriminator.mapping).forEach(([value, ref]: any) => {
        let index = refToIndex[ref];
        if (index == null) {
          // reference to a composition branch
          index = ref.split('/').pop();
        }
        if (index != null) {
          subSchemas[index] = {
            ...subSchemas[index],
            discriminatorValue: value,
          };
        }
      });
    }
  }
  return {
    ...schema,
    modelType: ModelType.COMPOSITION,
    name: myName,
    compositionType,
    subSchemas,
    discriminator,
    hasMapping,
  };
};

const processPrimitive = (schema: OpenApiNode, parentName: string, name?: string): PrimitiveModel => {
  const primitiveType = getPrimitiveType(schema);
  const myName = name || (isEnum(schema) ? parentName + 'Enum' : parentName + capitalize(primitiveType));
  // TODO composition of primitives
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return {
    ...schema,
    modelType: ModelType.PRIMITIVE,
    name: myName,
    primitiveType,
  };
};

const processArray = (
  modelRegistry: ModelRegistry,
  document: OpenApiNode,
  schema: OpenApiNode,
  parentName: string,
  name?: string,
): ArrayModel => {
  const myName = name || `${parentName}Array`;
  let itemModel;
  if (schema.items) {
    if (isReference(schema.items)) {
      const itemType = getNameFromRef(schema.items.$ref);
      itemModel = processSchema(modelRegistry, document, schema.items, myName, itemType);
    } else if (isPrimitive(schema.items)) {
      itemModel = processSchema(modelRegistry, document, schema.items, myName);
    } else {
      itemModel = processSchema(modelRegistry, document, schema.items, myName, myName + 'Item');
    }
  }
  // TODO composition of arrays
  return {
    ...schema,
    modelType: ModelType.ARRAY,
    name: myName,
    items: itemModel,
  };
};

export const processObject = (
  modelRegistry: ModelRegistry,
  document: OpenApiNode,
  schema: OpenApiNode,
  parentName: string,
  name?: string,
): ObjectModel => {
  const myName = name || `${parentName}Object`;
  const properties: ObjectModel['properties'] = Object.entries(schema.properties || []).map(([propName, prop]: any) => {
    let propModel;
    if (isReference(prop)) {
      const propType = getNameFromRef(prop.$ref);
      propModel = processSchema(modelRegistry, document, prop, myName, propType);
    } else if (isPrimitive(prop)) {
      propModel = processSchema(modelRegistry, document, prop, myName);
    } else {
      propModel = processSchema(modelRegistry, document, prop, myName, myName + escapeName(propName));
    }
    return {
      ...propModel,
      required: Boolean((schema.required && schema.required.includes(propName)) || propModel.default != null),
      propName: propName,
    };
  });

  const { additionalProperties, ...schemaRest } = schema;
  const model: ObjectModel = {
    ...schemaRest,
    modelType: ModelType.OBJECT,
    name: myName,
    properties,
  };

  if (additionalProperties && typeof additionalProperties === 'object') {
    if (isReference(additionalProperties)) {
      const propType = getNameFromRef(additionalProperties.$ref);
      model.additionalProperties = processSchema(modelRegistry, document, additionalProperties, myName, propType);
    } else if (isPrimitive(additionalProperties)) {
      model.additionalProperties = processSchema(modelRegistry, document, schema.additionalProperties, myName);
    } else {
      model.additionalProperties = processSchema(
        modelRegistry,
        document,
        additionalProperties,
        myName,
        myName + 'Item',
      );
    }
  }
  if (isComposition(schema)) {
    model.composition = processComposition(modelRegistry, document, schema, myName);
  } else if (additionalProperties && schema.properties == null) {
    model.isDictionary = true;
  }
  if (additionalProperties === true) {
    model.hasAnyAdditionalProperties = true;
  }

  if (isComposition(schema)) {
    model.composition = processComposition(modelRegistry, document, schema, myName);
  }

  return model;
};

const processSchema = (
  modelRegistry: ModelRegistry,
  document: OpenApiNode,
  schema: OpenApiNode,
  parentName: string,
  name?: string,
): Model => {
  if (name && modelRegistry.hasModel(name)) {
    return modelRegistry.getModel(name);
  }
  const resolved = resolveReference(document, schema);

  let model: any;
  if (isPrimitive(resolved)) {
    model = processPrimitive(resolved, parentName, name);
  } else if (isArray(resolved)) {
    model = processArray(modelRegistry, document, resolved, parentName, name);
  } else if (isObject(resolved)) {
    model = processObject(modelRegistry, document, resolved, parentName, name);
  } else if (isComposition(resolved)) {
    model = processComposition(modelRegistry, document, resolved, parentName, name);
  }

  if (isReference(schema)) {
    model.ref = schema.$ref;
  }

  if (model && model.name) {
    modelRegistry.registerModel(model.name, model);
  }
  if (model && model.composition && model.composition.name) {
    modelRegistry.registerModel(model.composition.name, model.composition);
  }
  return model;
};

export default (modelRegistry: ModelRegistry, spec: OpenApiNode) => {
  Object.entries(spec.components.schemas).forEach(([name, schema]: any) => {
    processSchema(modelRegistry, spec, schema, '', escapeName(name));
  });
};
