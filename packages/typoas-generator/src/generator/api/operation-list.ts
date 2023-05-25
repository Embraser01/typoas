import { createOperation } from './operation';
import { addJSDocToNode } from '../comments/fields';
import { getJSDocFromOperation } from '../comments/operation';
import { Context } from '../../context';
import { OpenAPIObject, PathItemObject } from 'openapi3-ts/oas31';
import { FunctionDeclaration } from 'typescript';

const HTTP_METHOD = new Set([
  'get',
  'post',
  'options',
  'head',
  'trace',
  'patch',
  'put',
  'delete',
]);

export function createOperationList(
  specs: OpenAPIObject,
  ctx: Context,
): FunctionDeclaration[] {
  return Object.entries(specs.paths || {}).flatMap(
    ([p, item]: [string, PathItemObject]) => {
      const baseParameters = item.parameters || [];
      const ops = Object.entries(item).filter(([method]) =>
        HTTP_METHOD.has(method),
      );

      return ops.map(([method, op]) => {
        const opMethod = createOperation(op, p, method, ctx, {
          baseParameters,
          defaultSecurityRequirements: specs.security,
        });
        if (ctx.hasJSDoc()) {
          addJSDocToNode(opMethod, getJSDocFromOperation(op));
        }
        return opMethod;
      });
    },
  );
}
