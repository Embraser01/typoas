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
      if (securityScheme.scheme === 'basic') {
        return createRuntimeRefType(
          ExportedRef.HttpBasicSecurityAuthentication,
        );
      } else if (securityScheme.scheme === 'bearer') {
        return createRuntimeRefType(
          ExportedRef.HttpBearerSecurityAuthentication,
        );
      }
      throw new Error(
        `Unsupported security scheme '${securityScheme.scheme}' in http security type`,
      );
    case 'oauth2':
      return createRuntimeRefType(ExportedRef.OAuth2SecurityAuthentication);
    case 'openIdConnect':
      return createRuntimeRefType(
        ExportedRef.OpenIdConnectSecurityAuthentication,
      );
    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
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
      if (securityScheme.scheme === 'basic') {
        return factory.createNewExpression(
          createRuntimeRefProperty(ExportedRef.HttpBasicSecurityAuthentication),
          undefined,
          [authProviderExpression],
        );
      }
      if (securityScheme.scheme === 'bearer') {
        return factory.createNewExpression(
          createRuntimeRefProperty(
            ExportedRef.HttpBearerSecurityAuthentication,
          ),
          undefined,
          [authProviderExpression],
        );
      }
      throw new Error('Unsupported security scheme in http security type');
    case 'oauth2':
      return factory.createNewExpression(
        createRuntimeRefProperty(ExportedRef.OAuth2SecurityAuthentication),
        undefined,
        [factory.createObjectLiteralExpression(args), authProviderExpression],
      );
    case 'openIdConnect':
      return factory.createNewExpression(
        createRuntimeRefProperty(
          ExportedRef.OpenIdConnectSecurityAuthentication,
        ),
        undefined,
        [factory.createObjectLiteralExpression(args), authProviderExpression],
      );
    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Unsupported security scheme '${securityScheme.type}'`);
  }
}
