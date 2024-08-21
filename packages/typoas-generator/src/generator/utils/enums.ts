import {
  isReferenceObject,
  ReferenceObject,
  SchemaObject,
} from 'openapi3-ts/oas31';
import { SchemaObject as SchemaObjectOAS30 } from 'openapi3-ts/oas30';
import { factory, EnumMember } from 'typescript';
import { screamingSnakeCase } from './operation-name';

export function canConvertSchemaToEnum(
  schema: SchemaObject | SchemaObjectOAS30 | ReferenceObject,
): schema is SchemaObject {
  if (isReferenceObject(schema)) {
    return false;
  }

  if (Array.isArray(schema.type) && schema.type.some((t) => t !== 'string')) {
    return false;
  }
  if (!Array.isArray(schema.type) && schema.type !== 'string') {
    return false;
  }
  return (
    schema.enum !== undefined &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    schema.enum.every((e) => ![null, '', undefined].includes(e)) &&
    !(schema as SchemaObjectOAS30).nullable
  );
}

export function createEnumMembersFromSchema(
  schema: SchemaObject,
): EnumMember[] {
  if (canConvertSchemaToEnum(schema)) {
    return schema.enum!.map((e) => {
      return factory.createEnumMember(
        factory.createIdentifier(screamingSnakeCase(e as string)),
        factory.createStringLiteral(e as string, true),
      );
    });
  }
  throw new Error('Cannot create enum members from this schema');
}
