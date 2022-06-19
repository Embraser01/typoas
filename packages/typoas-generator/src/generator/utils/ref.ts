import { Expression, factory, TypeNode } from 'typescript';
import { ReferenceObject, SchemaObject } from 'openapi3-ts';

export const IMPORT_RUNTIME = 'r';

export enum ExportedRef {
  HttpMethod = 'HttpMethod',
  Context = 'Context',
  ContextParams = 'ContextParams',
  TransformType = 'TransformType',
  CreateContextParams = 'CreateContextParams',
  ServerConfiguration = 'ServerConfiguration',
  RefResolver = 'RefResolver',
  AuthProvider = 'AuthProvider',
  BasicAuthConfig = 'BasicAuthConfig',
  BearerAuthConfig = 'BearerAuthConfig',
  BaseFlowConfig = 'BaseFlowConfig',
  SecurityAuthentication = 'SecurityAuthentication',
  ApiKeySecurityAuthentication = 'ApiKeySecurityAuthentication',
  HttpSecurityAuthentication = 'HttpSecurityAuthentication',
  OAuth2SecurityAuthentication = 'OAuth2SecurityAuthentication',
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
