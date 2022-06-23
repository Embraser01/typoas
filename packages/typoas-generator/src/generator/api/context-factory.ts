import { Context } from '../../context';
import { OpenAPIObject } from 'openapi3-ts';
import { Block, factory, FunctionDeclaration, SyntaxKind } from 'typescript';
import {
  createRuntimeRefProperty,
  createRuntimeRefType,
  ExportedRef,
} from '../utils/ref';
import { AUTH_TYPE_NAME } from './security';
import { createAllSchemaTransforms } from '../utils/transformers';

export function createContextFactory(
  specs: OpenAPIObject,
  ctx: Context,
): FunctionDeclaration {
  return factory.createFunctionDeclaration(
    undefined,
    [factory.createModifier(SyntaxKind.ExportKeyword)],
    undefined,
    'createContext',
    undefined,
    [
      factory.createParameterDeclaration(
        undefined,
        undefined,
        undefined,
        'params',
        factory.createToken(SyntaxKind.QuestionToken),
        createRuntimeRefType(ExportedRef.CreateContextParams, [
          factory.createTypeReferenceNode(
            factory.createIdentifier(AUTH_TYPE_NAME),
          ),
        ]),
      ),
    ],
    createRuntimeRefType(ExportedRef.Context, [
      factory.createTypeReferenceNode(factory.createIdentifier(AUTH_TYPE_NAME)),
    ]),
    createContextFactoryBody(specs, ctx),
  );
}

export function createContextFactoryBody(
  specs: OpenAPIObject,
  ctx: Context,
): Block {
  const schemasExpression = createAllSchemaTransforms(
    specs.components?.schemas || {},
    ctx,
  );

  return factory.createBlock([
    factory.createReturnStatement(
      factory.createNewExpression(
        createRuntimeRefProperty(ExportedRef.Context),
        [
          factory.createTypeReferenceNode(
            factory.createIdentifier(AUTH_TYPE_NAME),
          ),
        ],
        [
          factory.createObjectLiteralExpression(
            [
              factory.createPropertyAssignment(
                factory.createIdentifier('resolver'),
                factory.createNewExpression(
                  createRuntimeRefProperty(ExportedRef.RefResolver),
                  [],
                  [schemasExpression],
                ),
              ),
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
