import { Context } from '../../context';
import { getParameterName } from '../components/parameters';
import { factory, Statement } from 'typescript';
import { ParameterObject, ReferenceObject } from 'openapi3-ts';
import { createRuntimeRefProperty, ExportedRef } from '../utils/ref';

export function createParameterStatements(
  parameterOrRef: ParameterObject | ReferenceObject,
  ctx: Context,
): Statement[] {
  let parameter = parameterOrRef as ParameterObject;
  const propName = getParameterName(parameterOrRef, ctx);

  if (parameterOrRef.$ref) {
    const ref = ctx.resolveReference('parameters', parameterOrRef.$ref);
    if (!ref) {
      throw new Error(`$ref '${parameterOrRef.$ref}' wasn't found`);
    }
    parameter = ref.spec;
  }

  // ignore path params as there are already set
  if (parameter.in === 'path') {
    return [];
  }

  let fnName;
  switch (parameter.in) {
    case 'query':
      fnName = 'setQueryParam';
      break;
    case 'header':
      fnName = 'setHeaderParam';
      break;
    case 'cookie':
      fnName = 'addCookie';
      break;
  }

  return [
    factory.createIfStatement(
      factory.createStrictInequality(
        factory.createPropertyAccessExpression(
          factory.createIdentifier('params'),
          propName,
        ),
        factory.createIdentifier('undefined'),
      ),
      factory.createExpressionStatement(
        factory.createCallExpression(
          factory.createPropertyAccessExpression(
            factory.createIdentifier('requestContext'),
            fnName,
          ),
          undefined,
          [
            factory.createStringLiteral(propName, true),
            factory.createCallExpression(
              createRuntimeRefProperty(ExportedRef.serializeParameter),
              undefined,
              [
                factory.createPropertyAccessExpression(
                  factory.createIdentifier('params'),
                  propName,
                ),
              ],
            ),
          ],
        ),
      ),
    ),
  ];
}
