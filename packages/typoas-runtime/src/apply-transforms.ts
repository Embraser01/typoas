import { ReferenceObject, SchemaObject } from 'openapi3-ts';

export interface SchemaRefResolver {
  resolveSchema(ref: string): SchemaObject | undefined;
}

export function applyTransforms(
  data: any,
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
  if (schema.type === 'string' && schema.format === 'date-time') {
    return new Date(data);
  }

  if (schema.type === 'array' && schema.items) {
    return data.map((d: any) => applyTransforms(d, schema.items!, resolver));
  }
  if (schema.type === 'object' && schema.properties) {
    for (const [key, val] of Object.entries(data)) {
      if (schema.properties[key]) {
        data[key] = applyTransforms(val, schema.properties[key], resolver);
      } else if (
        schema.additionalProperties &&
        schema.additionalProperties !== true
      ) {
        data[key] = applyTransforms(val, schema.additionalProperties, resolver);
      }
    }
  }
  return data;
}
