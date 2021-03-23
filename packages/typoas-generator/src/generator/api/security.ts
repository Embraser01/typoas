import { Context } from '../../context';
import { ReferenceObject, SecuritySchemeObject } from 'openapi3-ts';
import { factory, Statement, SyntaxKind } from 'typescript';
import { createRuntimeRefType, ExportedRef } from '../utils/ref';
import {
  createConfigTypeFromSecurityScheme,
  createMapTypeFromSecurityScheme,
  createRuntimeSecurityClassFromSecurityScheme,
} from '../components/security-scheme';

export const AUTH_TYPE_NAME = 'AuthMethods';
export const AUTH_CONFIGURE_METHOD = 'configureAuthMethods';

export function createAuthMethodsFactory(
  securitySchemes: Record<string, SecuritySchemeObject | ReferenceObject>,
  ctx: Context,
): Statement[] {
  if (!Object.keys(securitySchemes).length) return [];
  return [
    factory.createTypeAliasDeclaration(
      undefined,
      undefined,
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
    ),
    factory.createFunctionDeclaration(
      undefined,
      undefined,
      undefined,
      AUTH_CONFIGURE_METHOD,
      undefined,
      [
        factory.createParameterDeclaration(
          undefined,
          undefined,
          undefined,
          'config',
          undefined,
          factory.createTypeReferenceNode(
            factory.createIdentifier(AUTH_TYPE_NAME),
          ),
        ),
      ],
      createMapTypeFromSecurityScheme(securitySchemes),
      factory.createBlock([
        factory.createReturnStatement(
          factory.createObjectLiteralExpression(
            Object.entries(securitySchemes).map(([key, sec]) =>
              factory.createPropertyAssignment(
                key,
                createRuntimeSecurityClassFromSecurityScheme(sec, key, ctx),
              ),
            ),
            true,
          ),
        ),
      ]),
    ),
  ];
}
