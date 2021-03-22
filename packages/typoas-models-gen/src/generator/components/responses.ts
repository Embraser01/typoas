import { TypeNode } from 'typescript';
import { Context } from '../../context';
import { ReferenceObject, ResponseObject } from 'openapi3-ts';
import { createTypeFromSchema } from '../utils/types';

export function createSchemaTypeFromResponse(
  responseOrRef: ResponseObject | ReferenceObject,
  ctx: Context,
): TypeNode {
  if (responseOrRef.$ref) {
    const ref = ctx.resolveReference('responses', responseOrRef.$ref);
    if (!ref) {
      throw new Error(`$ref '${responseOrRef.$ref}' wasn't found`);
    }
    return createTypeFromSchema(
      ref.spec.content?.['application/json']?.schema,
      ctx,
    );
  }
  const response = responseOrRef as ResponseObject;

  return createTypeFromSchema(
    response.content?.['application/json']?.schema,
    ctx,
  );
}
