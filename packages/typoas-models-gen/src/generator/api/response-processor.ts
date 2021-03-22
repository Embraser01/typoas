import { Context } from '../../context';
import { createSchemaTypeFromResponse } from '../components/responses';
import { factory, Statement } from 'typescript';
import { OperationObject, ReferenceObject, ResponseObject } from 'openapi3-ts';
import { createRuntimeRefProperty, ExportedRef } from '../utils/ref';

export const DEFAULT_RESPONSE: ResponseObject = {
  description: 'Default response',
  content: {
    'application/json': { schema: { type: 'object' } },
  },
};

export function getSuccessResponse(
  operation: OperationObject,
): ResponseObject | ReferenceObject {
  if (!operation.responses) {
    return DEFAULT_RESPONSE;
  }
  const successCode = Object.keys(operation.responses)
    .sort()
    .find((k) => k.startsWith('2'));
  return operation.responses[successCode || 'default'];
}

export function createResponseStatements(
  responseOrRef: ResponseObject | ReferenceObject,
  statusCode: string,
  success: boolean,
  ctx: Context,
): Statement[] {
  let response: ResponseObject = responseOrRef as ResponseObject;
  if (responseOrRef.$ref) {
    const ref = ctx.resolveReference('responses', responseOrRef.$ref);
    if (!ref) {
      throw new Error(`$ref '${responseOrRef.$ref}' wasn't found`);
    }
    response = ref.spec;
  }

  const bodyExpression = factory.createCallExpression(
    createRuntimeRefProperty(ExportedRef.applyTransforms),
    undefined,
    [
      factory.createAwaitExpression(
        factory.createCallExpression(
          factory.createPropertyAccessExpression(
            factory.createPropertyAccessExpression(
              factory.createIdentifier('response'),
              'body',
            ),
            'json',
          ),
          undefined,
          [],
        ),
      ),

      factory.createCallExpression(
        factory.createPropertyAccessExpression(
          factory.createIdentifier('JSON'),
          'parse',
        ),
        undefined,
        [
          // Directly pass a stringified version of the spec.
          factory.createStringLiteral(
            JSON.stringify(
              response.content?.['application/json']?.schema || '',
            ),
            true,
          ),
        ],
      ),
      factory.createPropertyAccessExpression(factory.createThis(), 'resolver'),
    ],
  );

  let thenStmt: Statement;
  if (success) {
    thenStmt = factory.createReturnStatement(
      factory.createAsExpression(
        bodyExpression,
        createSchemaTypeFromResponse(response, ctx),
      ),
    );
  } else {
    thenStmt = factory.createThrowStatement(
      factory.createNewExpression(
        createRuntimeRefProperty(ExportedRef.ApiException),
        [createSchemaTypeFromResponse(responseOrRef, ctx)],
        [
          factory.createPropertyAccessExpression(
            factory.createIdentifier('response'),
            'httpStatusCode',
          ),
          factory.createAsExpression(
            bodyExpression,
            createSchemaTypeFromResponse(response, ctx),
          ),
        ],
      ),
    );
  }
  return [
    factory.createIfStatement(
      factory.createCallExpression(
        createRuntimeRefProperty(ExportedRef.isCodeInRange),
        undefined,
        [
          factory.createStringLiteral(statusCode),
          factory.createPropertyAccessExpression(
            factory.createIdentifier('response'),
            'httpStatusCode',
          ),
        ],
      ),
      thenStmt,
    ),
  ];
}
