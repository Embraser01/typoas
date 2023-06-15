import { Expression, factory, TypeNode } from 'typescript';

export const IMPORT_RUNTIME = 'r';

export const FETCHER_DATA_NAME = 'FetcherData';

export enum ExportedRef {
  HttpMethod = 'HttpMethod',
  Context = 'Context',
  CreateContextParams = 'CreateContextParams',
  ServerConfiguration = 'ServerConfiguration',
  TransformField = 'TransformField',
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
