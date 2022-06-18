import { Context } from '../../context';
import {
  createSchemaTypeFromParameters,
  getParameterName,
  isParameterRequired,
} from '../components/parameters';
import { createSchemaTypeFromRequestBody } from '../components/request-bodies';
import { createSchemaTypeFromResponse } from '../components/responses';
import {
  OperationObject,
  ParameterObject,
  ReferenceObject,
  SecurityRequirementObject,
} from 'openapi3-ts';
import {
  Block,
  factory,
  FunctionDeclaration,
  NodeFlags,
  ParameterDeclaration,
  PropertySignature,
  Statement,
  SyntaxKind,
} from 'typescript';
import {
  createResponseStatements,
  DEFAULT_RESPONSE,
  getSuccessResponse,
} from './response-processor';
import {
  createParameterStatements,
  getQueryParams,
} from './request-preparation';
import {
  createJSONParseWrapper,
  createRuntimeRefProperty,
  createRuntimeRefType,
  ExportedRef,
} from '../utils/ref';
import {
  hasUnsupportedIdentifierChar,
  sanitizeOperationIdName,
} from '../utils/operation-name';

export type GlobalParameters = {
  baseParameters: (ParameterObject | ReferenceObject)[];
  defaultSecurityRequirements?: SecurityRequirementObject[];
};

export function createOperation(
  operation: OperationObject,
  path: string,
  method: string,
  ctx: Context,
  { baseParameters, defaultSecurityRequirements }: GlobalParameters,
): FunctionDeclaration {
  // For each operation a function with:
  //   - (params): (ctx), (object parameters), (body if present), (options?)
  //   - (return): (response body)
  //
  //   - Create request with
  //     - method
  //     - path
  //     - params
  //     - body if needed
  //     - headers if needed
  //     - auth
  //     - queryParams if needed
  //
  //   - Send request
  //   - Handle response
  //     - res
  //     - handlers (per status code)
  //       - success one
  //       - transforms to compute
  const resp = getSuccessResponse(operation);

  const usedParams = new Set<string>();
  const parameters: ParameterDeclaration[] = [
    factory.createParameterDeclaration(
      undefined,
      undefined,
      undefined,
      'ctx',
      undefined,
      createRuntimeRefType(ExportedRef.Context),
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

  return factory.createFunctionDeclaration(
    undefined,
    [factory.createModifier(SyntaxKind.AsyncKeyword)],
    undefined,
    sanitizeOperationIdName(operation.operationId || `${path}/${method}`),
    undefined,
    parameters,
    factory.createTypeReferenceNode(factory.createIdentifier('Promise'), [
      resp
        ? createSchemaTypeFromResponse(resp, ctx)
        : factory.createKeywordTypeNode(SyntaxKind.AnyKeyword),
    ]),
    createOperationBodyFunction(operation, path, method, ctx, {
      baseParameters,
      defaultSecurityRequirements,
    }),
  );
}

export function createOperationBodyFunction(
  operation: OperationObject,
  path: string,
  method: string,
  ctx: Context,
  { baseParameters, defaultSecurityRequirements }: GlobalParameters,
): Block {
  const statements: Statement[] = [];

  const params = [...(operation.parameters || []), ...baseParameters];
  const queryParams = getQueryParams(params, ctx);

  const secRequirements = operation.security || defaultSecurityRequirements;
  const securities = new Set<string>(
    secRequirements?.flatMap((s) => Object.keys(s)),
  );

  // Set URL and method (and applyTemplating)
  statements.push(
    factory.createVariableStatement(
      undefined,
      factory.createVariableDeclarationList(
        [
          factory.createVariableDeclaration(
            'req',
            undefined,
            undefined,
            factory.createAwaitExpression(
              factory.createCallExpression(
                factory.createPropertyAccessExpression(
                  factory.createIdentifier('ctx'),
                  factory.createIdentifier('createRequest'),
                ),
                undefined,
                [
                  factory.createObjectLiteralExpression(
                    [
                      factory.createPropertyAssignment(
                        factory.createIdentifier('path'),
                        factory.createStringLiteral(path, true),
                      ),
                      factory.createShorthandPropertyAssignment(
                        factory.createIdentifier('params'),
                        undefined,
                      ),
                      factory.createPropertyAssignment(
                        factory.createIdentifier('method'),
                        factory.createPropertyAccessExpression(
                          createRuntimeRefProperty(ExportedRef.HttpMethod),
                          factory.createIdentifier(method.toUpperCase()),
                        ),
                      ),
                      ...(operation.requestBody
                        ? [
                            factory.createShorthandPropertyAssignment(
                              factory.createIdentifier('body'),
                              undefined,
                            ),
                          ]
                        : []),
                      ...(queryParams.length
                        ? [
                            factory.createPropertyAssignment(
                              factory.createIdentifier('queryParams'),
                              factory.createArrayLiteralExpression(
                                queryParams,
                                true,
                              ),
                            ),
                          ]
                        : []),
                      ...(operation.security?.length
                        ? [
                            factory.createPropertyAssignment(
                              factory.createIdentifier('auth'),
                              factory.createArrayLiteralExpression(
                                [...securities.values()].map((s) =>
                                  factory.createStringLiteral(s),
                                ),
                                false,
                              ),
                            ),
                          ]
                        : []),
                    ],
                    true,
                  ),
                ],
              ),
            ),
          ),
        ],
        NodeFlags.Const,
      ),
    ),
  );

  // Send request
  statements.push(
    factory.createVariableStatement(
      undefined,
      factory.createVariableDeclarationList(
        [
          factory.createVariableDeclaration(
            factory.createIdentifier('res'),
            undefined,
            undefined,
            factory.createAwaitExpression(
              factory.createCallExpression(
                factory.createPropertyAccessExpression(
                  factory.createIdentifier('ctx'),
                  factory.createIdentifier('sendRequest'),
                ),
                undefined,
                [factory.createIdentifier('req')],
              ),
            ),
          ),
        ],
        NodeFlags.Const,
      ),
    ),
  );

  // Switch on status code
  const successResponse = getSuccessResponse(operation);
  const responses = Object.entries(operation.responses || {});
  if (responses.length) {
    // If no success response is available, take every 2XX response as success.
    if (!successResponse) {
      statements.push(
        ...createResponseStatements(DEFAULT_RESPONSE, '2XX', true, ctx),
      );
    }
    // TODO sort responses (default last)
    for (const [code, resp] of responses) {
      statements.push(
        ...createResponseStatements(resp, code, resp === successResponse, ctx),
      );
    }
  } else {
    statements.push(
      ...createResponseStatements(DEFAULT_RESPONSE, 'default', true, ctx),
    );
  }

  // Unknown response type
  statements.push(
    factory.createThrowStatement(
      factory.createNewExpression(
        createRuntimeRefProperty(ExportedRef.ApiException),
        undefined,
        [
          factory.createPropertyAccessExpression(
            factory.createIdentifier('res'),
            'httpStatusCode',
          ),
          factory.createAwaitExpression(
            factory.createCallExpression(
              createRuntimeRefProperty(ExportedRef.handleResponse),
              undefined,
              [
                factory.createIdentifier('res'),
                createJSONParseWrapper({}),
                factory.createPropertyAccessExpression(
                  factory.createThis(),
                  'resolver',
                ),
              ],
            ),
          ),
        ],
      ),
    ),
  );

  return factory.createBlock(statements, true);
}
