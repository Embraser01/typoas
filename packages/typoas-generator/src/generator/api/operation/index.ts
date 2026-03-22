import { OperationObject } from 'openapi3-ts/oas31';
import { factory, FunctionDeclaration, SyntaxKind } from 'typescript';
import { Context } from '../../../context.js';
import { sanitizeOperationIdName } from '../../utils/operation-name.js';
import {
  createOperationDeclaration,
  createOperationReturnType,
} from './declaration.js';
import { createOperationBody } from './function-body.js';
import { GlobalParameters } from './types.js';
import {
  createRuntimeRefType,
  ExportedRef,
  FETCHER_DATA_NAME,
} from '../../utils/ref.js';

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
    ctx.hasFetcherOptions()
      ? [
          factory.createTypeParameterDeclaration(
            undefined,
            FETCHER_DATA_NAME,
            createRuntimeRefType(ExportedRef.BaseFetcherData),
          ),
        ]
      : undefined,
    createOperationDeclaration(operation, ctx, { baseParameters }),
    createOperationReturnType(operation, ctx),
    createOperationBody(operation, path, method, ctx, {
      baseParameters,
      defaultSecurityRequirements,
    }),
  );
}
