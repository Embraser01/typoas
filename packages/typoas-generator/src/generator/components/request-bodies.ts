import { TypeNode } from 'typescript';
import { Context } from '../../context';
import {
  isReferenceObject,
  ReferenceObject,
  RequestBodyObject,
} from 'openapi3-ts/oas31';
import { createTypeFromSchema } from '../utils/types';
import { getContentTypeSchema } from '../utils/content-type';

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
      getContentTypeSchema(ref.spec.content, ctx),
      ctx,
    );
  }

  return createTypeFromSchema(
    getContentTypeSchema(requestBody.content, ctx),
    ctx,
  );
}
