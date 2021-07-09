import { SchemaRefResolver } from './apply-transforms';
import { SchemaObject, SchemasObject } from 'openapi3-ts';
export declare class RefResolver implements SchemaRefResolver {
    private schemas;
    constructor(schemas: SchemasObject);
    resolveSchema(ref: string): SchemaObject | undefined;
}
