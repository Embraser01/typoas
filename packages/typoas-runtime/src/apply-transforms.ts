/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReferenceObject, SchemaObject } from 'openapi3-ts';

export interface SchemaRefResolver {
  resolveSchema(ref: string): SchemaObject | undefined;
}

export function applyTransforms(
  data: unknown,
  schemaOrRef: SchemaObject | ReferenceObject,
  resolver: SchemaRefResolver,
): any {
  if (typeof data === 'undefined' || data === null) return data;

  if (schemaOrRef.$ref) {
    const schema = resolver.resolveSchema(schemaOrRef.$ref);
    if (!schema) {
      return data;
    }
    return applyTransforms(data, schema, resolver);
  }

  const schema = schemaOrRef as SchemaObject;
  if (
    schema.type === 'string' &&
    schema.format === 'date-time' &&
    typeof data === 'string'
  ) {
    return new Date(data);
  }

  if (schema.type === 'array' && schema.items && Array.isArray(data)) {
    return data.map((d) =>
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      applyTransforms(d, schema.items!, resolver),
    );
  }
  if (
    schema.type === 'object' &&
    schema.properties &&
    typeof data === 'object'
  ) {
    for (const [key, val] of Object.entries(data as Record<string, any>)) {
      if (schema.properties[key]) {
        (data as Record<string, any>)[key] = applyTransforms(
          val,
          schema.properties[key],
          resolver,
        );
      } else if (
        schema.additionalProperties &&
        schema.additionalProperties !== true
      ) {
        (data as Record<string, any>)[key] = applyTransforms(
          val,
          schema.additionalProperties,
          resolver,
        );
      }
    }
  }

  if (schema.oneOf) {
    for (const s of schema.oneOf) {
      data = applyTransforms(data, s, resolver);
    }
  }

  if (schema.anyOf) {
    for (const s of schema.anyOf) {
      data = applyTransforms(data, s, resolver);
    }
  }
  return data;
}
