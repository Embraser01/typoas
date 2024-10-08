import { SchemaObject } from 'openapi3-ts/oas31';

const transformFormats: unknown[] = ['date-time'];

export function isTransformableLeafDate(schema: SchemaObject): boolean {
  return schema.type === 'string' && transformFormats.includes(schema.format);
}
