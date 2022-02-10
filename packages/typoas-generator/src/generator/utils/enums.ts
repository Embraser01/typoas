import { ReferenceObject, SchemaObject } from 'openapi3-ts';
import { factory, TypeNode, SyntaxKind, EnumMember } from 'typescript';
import { Context } from '../../context';
import { addJSDocToNode } from '../comments/fields';
import { getJSDocFromSchema } from '../comments/schema';
import {
  hasUnsupportedIdentifierChar,
  sanitizeTypeIdentifier,
} from './operation-name';

export function canConvertSchemaToEnum(schema: SchemaObject): boolean {
  return schema.type === 'string' && schema.enum !== undefined;
}

export function createEnumMembersFromSchema(
  schema: SchemaObject,
): EnumMember[] {
  if (schema.type === 'string' && schema.enum !== undefined) {
    return schema.enum.map((e) =>
      factory.createEnumMember(
        // TODO: convert the identifier to snakeCase
        factory.createIdentifier(e),
        factory.createStringLiteral(e),
      ),
    );
  }
  throw new Error('Cannot create enum members from this schema');
}
