import { Context } from '../../../context';
import { getQueryParams } from './query-params';
import { createRuntimeRefProperty, ExportedRef } from '../../utils/ref';
import { GlobalParameters } from './types';
import { OperationObject, ResponseObject } from 'openapi3-ts';
import {
  Block,
  factory,
  NodeFlags,
  ObjectLiteralElementLike,
  Statement,
} from 'typescript';
import { createSchemaTransforms } from '../../utils/transformers';

export function createOperationBody(
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

  // Create request
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

  // Handle response
  statements.push(
    factory.createReturnStatement(
      factory.createCallExpression(
        factory.createPropertyAccessExpression(
          factory.createIdentifier('ctx'),
          factory.createIdentifier('handleResponse'),
        ),
        undefined,
        [
          factory.createIdentifier('res'),
          factory.createObjectLiteralExpression(
            createOperationResponseHandlers(operation, ctx),
            true,
          ),
        ],
      ),
    ),
  );
  return factory.createBlock(statements, true);
}

export function createOperationResponseHandlers(
  operation: OperationObject,
  ctx: Context,
): ObjectLiteralElementLike[] {
  const responses = Object.entries(operation.responses || {});
  return responses
    .map(([code, response]) => {
      let res = response as ResponseObject;
      if (response.$ref) {
        const ref = ctx.resolveReference('responses', response.$ref);
        if (!ref) {
          throw new Error(`$ref '${response.$ref}' not found`);
        }
        res = ref.spec;
      }
      const schema = res.content?.['application/json']?.schema;
      if (!schema) {
        return null;
      }
      const transforms = createSchemaTransforms(schema, ctx);
      if (!transforms) {
        return null;
      }
      return factory.createPropertyAssignment(
        factory.createStringLiteral(code, true),
        factory.createObjectLiteralExpression([
          factory.createPropertyAssignment(
            factory.createIdentifier('transforms'),
            transforms,
          ),
        ]),
      );
    })
    .filter(Boolean) as ObjectLiteralElementLike[];
}
