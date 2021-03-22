import { SchemaRefResolver } from './apply-transforms';
import { OpenAPIObject, SchemaObject } from 'openapi3-ts';

export class RefResolver implements SchemaRefResolver {
  constructor(private specs: OpenAPIObject) {}

  resolveSchema(ref: string): SchemaObject | undefined {
    const [, schemaName] = /^#\/components\/schemas\/(\w+)/.exec(ref) || [];

    return this.specs?.components?.schemas?.[schemaName];
  }
}
