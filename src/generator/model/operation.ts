import { OpenApiNode } from '../../../../openapi-ref-resolver';
import { escapeName, getNameFromRef, ModelRegistry } from './model-registry';
import { isReference } from '../../openapi/v3/schema';
import { capitalize } from '../../util/capitalize';
import { Dict } from '../../types/common';
import { processModel } from './schema';
import { resolveReference } from '../../util/document';
import { Model, ModelType, ObjectModel, Operation, OperationParameter } from '../types';
import { getConstantName } from '../../type-generator';

const METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];
const PARAM_TYPES = ['query', 'header', 'path', 'cookie'];

const getParameterModelName = (
  node: OpenApiNode,
  baseName: string,
  baseType: string,
  parentName: string,
  modelRegistry: ModelRegistry,
) => {
  if (isReference(node)) {
    return getNameFromRef(node.$ref);
  }
  let name = baseName;
  if (modelRegistry.hasModel(name)) {
    name = `${name}${capitalize(baseType)}`;
  }
  if (modelRegistry.hasModel(name)) {
    name = `${parentName}${capitalize(name)}`;
  }
  return escapeName(name);
};

const processMediaTypes = (
  context: Context,
  baseName: string,
  baseNameSuffix: string,
  mediaTypes: Dict<OpenApiNode>,
) => {
  const entries = Object.entries(mediaTypes);
  const multi = entries.length > 1;
  let first: any;
  const subModels = Object.fromEntries(
    entries.map(([mimeType, media]) => {
      let name;
      if (multi) {
        name = `${escapeName(baseName)}${escapeName(mimeType)}${baseNameSuffix}`;
      } else {
        name = `${escapeName(baseName)}${baseNameSuffix}`;
      }
      const schema = processModel(context.spec, name, media.schema, context.modelRegistry);
      first = first || schema;
      return [
        mimeType,
        {
          ...media,
          mimeType,
          schema,
        },
      ];
    }),
  );
  return { mediaTypes: subModels, schema: first }; // TODO support multi properly
};

export const processOperation = (
  context: Context,
  path: string,
  method: string,
  operation: OpenApiNode,
  defaultParameters?: OperationParameter[],
) => {
  const result: any = {
    ...operation,
    parameters: defaultParameters,
    name: '',
  };
  let name = operation.operationId;
  if (name == null) {
    name = `${method}-${path}`;
  }
  name = escapeName(name);
  result.name = name;

  if (operation.parameters) {
    result.parameters = processParameters(context, operation.parameters, name, false);
  }
  if (operation.requestBody) {
    const requestBody = resolveReference(context.spec, operation.requestBody);
    const { mediaTypes, schema } = processMediaTypes(context, name, 'RequestBody', operation.requestBody.content);
    result.requestBody = {
      ...requestBody,
      schema,
      content: mediaTypes,
    };
  }

  if (operation.responses) {
    const entries = Object.entries(operation.responses);
    const multi = entries.length > 1;
    result.responses = Object.fromEntries(
      entries.map(([statusCode, response]: any) => {
        const resolved = resolveReference(context.spec, response);
        const { mediaTypes, schema } = processMediaTypes(
          context,
          name,
          (multi ? statusCode : '') + 'ResponseBody',
          resolved.content,
        );
        return [
          statusCode,
          {
            ...resolved,
            schema,
            content: mediaTypes,
          },
        ];
      }),
    );
  }

  if (result.parameters) {
    const models = Object.fromEntries<ObjectModel>(
      PARAM_TYPES.map((type) => [
        type,
        {
          modelType: ModelType.OBJECT,
          name: `${name}${capitalize(type)}Params`,
          properties: [],
        },
      ]),
    );
    result.parameters.forEach((parameter: any) => {
      const model = models[parameter.in];
      if (model.properties) {
        model.properties.push({
          ...parameter.schema,
          propName: parameter.name,
        });
      }
    });
    Object.entries(models).forEach(([key, model]) => {
      if (model.properties && model.properties.length > 0) {
        context.modelRegistry.registerModel(model.name, model);
        result[`${key}Params`] = model;
      }
    });
  }

  return result;
};

const processParameters = (
  context: Context,
  parameters: OpenApiNode[],
  parentName: string,
  defaultParameters?: boolean,
) => {
  return parameters.map((param) => {
    const resolved = resolveReference(context.spec, param);
    const name = getParameterModelName(
      param,
      resolved.name,
      `${resolved.in}${defaultParameters ? 'Default' : ''}Param`,
      parentName,
      context.modelRegistry,
    );

    let mimeType;
    let schema;
    if (resolved.content) {
      // parameter.content must contains a single item
      const first = Object.entries(processMediaTypes(context, name, '', resolved.content).mediaTypes)[0];
      mimeType = first[0];
      schema = first[1];
    } else {
      schema = processModel(context.spec, name, resolved.schema, context.modelRegistry);
    }
    return {
      ...resolved,
      mimeType,
      schema,
    } as OperationParameter;
  });
};

interface Context {
  spec: OpenApiNode;
  modelRegistry: ModelRegistry;
}

export const processOperations = (spec: OpenApiNode, modelRegistry?: ModelRegistry) => {
  const context: Context = {
    spec,
    modelRegistry: modelRegistry || new ModelRegistry(),
  };

  const operations: Dict<Operation[]> = {};
  if (spec.paths != null) {
    Object.entries(spec.paths).forEach(([path, pathObject]: any) => {
      let defaultParameters: OperationParameter[];
      if (pathObject.parameters) {
        defaultParameters = processParameters(context, pathObject.parameters, escapeName(path), true);
      }

      METHODS.filter((m) => pathObject[m] != null).forEach((method) => {
        const operation = processOperation(context, path, method, pathObject[method], defaultParameters);
        operations[path] = operations[path] || [];
        operations[path].push({
          path,
          method,
          constantName: getConstantName(operation.name),
          // defaultParameters,
          ...operation,
        });
      });
    });
  }

  return operations;
};
