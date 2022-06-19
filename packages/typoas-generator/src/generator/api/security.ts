import { Context } from '../../context';
import { ReferenceObject, SecuritySchemeObject } from 'openapi3-ts';
import {
  factory,
  FunctionDeclaration,
  SyntaxKind,
  TypeAliasDeclaration,
} from 'typescript';
import { createRuntimeRefType, ExportedRef } from '../utils/ref';
import { createConfigTypeFromSecurityScheme } from '../components/security-scheme';
import { hasUnsupportedIdentifierChar } from '../utils/operation-name';

export const AUTH_TYPE_NAME = 'AuthMethods';

export function createAuthMethodsType(
  securitySchemes: Record<string, SecuritySchemeObject | ReferenceObject>,
  ctx: Context,
): TypeAliasDeclaration {
  return factory.createTypeAliasDeclaration(
    undefined,
    [factory.createModifier(SyntaxKind.ExportKeyword)],
    AUTH_TYPE_NAME,
    undefined,
    factory.createTypeLiteralNode(
      Object.entries(securitySchemes).map(([name, sec]) =>
        factory.createPropertySignature(
          undefined,
          name,
          factory.createToken(SyntaxKind.QuestionToken),
          createRuntimeRefType(ExportedRef.AuthProvider, [
            createConfigTypeFromSecurityScheme(sec, ctx),
          ]),
        ),
      ),
    ),
  );
}

export function createConfigureAuthFunction(
  securitySchemes: Record<string, SecuritySchemeObject | ReferenceObject>,
  ctx: Context,
): FunctionDeclaration {
  return factory.createFunctionDeclaration(
    undefined,
    [factory.createModifier(SyntaxKind.ExportKeyword)],
    undefined,
    'configureAuth',
    undefined,
    [
      factory.createParameterDeclaration(
        undefined,
        undefined,
        undefined,
        factory.createIdentifier('params'),
        factory.createToken(SyntaxKind.QuestionToken),
        factory.createIndexedAccessTypeNode(
          createRuntimeRefType(ExportedRef.CreateContextParams, [
            factory.createTypeReferenceNode(
              factory.createIdentifier(AUTH_TYPE_NAME),
            ),
          ]),
          factory.createLiteralTypeNode(
            factory.createStringLiteral('authProviders'),
          ),
        ),
      ),
    ],
    factory.createTypeReferenceNode(factory.createIdentifier('Partial'), [
      factory.createTypeReferenceNode(AUTH_TYPE_NAME),
    ]),
    factory.createBlock(
      [
        factory.createReturnStatement(
          factory.createObjectLiteralExpression(
            Object.entries(securitySchemes).map(([name, sec]) => {
              return factory.createPropertyAssignment(
                hasUnsupportedIdentifierChar(name)
                  ? factory.createStringLiteral(name, true)
                  : factory.createIdentifier(name),
                factory.createLogicalAnd(
                  factory.createPropertyAccessChain(
                    factory.createIdentifier('params'),
                    factory.createToken(SyntaxKind.QuestionDotToken),
                    factory.createIdentifier(name),
                  ),
                  // TODO Generate security schema
                  factory.createNewExpression(
                    factory.createIdentifier('HttpSecurityAuthentication'),
                    undefined,
                    [
                      factory.createObjectLiteralExpression(
                        [
                          factory.createPropertyAssignment(
                            factory.createIdentifier('scheme'),
                            factory.createStringLiteral('bearer'),
                          ),
                          factory.createPropertyAssignment(
                            factory.createIdentifier('bearerFormat'),
                            factory.createStringLiteral(''),
                          ),
                        ],
                        false,
                      ),
                      factory.createPropertyAccessExpression(
                        factory.createIdentifier('params'),
                        factory.createIdentifier('jwt'),
                      ),
                    ],
                  ),
                ),
              );
            }),
          ),
        ),
      ],
      true,
    ),
  );
}
