import { TypeNode } from 'typescript';
import { Context } from '../../context';
import {
  ReferenceObject,
  ResponseObject,
  isReferenceObject,
} from 'openapi3-ts/oas31';
import { createTypeFromSchema } from '../utils/types';
import { getContentTypeSchema } from '../utils/content-type';

export function createSchemaTypeFromResponse(
  response: ResponseObject | ReferenceObject,
  ctx: Context,
): TypeNode {
  if (isReferenceObject(response)) {
    const ref = ctx.resolveReference('responses', response.$ref);
    if (!ref) {
      throw new Error(`$ref '${response.$ref}' wasn't found`);
    }
    return createTypeFromSchema(
      getContentTypeSchema(ref.spec.content, ctx),
      ctx,
    );
  }
  return createTypeFromSchema(getContentTypeSchema(response.content, ctx), ctx);
}
