import { TypeNode } from 'typescript';
import { Context } from '../../context';
import {
  ReferenceObject,
  ResponseObject,
  isReferenceObject,
} from 'openapi3-ts';
import { createTypeFromSchema } from '../utils/types';

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
      ref.spec.content?.['application/json']?.schema,
      ctx,
    );
  }
  return createTypeFromSchema(
    response.content?.['application/json']?.schema,
    ctx,
  );
}
