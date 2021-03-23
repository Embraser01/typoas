import {
  Expression,
  factory,
  ObjectLiteralElementLike,
  SyntaxKind,
  TypeNode,
} from 'typescript';
import { Context } from '../../context';
import { ReferenceObject, SecuritySchemeObject } from 'openapi3-ts';
import {
  createRuntimeRefProperty,
  createRuntimeRefType,
  ExportedRef,
} from '../utils/ref';
import { hasUnsupportedIdentifierChar } from '../utils/operation-name';

export function createConfigTypeFromSecurityScheme(
  securitySchemeOrRef: SecuritySchemeObject | ReferenceObject,
  ctx: Context,
): TypeNode {
  let securityScheme = securitySchemeOrRef as SecuritySchemeObject;
  if (securitySchemeOrRef.$ref) {
    const ref = ctx.resolveReference(
      'securitySchemes',
      securitySchemeOrRef.$ref,
    );
    if (!ref) {
      throw new Error(`$ref '${securitySchemeOrRef.$ref}' wasn't found`);
    }
    securityScheme = ref.spec;
  }

  switch (securityScheme.type) {
    case 'apiKey':
      return factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
    case 'http':
      return factory.createUnionTypeNode([
        createRuntimeRefType(ExportedRef.BasicAuthConfig),
        createRuntimeRefType(ExportedRef.BearerAuthConfig),
      ]);
    case 'oauth2':
    case 'openIdConnect':
      throw new Error(`Unsupported security scheme '${securityScheme.type}'`);
  }
}

export function createRuntimeSecurityClassFromSecurityScheme(
  securitySchemeOrRef: SecuritySchemeObject | ReferenceObject,
  name: string,
  ctx: Context,
): Expression {
  let securityScheme = securitySchemeOrRef as SecuritySchemeObject;
  if (securitySchemeOrRef.$ref) {
    const ref = ctx.resolveReference(
      'securitySchemes',
      securitySchemeOrRef.$ref,
    );
    if (!ref) {
      throw new Error(`$ref '${securitySchemeOrRef.$ref}' wasn't found`);
    }
    securityScheme = ref.spec;
  }

  const args: ObjectLiteralElementLike[] = [];

  switch (securityScheme.type) {
    case 'apiKey':
      if (securityScheme.name) {
        args.push(
          factory.createPropertyAssignment(
            'name',
            factory.createStringLiteral(securityScheme.name, true),
          ),
        );
      }
      if (securityScheme.in) {
        args.push(
          factory.createPropertyAssignment(
            'name',
            factory.createStringLiteral(securityScheme.in, true),
          ),
        );
      }
      return factory.createNewExpression(
        createRuntimeRefProperty(ExportedRef.ApiKeySecurityAuthentication),
        undefined,
        [
          // Arg
          factory.createObjectLiteralExpression(args),
          factory.createPropertyAccessExpression(
            factory.createIdentifier('config'),
            name,
          ),
        ],
      );
    case 'http':
      if (securityScheme.scheme) {
        args.push(
          factory.createPropertyAssignment(
            'scheme',
            factory.createStringLiteral(securityScheme.scheme, true),
          ),
        );
      }
      if (securityScheme.bearerFormat) {
        args.push(
          factory.createPropertyAssignment(
            'bearerFormat',
            factory.createStringLiteral(securityScheme.bearerFormat, true),
          ),
        );
      }
      return factory.createNewExpression(
        createRuntimeRefProperty(ExportedRef.HttpSecurityAuthentication),
        undefined,
        [
          // Arg
          factory.createObjectLiteralExpression(args),
          factory.createPropertyAccessExpression(
            factory.createIdentifier('config'),
            name,
          ),
        ],
      );
    case 'oauth2':
    case 'openIdConnect':
      throw new Error(`Unsupported security scheme '${securityScheme.type}'`);
  }
}

export function createMapTypeFromSecurityScheme(
  securitySchemes: Record<string, SecuritySchemeObject | ReferenceObject>,
): TypeNode {
  return factory.createTypeLiteralNode(
    Object.keys(securitySchemes).map((name) =>
      factory.createPropertySignature(
        undefined,
        hasUnsupportedIdentifierChar(name)
          ? factory.createStringLiteral(name, true)
          : factory.createIdentifier(name),
        undefined,
        createRuntimeRefType(ExportedRef.SecurityAuthentication),
      ),
    ),
  );
}
