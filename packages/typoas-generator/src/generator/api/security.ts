import { Context } from '../../context';
import { ReferenceObject, SecuritySchemeObject } from 'openapi3-ts';
import { factory, SyntaxKind, TypeAliasDeclaration } from 'typescript';
import { createRuntimeRefType, ExportedRef } from '../utils/ref';
import { createConfigTypeFromSecurityScheme } from '../components/security-scheme';

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
