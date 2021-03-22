import { Expression, factory, TypeNode } from 'typescript';

export const IMPORT_RUNTIME = 'runtime';

export enum ExportedRef {
  HttpMethod = 'HttpMethod',
  BaseServerConfiguration = 'BaseServerConfiguration',
  HttpLibrary = 'HttpLibrary',
  SchemaRefResolver = 'SchemaRefResolver',
  ApiException = 'ApiException',
  applyTemplating = 'applyTemplating',
  applyTransforms = 'applyTransforms',
  isCodeInRange = 'isCodeInRange',
}

export function createRuntimeRefProperty(exportedRef: ExportedRef): Expression {
  return factory.createPropertyAccessExpression(
    factory.createIdentifier(IMPORT_RUNTIME),
    exportedRef,
  );
}

export function createRuntimeRefType(exportedRef: ExportedRef): TypeNode {
  return factory.createTypeReferenceNode(
    factory.createQualifiedName(
      factory.createIdentifier(IMPORT_RUNTIME),
      factory.createIdentifier(exportedRef),
    ),
  );
}
