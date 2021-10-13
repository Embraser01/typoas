import { Context } from '../../context';
import { createSchemaTypeFromResponse } from '../components/responses';
import { Expression, factory, Statement } from 'typescript';
import { OperationObject, ReferenceObject, ResponseObject } from 'openapi3-ts';
import {
  createJSONParseWrapper,
  createRuntimeRefProperty,
  ExportedRef,
  filterSchema,
} from '../utils/ref';

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
    .find((k) => k.startsWith('2') || k.startsWith('3'));
  return operation.responses[successCode || 'default'];
}

export function isEmptyResponse(statusCode: string): boolean {
  return statusCode === '204' || statusCode === '304';
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

  let bodyExpression: Expression = factory.createCallExpression(
    createRuntimeRefProperty(ExportedRef.handleResponse),
    undefined,
    [
      factory.createIdentifier('res'),
      createJSONParseWrapper(
        filterSchema(response.content?.['application/json']?.schema || {}),
      ),
      factory.createPropertyAccessExpression(factory.createThis(), 'resolver'),
    ],
  );

  if (isEmptyResponse(statusCode)) {
    bodyExpression = factory.createNull();
  } else if (!success) {
    // If not a direct return and is a promise, wrap it
    bodyExpression = factory.createAwaitExpression(bodyExpression);
  }

  let thenStmt: Statement;
  if (success) {
    thenStmt = factory.createReturnStatement(bodyExpression);
  } else {
    thenStmt = factory.createThrowStatement(
      factory.createNewExpression(
        createRuntimeRefProperty(ExportedRef.ApiException),
        [createSchemaTypeFromResponse(responseOrRef, ctx)],
        [
          factory.createPropertyAccessExpression(
            factory.createIdentifier('res'),
            'httpStatusCode',
          ),
          bodyExpression,
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
          factory.createStringLiteral(statusCode, true),
          factory.createPropertyAccessExpression(
            factory.createIdentifier('res'),
            'httpStatusCode',
          ),
        ],
      ),
      thenStmt,
    ),
  ];
}
