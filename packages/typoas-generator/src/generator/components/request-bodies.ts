import { TypeNode } from 'typescript';
import { Context } from '../../context';
import { ReferenceObject, RequestBodyObject } from 'openapi3-ts';
import { createTypeFromSchema } from '../utils/types';

export function createSchemaTypeFromRequestBody(
  requestBodyOrRef: RequestBodyObject | ReferenceObject,
  ctx: Context,
): TypeNode {
  if (requestBodyOrRef.$ref) {
    const ref = ctx.resolveReference('requestBodies', requestBodyOrRef.$ref);
    if (!ref) {
      throw new Error(`$ref '${requestBodyOrRef.$ref}' wasn't found`);
    }
    return createTypeFromSchema(
      ref.spec.content['application/json']?.schema,
      ctx,
    );
  }
  const requestBody = requestBodyOrRef as RequestBodyObject;

  return createTypeFromSchema(
    requestBody.content['application/json']?.schema,
    ctx,
  );
}
