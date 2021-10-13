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
  ClassElement,
  factory,
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
import { createParameterStatements } from './request-preparation';
import {
  createJSONParseWrapper,
  createRuntimeRefProperty,
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
): ClassElement {
  // Create API class with:
  //   - All available security
  //   - All available servers
  //   - Raw data?
  //
  // For each service a function with:
  //   - (params): (object parameters), (body if present), (options?)
  //   - (return): (response body)
  //   - Get service name operation
  //   - Set URL path & method
  //   - Set security if needed
  //   - Set parameters
  //   - Set request body
  //   - Parse responses by status code
  const resp = getSuccessResponse(operation);

  const usedParams = new Set<string>();
  const parameters: ParameterDeclaration[] = [
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

  return factory.createMethodDeclaration(
    undefined,
    [factory.createModifier(SyntaxKind.AsyncKeyword)],
    undefined,
    sanitizeOperationIdName(operation.operationId || `${path}/${method}`),
    undefined,
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

  // Set URL and method (and applyTemplating)
  statements.push(
    factory.createVariableStatement(
      undefined,
      factory.createVariableDeclarationList(
        [
          factory.createVariableDeclaration(
            'requestContext',
            undefined,
            undefined,
            factory.createCallExpression(
              factory.createPropertyAccessExpression(
                factory.createPropertyAccessExpression(
                  factory.createThis(),
                  'server',
                ),
                'makeRequestContext',
              ),
              undefined,
              [
                factory.createCallExpression(
                  createRuntimeRefProperty(ExportedRef.applyTemplating),
                  undefined,
                  [
                    factory.createStringLiteral(path, true),
                    factory.createIdentifier('params'),
                  ],
                ),
                factory.createPropertyAccessExpression(
                  createRuntimeRefProperty(ExportedRef.HttpMethod),
                  method.toUpperCase(),
                ),
              ],
            ),
          ),
        ],
        NodeFlags.Const,
      ),
    ),
  );

  // Assign content type
  statements.push(
    factory.createExpressionStatement(
      factory.createCallExpression(
        factory.createPropertyAccessExpression(
          factory.createIdentifier('requestContext'),
          'setHeaderParam',
        ),
        undefined,
        [
          factory.createStringLiteral('Content-Type', true),
          factory.createStringLiteral('application/json', true),
        ],
      ),
    ),
  );

  // Assign parameters
  const params = [...(operation.parameters || []), ...baseParameters];
  const usedParams = new Set<string>();
  for (const p of params) {
    const name = getParameterName(p, ctx);
    if (!usedParams.has(name)) {
      usedParams.add(name);
      statements.push(...createParameterStatements(p, ctx));
    }
  }

  // Assign request body if needed
  if (operation.requestBody) {
    statements.push(
      factory.createExpressionStatement(
        factory.createCallExpression(
          factory.createPropertyAccessExpression(
            factory.createIdentifier('requestContext'),
            'setBody',
          ),
          undefined,
          [
            factory.createCallExpression(
              factory.createPropertyAccessExpression(
                factory.createIdentifier('JSON'),
                'stringify',
              ),
              undefined,
              [factory.createIdentifier('body')],
            ),
          ],
        ),
      ),
    );
  }

  // Assign security schemes
  const secRequirements = operation.security || defaultSecurityRequirements;
  if (secRequirements?.length) {
    const secSchemesKeys = new Set<string>(
      secRequirements.flatMap((s) => Object.keys(s)),
    );

    for (const scheme of secSchemesKeys) {
      statements.push(
        factory.createExpressionStatement(
          factory.createAwaitExpression(
            factory.createCallExpression(
              factory.createPropertyAccessExpression(
                factory.createPropertyAccessExpression(
                  factory.createPropertyAccessExpression(
                    factory.createThis(),
                    'authMethods',
                  ),
                  scheme,
                ),
                'applySecurityAuthentication',
              ),
              undefined,
              [factory.createIdentifier('requestContext')],
            ),
          ),
        ),
      );
    }
  }

  // const response = await this.http.send(requestContext);
  statements.push(
    factory.createVariableStatement(
      undefined,
      factory.createVariableDeclarationList(
        [
          factory.createVariableDeclaration(
            'res',
            undefined,
            undefined,
            factory.createAwaitExpression(
              factory.createCallExpression(
                factory.createPropertyAccessExpression(
                  factory.createPropertyAccessExpression(
                    factory.createThis(),
                    'http',
                  ),
                  'send',
                ),
                undefined,
                [factory.createIdentifier('requestContext')],
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
