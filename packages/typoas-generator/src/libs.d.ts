import { ReferenceObject } from 'openapi3-ts/oas31';

declare module 'openapi3-ts/oas31' {
  interface SchemaObject {
    patternProperties?: Record<string, SchemaObject | ReferenceObject>;
    unevaluatedProperties?: boolean | SchemaObject | ReferenceObject;
  }
}
