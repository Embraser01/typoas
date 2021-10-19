import { ResponseContext } from './http';
import { applyTransforms, SchemaRefResolver } from '../apply-transforms';
import { ReferenceObject, SchemaObject } from 'openapi3-ts';

const CONTENT_TYPE_HEADER = 'content-type';

const EMPTY_BODY_CODES = [204, 304];

export async function handleResponse<T>(
  res: ResponseContext,
  schema: SchemaObject | ReferenceObject,
  resolver: SchemaRefResolver,
): Promise<T> {
  const mayBeJSONSchema =
    res.headers[CONTENT_TYPE_HEADER]?.includes('application/json');

  if (
    res.body &&
    !EMPTY_BODY_CODES.includes(res.httpStatusCode) &&
    mayBeJSONSchema
  ) {
    const data = await res.body.json();
    return applyTransforms(data, schema, resolver);
  }
  // In case of no body force return value to null
  return null as unknown as T;
}
