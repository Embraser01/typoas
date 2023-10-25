import { isReferenceObject, OperationObject } from 'openapi3-ts/oas31';
import {
  factory,
  ParameterDeclaration,
  PropertySignature,
  SyntaxKind,
  TypeReferenceNode,
} from 'typescript';
import { isEqual, uniqWith } from 'lodash';
import { Context } from '../../../context';
import {
  createRuntimeRefType,
  ExportedRef,
  FETCHER_DATA_NAME,
} from '../../utils/ref';
import {
  createSchemaTypeFromParameters,
  getParameterName,
  isParameterRequired,
} from '../../components/parameters';
import { isInvalidES6IdentifierName } from '../../utils/operation-name';
import { createSchemaTypeFromRequestBody } from '../../components/request-bodies';
import { GlobalParameters } from './types';
import { createSchemaTypeFromResponse } from '../../components/responses';
import { getSuccessResponses } from './response-processor';
import { AUTH_TYPE_NAME } from '../security';
import { getContentTypeSchema } from '../../utils/content-type';

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
      'ctx',
      undefined,
      createRuntimeRefType(ExportedRef.Context, [
        factory.createTypeReferenceNode(AUTH_TYPE_NAME),
        ...(ctx.hasFetcherOptions()
          ? [factory.createTypeReferenceNode(FETCHER_DATA_NAME)]
          : []),
      ]),
    ),
    factory.createParameterDeclaration(
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
              isInvalidES6IdentifierName(name)
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
        'body',
        undefined,
        createSchemaTypeFromRequestBody(operation.requestBody, ctx),
      ),
    );
  }

  if (ctx.hasFetcherOptions()) {
    parameters.push(
      factory.createParameterDeclaration(
        undefined,
        undefined,
        'opts',
        factory.createToken(SyntaxKind.QuestionToken),
        factory.createTypeReferenceNode(FETCHER_DATA_NAME),
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
    if (isReferenceObject(a) && isReferenceObject(b) && a.$ref === b.$ref) {
      return true;
    }
    if (isReferenceObject(a) || isReferenceObject(b)) {
      return false;
    }
    return isEqual(
      getContentTypeSchema(a.content, ctx),
      getContentTypeSchema(b.content, ctx),
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
