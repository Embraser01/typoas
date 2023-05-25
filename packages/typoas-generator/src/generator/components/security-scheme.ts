import {
  Expression,
  factory,
  NewExpression,
  ObjectLiteralElementLike,
  TypeNode,
} from 'typescript';
import { Context } from '../../context';
import {
  isReferenceObject,
  ReferenceObject,
  SecuritySchemeObject,
} from 'openapi3-ts/oas31';
import {
  createRuntimeRefProperty,
  createRuntimeRefType,
  ExportedRef,
} from '../utils/ref';

export function createConfigTypeFromSecurityScheme(
  securitySchemeOrRef: SecuritySchemeObject | ReferenceObject,
  ctx: Context,
): TypeNode {
  let securityScheme = securitySchemeOrRef as SecuritySchemeObject;
  if (isReferenceObject(securitySchemeOrRef)) {
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
      return createRuntimeRefType(ExportedRef.ApiKeySecurityAuthentication);
    case 'http':
      return createRuntimeRefType(ExportedRef.HttpSecurityAuthentication);
    case 'oauth2':
      return createRuntimeRefType(ExportedRef.OAuth2SecurityAuthentication);
    case 'openIdConnect':
      throw new Error(`Unsupported security scheme '${securityScheme.type}'`);
  }
}

export function createRuntimeSecurityClass(
  securitySchemeOrRef: SecuritySchemeObject | ReferenceObject,
  authProviderExpression: Expression,
  ctx: Context,
): NewExpression {
  let securityScheme = securitySchemeOrRef as SecuritySchemeObject;
  if (isReferenceObject(securitySchemeOrRef)) {
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
            'in',
            factory.createStringLiteral(securityScheme.in, true),
          ),
        );
      }
      return factory.createNewExpression(
        createRuntimeRefProperty(ExportedRef.ApiKeySecurityAuthentication),
        undefined,
        [factory.createObjectLiteralExpression(args), authProviderExpression],
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
        [factory.createObjectLiteralExpression(args), authProviderExpression],
      );
    case 'oauth2':
      return factory.createNewExpression(
        createRuntimeRefProperty(ExportedRef.OAuth2SecurityAuthentication),
        undefined,
        [factory.createObjectLiteralExpression(args), authProviderExpression],
      );
    case 'openIdConnect':
      throw new Error(`Unsupported security scheme '${securityScheme.type}'`);
  }
}
