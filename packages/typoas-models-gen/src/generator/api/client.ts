import { Context } from '../../context';
import { OpenAPIObject, PathItemObject } from 'openapi3-ts';
import { ClassDeclaration, factory, SyntaxKind } from 'typescript';
import { createOperation } from './operation';
import { createRuntimeRefType, ExportedRef } from '../utils/ref';

export function createClient(
  specs: OpenAPIObject,
  name: string,
  ctx: Context,
): ClassDeclaration {
  return factory.createClassDeclaration(
    undefined,
    undefined,
    name,
    undefined,
    undefined,
    [
      factory.createConstructorDeclaration(
        undefined,
        undefined,
        [
          factory.createParameterDeclaration(
            undefined,
            [factory.createModifier(SyntaxKind.PrivateKeyword)],
            undefined,
            'server',
            undefined,
            createRuntimeRefType(ExportedRef.BaseServerConfiguration),
          ),
          factory.createParameterDeclaration(
            undefined,
            [factory.createModifier(SyntaxKind.PrivateKeyword)],
            undefined,
            'http',
            undefined,
            createRuntimeRefType(ExportedRef.HttpLibrary),
          ),
          factory.createParameterDeclaration(
            undefined,
            [factory.createModifier(SyntaxKind.PrivateKeyword)],
            undefined,
            'resolver',
            undefined,
            createRuntimeRefType(ExportedRef.SchemaRefResolver),
          ),
        ],
        factory.createBlock([]),
      ),
      ...Object.entries(
        specs.paths,
      ).flatMap(([p, item]: [string, PathItemObject]) =>
        Object.entries(item).map(([method, op]) =>
          createOperation(op, p, method, ctx),
        ),
      ),
    ],
  );
}
