import { Expression, factory, TypeNode } from 'typescript';

export const IMPORT_RUNTIME = 'r';

export enum ExportedRef {
  HttpMethod = 'HttpMethod',
  Context = 'Context',
  TransformType = 'TransformType',
  CreateContextParams = 'CreateContextParams',
  ServerConfiguration = 'ServerConfiguration',
  RefResolver = 'RefResolver',
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
