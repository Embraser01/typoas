import { SchemaRefResolver } from './apply-transforms';
import { SchemaObject, SchemasObject } from 'openapi3-ts';

export class RefResolver implements SchemaRefResolver {
  constructor(private schemas: SchemasObject) {}

  resolveSchema(ref: string): SchemaObject | undefined {
    const [, schemaName] =
      /^#\/components\/schemas\/([a-zA-Z-_]+)/.exec(ref) || [];

    return this.schemas?.[schemaName];
  }
}
