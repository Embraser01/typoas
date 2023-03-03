import { TypeNode } from 'typescript';
import { Context } from '../../context';
import {
  isReferenceObject,
  ReferenceObject,
  RequestBodyObject,
} from 'openapi3-ts';
import { createTypeFromSchema } from '../utils/types';

export function createSchemaTypeFromRequestBody(
  requestBody: RequestBodyObject | ReferenceObject,
  ctx: Context,
): TypeNode {
  if (isReferenceObject(requestBody)) {
    const ref = ctx.resolveReference('requestBodies', requestBody.$ref);
    if (!ref) {
      throw new Error(`$ref '${requestBody.$ref}' wasn't found`);
    }
    return createTypeFromSchema(
      ref.spec.content['application/json']?.schema,
      ctx,
    );
  }

  return createTypeFromSchema(
    requestBody.content['application/json']?.schema,
    ctx,
  );
}
