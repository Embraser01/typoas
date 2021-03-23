import { Context } from '../../context';
import {
  createSchemaTypeFromParameters,
  getParameterName,
  isParameterRequired,
} from '../components/parameters';
import { createSchemaTypeFromRequestBody } from '../components/request-bodies';
import { createSchemaTypeFromResponse } from '../components/responses';
import { OperationObject } from 'openapi3-ts';
import {
  Block,
  ClassElement,
  factory,
  NodeFlags,
  ParameterDeclaration,
  Statement,
  SyntaxKind,
} from 'typescript';
import {
  createResponseStatements,
  DEFAULT_RESPONSE,
  getSuccessResponse,
} from './response-processor';
import { createParameterStatements } from './request-preparation';
import { createRuntimeRefProperty, ExportedRef } from '../utils/ref';
import {
  hasUnsupportedIdentifierChar,
  sanitizeOperationIdName,
} from '../utils/operation-name';

export function createOperation(
  operation: OperationObject,
  path: string,
  method: string,
  ctx: Context,
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
  const parameters: ParameterDeclaration[] = [
    factory.createParameterDeclaration(
      undefined,
      undefined,
      undefined,
      'params',
      undefined,
      factory.createTypeLiteralNode(
        (operation.parameters || []).map((p) => {
          const name = getParameterName(p, ctx);

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
        }),
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
    createOperationBodyFunction(operation, path, method, ctx),
  );
}

export function createOperationBodyFunction(
  operation: OperationObject,
  path: string,
  method: string,
  ctx: Context,
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
          factory.createStringLiteral('Accept', true),
          factory.createStringLiteral('application/json, */*;q=0.8', true),
        ],
      ),
    ),
  );

  // Assign parameters
  if (Array.isArray(operation.parameters)) {
    for (const p of operation.parameters) {
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
  if (operation.security && operation.security.length) {
    for (const secObject of operation.security) {
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
                  // TODO Handle OAuth2 flows and Multiple auths
                  Object.keys(secObject)[0],
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
            'response',
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
        [factory.createKeywordTypeNode(SyntaxKind.StringKeyword)],
        [
          factory.createPropertyAccessExpression(
            factory.createIdentifier('response'),
            'httpStatusCode',
          ),
          factory.createStringLiteral('Unknown API Status Code!', true),
        ],
      ),
    ),
  );

  return factory.createBlock(statements, true);
}
