import { OperationObject } from 'openapi3-ts/oas31';
import { factory, FunctionDeclaration, SyntaxKind } from 'typescript';
import { Context } from '../../../context';
import { sanitizeOperationIdName } from '../../utils/operation-name';
import {
  createOperationDeclaration,
  createOperationReturnType,
} from './declaration';
import { createOperationBody } from './function-body';
import { GlobalParameters } from './types';

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
  //     - auth if needed
  //     - queryParams if needed
  //
  //   - Send request
  //   - Handle response
  //     - res
  //     - handlers (per status code)
  //       - transforms to compute

  return factory.createFunctionDeclaration(
    [
      factory.createModifier(SyntaxKind.ExportKeyword),
      factory.createModifier(SyntaxKind.AsyncKeyword),
    ],
    undefined,
    sanitizeOperationIdName(operation.operationId || `${path}/${method}`),
    undefined,
    createOperationDeclaration(operation, ctx, { baseParameters }),
    createOperationReturnType(operation, ctx),
    createOperationBody(operation, path, method, ctx, {
      baseParameters,
      defaultSecurityRequirements,
    }),
  );
}
