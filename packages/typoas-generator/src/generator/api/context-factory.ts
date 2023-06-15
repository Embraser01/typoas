import { Context } from '../../context';
import { OpenAPIObject } from 'openapi3-ts/oas31';
import { Block, factory, FunctionDeclaration, SyntaxKind } from 'typescript';
import {
  createRuntimeRefProperty,
  createRuntimeRefType,
  ExportedRef,
  FETCHER_DATA_NAME,
} from '../utils/ref';
import { AUTH_TYPE_NAME } from './security';

export function createContextFactory(
  specs: OpenAPIObject,
  ctx: Context,
): FunctionDeclaration {
  return factory.createFunctionDeclaration(
    [factory.createModifier(SyntaxKind.ExportKeyword)],
    undefined,
    'createContext',
    ctx.hasFetcherOptions()
      ? [factory.createTypeParameterDeclaration(undefined, FETCHER_DATA_NAME)]
      : undefined,
    [
      factory.createParameterDeclaration(
        undefined,
        undefined,
        'params',
        factory.createToken(SyntaxKind.QuestionToken),
        createRuntimeRefType(ExportedRef.CreateContextParams, [
          factory.createTypeReferenceNode(AUTH_TYPE_NAME),
          ...(ctx.hasFetcherOptions()
            ? [factory.createTypeReferenceNode(FETCHER_DATA_NAME)]
            : []),
        ]),
      ),
    ],
    createRuntimeRefType(ExportedRef.Context, [
      factory.createTypeReferenceNode(AUTH_TYPE_NAME),
      ...(ctx.hasFetcherOptions()
        ? [factory.createTypeReferenceNode(FETCHER_DATA_NAME)]
        : []),
    ]),
    createContextFactoryBody(specs, ctx),
  );
}

export function createContextFactoryBody(
  specs: OpenAPIObject,
  ctx: Context,
): Block {
  return factory.createBlock([
    factory.createReturnStatement(
      factory.createNewExpression(
        createRuntimeRefProperty(ExportedRef.Context),
        [
          factory.createTypeReferenceNode(AUTH_TYPE_NAME),
          ...(ctx.hasFetcherOptions()
            ? [factory.createTypeReferenceNode(FETCHER_DATA_NAME)]
            : []),
        ],
        [
          factory.createObjectLiteralExpression(
            [
              factory.createPropertyAssignment(
                factory.createIdentifier('serverConfiguration'),
                factory.createNewExpression(
                  createRuntimeRefProperty(ExportedRef.ServerConfiguration),
                  [],
                  [
                    factory.createStringLiteral(
                      specs.servers?.[0].url || '',
                      true,
                    ),
                    factory.createObjectLiteralExpression(),
                  ],
                ),
              ),
              factory.createPropertyAssignment(
                factory.createIdentifier('authMethods'),
                Object.keys(specs.components?.securitySchemes || {}).length
                  ? factory.createCallExpression(
                      factory.createIdentifier('configureAuth'),
                      [],
                      [
                        factory.createPropertyAccessChain(
                          factory.createIdentifier('params'),
                          factory.createToken(SyntaxKind.QuestionDotToken),
                          factory.createIdentifier('authProviders'),
                        ),
                      ],
                    )
                  : factory.createObjectLiteralExpression(),
              ),
              factory.createSpreadAssignment(
                factory.createIdentifier('params'),
              ),
            ],
            true,
          ),
        ],
      ),
    ),
  ]);
}
