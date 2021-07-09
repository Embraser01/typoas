import { ReferenceObject, SchemaObject } from 'openapi3-ts';
export interface SchemaRefResolver {
    resolveSchema(ref: string): SchemaObject | undefined;
}
export declare function applyTransforms(data: unknown, schemaOrRef: SchemaObject | ReferenceObject, resolver: SchemaRefResolver): any;
