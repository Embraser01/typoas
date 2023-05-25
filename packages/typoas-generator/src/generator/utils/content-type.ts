import {
  ContentObject,
  ReferenceObject,
  SchemaObject,
} from 'openapi3-ts/oas31';
import { Context } from '../../context';

// This key is a simple hack for the createTypeFromSchema function
// for it to generate a Blob type that does not exist by default in json schema.
export const TYPOAS_BLOB_TYPE_KEY = 'x-typoas-blob-type';

export function getContentTypeSchema(
  content: ContentObject | undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ctx: Context,
): ReferenceObject | SchemaObject | undefined {
  if (!content) {
    return undefined;
  }
  if (content['application/json']) {
    return content['application/json'].schema;
  }

  if (content['text/plain']) {
    return { type: 'string' };
  }

  if (content['application/octet-stream']) {
    return { [TYPOAS_BLOB_TYPE_KEY]: true };
  }
}
