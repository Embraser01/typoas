import { OperationObject, ResponseObject } from 'openapi3-ts';
import {
  factory,
  ParameterDeclaration,
  PropertySignature,
  SyntaxKind,
  TypeReferenceNode,
} from 'typescript';
import { isEqual, uniqWith } from 'lodash';
import { Context } from '../../../context';
import { createRuntimeRefType, ExportedRef } from '../../utils/ref';
import {
  createSchemaTypeFromParameters,
  getParameterName,
  isParameterRequired,
} from '../../components/parameters';
import { hasUnsupportedIdentifierChar } from '../../utils/operation-name';
import { createSchemaTypeFromRequestBody } from '../../components/request-bodies';
import { GlobalParameters } from './types';
import { createSchemaTypeFromResponse } from '../../components/responses';
import { getSuccessResponses } from './response-processor';
import { AUTH_TYPE_NAME } from '../security';

export function createOperationDeclaration(
  operation: OperationObject,
  ctx: Context,
  { baseParameters }: GlobalParameters,
): ParameterDeclaration[] {
  const usedParams = new Set<string>();
  const parameters: ParameterDeclaration[] = [
    factory.createParameterDeclaration(
      undefined,
      undefined,
      undefined,
      'ctx',
      undefined,
      createRuntimeRefType(ExportedRef.Context, [
        factory.createTypeReferenceNode(
          factory.createIdentifier(AUTH_TYPE_NAME),
        ),
      ]),
    ),
    factory.createParameterDeclaration(
      undefined,
      undefined,
      undefined,
      'params',
      undefined,
      factory.createTypeLiteralNode(
        [...(operation.parameters || []), ...baseParameters]
          .map((p) => {
            const name = getParameterName(p, ctx);
            if (usedParams.has(name)) {
              return null;
            }
            usedParams.add(name);

            return factory.createPropertySignature(
              undefined,
              hasUnsupportedIdentifierChar(name)
                ? factory.createStringLiteral(name, true)
                : factory.createIdentifier(name),
              isParameterRequired(p, ctx)
                ? undefined
                : factory.createToken(SyntaxKind.QuestionToken),
              createSchemaTypeFromParameters(p, ctx),
            );
          })
          .filter((node): node is PropertySignature => node !== null),
      ),
    ),
  ];

  if (operation.requestBody) {
    parameters.push(
      factory.createParameterDeclaration(
        undefined,
        undefined,
        undefined,
        'body',
        undefined,
        createSchemaTypeFromRequestBody(operation.requestBody, ctx),
      ),
    );
  }

  return parameters;
}

export function createOperationReturnType(
  operation: OperationObject,
  ctx: Context,
): TypeReferenceNode {
  const responses = uniqWith(getSuccessResponses(operation), (a, b) => {
    if (a.$ref && b.$ref && a.$ref === b.$ref) {
      return true;
    }
    if (a.$ref || b.$ref) {
      return false;
    }
    return isEqual(
      (a as ResponseObject).content?.['application/json'].schema,
      (b as ResponseObject).content?.['application/json'].schema,
    );
  });

  const node = ctx.generateAnyInsteadOfUnknown()
    ? factory.createKeywordTypeNode(SyntaxKind.AnyKeyword)
    : factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword);

  return factory.createTypeReferenceNode(factory.createIdentifier('Promise'), [
    !responses.length
      ? node
      : factory.createUnionTypeNode(
          responses.map((r) => createSchemaTypeFromResponse(r, ctx)),
        ),
  ]);
}
