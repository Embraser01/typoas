import { Context } from '../../context';
import { OpenAPIObject, PathItemObject } from 'openapi3-ts';
import {
  ClassDeclaration,
  ClassElement,
  factory,
  Statement,
  SyntaxKind,
} from 'typescript';
import { addJSDocToNode } from '../comments/fields';
import { getJSDocFromOperation } from '../comments/operation';
import { createOperation } from './operation';
import {
  createJSONParseWrapper,
  createRuntimeRefProperty,
  createRuntimeRefType,
  ExportedRef,
  filterSchema,
} from '../utils/ref';
import { AUTH_CONFIGURE_METHOD, AUTH_TYPE_NAME } from './security';
import { createMapTypeFromSecurityScheme } from '../components/security-scheme';

const HTTP_METHOD = new Set([
  'get',
  'post',
  'options',
  'head',
  'trace',
  'patch',
  'put',
  'delete',
]);

export function createClient(
  specs: OpenAPIObject,
  name: string,
  ctx: Context,
): ClassDeclaration {
  const constructorStmts: Statement[] = [];
  const parameters = [
    factory.createParameterDeclaration(
      undefined,
      [factory.createModifier(SyntaxKind.PrivateKeyword)],
      undefined,
      'server',
      undefined,
      createRuntimeRefType(ExportedRef.BaseServerConfiguration),
    ),
  ];

  if (specs.components?.securitySchemes) {
    parameters.push(
      factory.createParameterDeclaration(
        undefined,
        undefined,
        undefined,
        'authMethodConfig',
        undefined,
        factory.createTypeReferenceNode(
          factory.createIdentifier(AUTH_TYPE_NAME),
        ),
      ),
    );
    constructorStmts.push(
      factory.createExpressionStatement(
        factory.createAssignment(
          factory.createPropertyAccessExpression(
            factory.createThis(),
            'authMethods',
          ),
          factory.createCallExpression(
            factory.createIdentifier(AUTH_CONFIGURE_METHOD),
            undefined,
            [factory.createIdentifier('authMethodConfig')],
          ),
        ),
      ),
    );
  }

  parameters.push(
    factory.createParameterDeclaration(
      undefined,
      [factory.createModifier(SyntaxKind.PrivateKeyword)],
      undefined,
      'http',
      undefined,
      createRuntimeRefType(ExportedRef.HttpLibrary),
      factory.createNewExpression(
        createRuntimeRefProperty(ExportedRef.IsomorphicFetchHttpLibrary),
        undefined,
        undefined,
      ),
    ),
    factory.createParameterDeclaration(
      undefined,
      [factory.createModifier(SyntaxKind.PrivateKeyword)],
      undefined,
      'resolver',
      undefined,
      createRuntimeRefType(ExportedRef.SchemaRefResolver),
      factory.createNewExpression(
        createRuntimeRefProperty(ExportedRef.RefResolver),
        undefined,
        [
          createJSONParseWrapper(
            Object.fromEntries(
              Object.entries(specs.components?.schemas || {}).map(([k, v]) => [
                k,
                filterSchema(v),
              ]),
            ),
          ),
        ],
      ),
    ),
  );

  const members: ClassElement[] = [
    factory.createConstructorDeclaration(
      undefined,
      undefined,
      parameters,
      factory.createBlock(constructorStmts),
    ),
  ];

  if (specs.components?.securitySchemes) {
    // Add declarations at the start of the class declaration
    members.unshift(
      factory.createPropertyDeclaration(
        undefined,
        [factory.createToken(SyntaxKind.PrivateKeyword)],
        'authMethods',
        undefined,
        createMapTypeFromSecurityScheme(specs.components.securitySchemes),
        undefined,
      ),
    );
  }
  members.push(
    ...Object.entries(specs.paths).flatMap(
      ([p, item]: [string, PathItemObject]) => {
        const baseParameters = item.parameters || [];
        const ops = Object.entries(item).filter(([method]) =>
          HTTP_METHOD.has(method),
        );

        return ops.map(([method, op]) => {
          const opMethod = createOperation(op, p, method, ctx, {
            baseParameters,
            defaultSecurityRequirements: specs.security,
          });
          if (ctx.hasJSDoc()) {
            addJSDocToNode(opMethod, getJSDocFromOperation(op));
          }
          return opMethod;
        });
      },
    ),
  );

  return factory.createClassDeclaration(
    undefined,
    [factory.createModifier(SyntaxKind.ExportKeyword)],
    name,
    undefined,
    undefined,
    members,
  );
}
