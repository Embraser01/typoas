import { Expression, factory, TypeNode } from 'typescript';
import { ReferenceObject, SchemaObject } from 'openapi3-ts';

export const IMPORT_RUNTIME = 'r';

export enum ExportedRef {
  HttpMethod = 'HttpMethod',
  Context = 'Context',
  BaseServerConfiguration = 'BaseServerConfiguration',
  HttpLibrary = 'HttpLibrary',
  RefResolver = 'RefResolver',
  IsomorphicFetchHttpLibrary = 'IsomorphicFetchHttpLibrary',
  SchemaRefResolver = 'SchemaRefResolver',
  ApiException = 'ApiException',
  AuthProvider = 'AuthProvider',
  BasicAuthConfig = 'BasicAuthConfig',
  BearerAuthConfig = 'BearerAuthConfig',
  BaseFlowConfig = 'BaseFlowConfig',
  SecurityAuthentication = 'SecurityAuthentication',
  ApiKeySecurityAuthentication = 'ApiKeySecurityAuthentication',
  HttpSecurityAuthentication = 'HttpSecurityAuthentication',
  OAuth2SecurityAuthentication = 'OAuth2SecurityAuthentication',
  applyTemplating = 'applyTemplating',
  applyTransforms = 'applyTransforms',
  handleResponse = 'handleResponse',
  isCodeInRange = 'isCodeInRange',
  serializeParameter = 'serializeParameter',
  serializeHeader = 'serializeHeader',
}

export function createRuntimeRefProperty(exportedRef: ExportedRef): Expression {
  return factory.createPropertyAccessExpression(
    factory.createIdentifier(IMPORT_RUNTIME),
    exportedRef,
  );
}

export function createRuntimeRefType(
  exportedRef: ExportedRef,
  typeArguments?: readonly TypeNode[],
): TypeNode {
  return factory.createTypeReferenceNode(
    factory.createQualifiedName(
      factory.createIdentifier(IMPORT_RUNTIME),
      factory.createIdentifier(exportedRef),
    ),
    typeArguments,
  );
}

const NEEDED_PROPERTIES = [
  '$ref',
  'type',
  'format',
  'items',
  'properties',
  'additionalProperties',
  'oneOf',
  'anyOf',
  'allOf',
];

/**
 * Remove any none necessary properties of
 * a JSON schema
 */
export function filterSchema(
  _schema: SchemaObject | ReferenceObject,
): SchemaObject | ReferenceObject {
  const schema = JSON.parse(JSON.stringify(_schema));

  const filter = (subSchema: SchemaObject) => {
    if (!subSchema || typeof subSchema !== 'object') {
      return subSchema;
    }
    for (const [k, v] of Object.entries(subSchema)) {
      if (!NEEDED_PROPERTIES.includes(k)) {
        delete subSchema[k];
      } else if (k === 'properties') {
        for (const propK of Object.keys(v)) {
          v[propK] = filter(v[propK]);
        }
      } else if (k === 'additionalProperties' && v !== true) {
        subSchema[k] = filter(v);
      } else if (['oneOf', 'anyOf', 'allOf'].includes(k)) {
        subSchema[k] = v.map((s: SchemaObject) => filter(s));
      }
    }
    return subSchema;
  };
  return filter(schema);
}

export function createJSONParseWrapper<T extends { [K in keyof T]: T[K] }>(
  data: T,
): Expression {
  if (Object.keys(data).length === 0) {
    return factory.createObjectLiteralExpression([], false);
  }
  return factory.createCallExpression(
    factory.createPropertyAccessExpression(
      factory.createIdentifier('JSON'),
      'parse',
    ),
    undefined,
    [factory.createStringLiteral(JSON.stringify(data), true)],
  );
}
