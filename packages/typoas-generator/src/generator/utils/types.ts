import { ReferenceObject, SchemaObject } from 'openapi3-ts';
import { factory, TypeNode, SyntaxKind } from 'typescript';
import { Context } from '../../context';
import {
  hasUnsupportedIdentifierChar,
  sanitizeTypeIdentifier,
} from './operation-name';

const ENUM_SUPPORTED_TYPE = ['integer', 'number', 'string', 'null', 'boolean'];

export function createTypeFromSchema(
  schemaOrRef: SchemaObject | ReferenceObject | undefined,
  ctx: Context,
): TypeNode {
  if (!schemaOrRef) {
    return factory.createKeywordTypeNode(SyntaxKind.AnyKeyword);
  }
  if (schemaOrRef.$ref) {
    const ref = ctx.resolveReference('schemas', schemaOrRef.$ref);
    if (!ref) {
      throw new Error(`$ref '${schemaOrRef.$ref}' wasn't found`);
    }
    return factory.createTypeReferenceNode(
      factory.createIdentifier(sanitizeTypeIdentifier(ref.name)),
    );
  }

  const schema: SchemaObject = schemaOrRef;

  if (schema.enum && schema.type && ENUM_SUPPORTED_TYPE.includes(schema.type)) {
    return factory.createUnionTypeNode(
      schema.enum
        .map((e) => {
          if (e === null) return factory.createNull();
          if (typeof e === 'boolean') {
            return e ? factory.createTrue() : factory.createFalse();
          }
          if (typeof e === 'number') {
            return factory.createNumericLiteral(e);
          }
          return factory.createStringLiteral(e, true);
        })
        .map((e) => factory.createLiteralTypeNode(e)),
    );
  }

  switch (schema.type) {
    case 'integer':
    case 'number':
      return factory.createKeywordTypeNode(SyntaxKind.NumberKeyword);
    case 'string':
      switch (schema.format) {
        case 'date':
        case 'date-time':
          return factory.createTypeReferenceNode(
            factory.createIdentifier('Date'),
          );
        default:
          return factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
      }
    case 'boolean':
      return factory.createKeywordTypeNode(SyntaxKind.BooleanKeyword);
    case 'object': {
      const hasProperties =
        schema.properties && Object.keys(schema.properties).length;
      let node: TypeNode = factory.createKeywordTypeNode(SyntaxKind.AnyKeyword);

      if (hasProperties) {
        node = factory.createTypeLiteralNode(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          Object.entries(schema.properties!).map(([key, val]) =>
            factory.createPropertySignature(
              undefined,
              hasUnsupportedIdentifierChar(key)
                ? factory.createStringLiteral(key, true)
                : factory.createIdentifier(key),
              schema.required?.includes(key)
                ? undefined
                : factory.createToken(SyntaxKind.QuestionToken),
              createTypeFromSchema(val, ctx),
            ),
          ),
        );
      }
      if (schema.additionalProperties) {
        const additionalPropsNode = factory.createTypeLiteralNode([
          factory.createIndexSignature(
            undefined,
            undefined,
            [
              factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                factory.createIdentifier('key'),
                undefined,
                factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
                undefined,
              ),
            ],
            schema.additionalProperties === true
              ? factory.createKeywordTypeNode(SyntaxKind.AnyKeyword)
              : createTypeFromSchema(schema.additionalProperties, ctx),
          ),
        ]);

        node = hasProperties
          ? factory.createIntersectionTypeNode([node, additionalPropsNode])
          : additionalPropsNode;
      }
      return node;
    }
    case 'null':
      return factory.createLiteralTypeNode(factory.createNull());
    case 'array':
      return factory.createArrayTypeNode(
        createTypeFromSchema(schema.items, ctx),
      );
  }

  if (schema.oneOf && schema.oneOf.length) {
    return factory.createUnionTypeNode(
      schema.oneOf.map((s) => createTypeFromSchema(s, ctx)),
    );
  }

  if (schema.anyOf && schema.anyOf.length) {
    return factory.createUnionTypeNode(
      schema.anyOf.map((s) => createTypeFromSchema(s, ctx)),
    );
  }

  return factory.createKeywordTypeNode(SyntaxKind.AnyKeyword);
}
