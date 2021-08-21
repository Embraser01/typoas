import { Expression, factory, TypeNode } from 'typescript';

export const IMPORT_RUNTIME = 'r';

export enum ExportedRef {
  HttpMethod = 'HttpMethod',
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
  isCodeInRange = 'isCodeInRange',
  serializeParameter = 'serializeParameter',
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

export function createJSONParseWrapper(data: unknown): Expression {
  return factory.createCallExpression(
    factory.createPropertyAccessExpression(
      factory.createIdentifier('JSON'),
      'parse',
    ),
    undefined,
    [factory.createStringLiteral(JSON.stringify(data), true)],
  );
}
