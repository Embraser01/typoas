import { ResponseContext } from './http';
import { applyTransforms, SchemaRefResolver } from '../apply-transforms';
import { ReferenceObject, SchemaObject } from 'openapi3-ts';

const CONTENT_TYPE_HEADER = 'content-type';

export async function handleResponse<T>(
  res: ResponseContext,
  schema: SchemaObject | ReferenceObject,
  resolver: SchemaRefResolver,
): Promise<T> {
  const mayBeJSONSchema =
    !res.headers[CONTENT_TYPE_HEADER] ||
    res.headers[CONTENT_TYPE_HEADER] === 'application/json';

  if (res.body && res.httpStatusCode !== 204 && mayBeJSONSchema) {
    const data = await res.body.json();
    return applyTransforms(data, schema, resolver);
  }
  // In case of no body force return value to null
  return null as unknown as T;
}
