import {
  isReferenceObject,
  isSchemaObject,
  ReferenceObject,
  SchemaObject,
} from 'openapi3-ts';
import { factory, TypeNode, SyntaxKind } from 'typescript';
import { Context } from '../../context';
import { addJSDocToNode } from '../comments/fields';
import { getJSDocFromSchema } from '../comments/schema';
import {
  hasUnsupportedIdentifierChar,
  sanitizeTypeIdentifier,
} from './operation-name';

export function createTypeFromSchema(
  schemaOrRef: SchemaObject | ReferenceObject | undefined,
  ctx: Context,
): TypeNode {
  let node: TypeNode = factory.createKeywordTypeNode(SyntaxKind.AnyKeyword);

  if (!schemaOrRef) {
    return node;
  }
  if (isReferenceObject(schemaOrRef)) {
    const ref = ctx.resolveReference('schemas', schemaOrRef.$ref);
    if (!ref) {
      throw new Error(`$ref '${schemaOrRef.$ref}' wasn't found`);
    }
    node = factory.createTypeReferenceNode(
      factory.createIdentifier(sanitizeTypeIdentifier(ref.name)),
    );
  }

  const schema = schemaOrRef as SchemaObject;

  let sEnum = null;
  if (schema.enum) {
    sEnum = schema.enum;
    // @ts-expect-error OpenAPI doesn't support const, but we do as a bonus.
  } else if (schema.const) {
    // @ts-expect-error OpenAPI doesn't support const, but we do as a bonus.
    sEnum = [schema.const];
  }

  if (sEnum) {
    node = factory.createUnionTypeNode(
      sEnum
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
  } else if (schema.oneOf && schema.oneOf.length) {
    node = factory.createUnionTypeNode(
      schema.oneOf.map((s) => createTypeFromSchema(s, ctx)),
    );
  } else if (schema.anyOf && schema.anyOf.length) {
    node = factory.createUnionTypeNode(
      schema.anyOf.map((s) => createTypeFromSchema(s, ctx)),
    );
  } else if (schema.allOf && schema.allOf.length) {
    node = factory.createIntersectionTypeNode(
      schema.allOf.map((s) => createTypeFromSchema(s, ctx)),
    );
  } else if (Array.isArray(schema.type)) {
    node = factory.createUnionTypeNode(
      schema.type.map((t) => createTypeFromSchema({ ...schema, type: t }, ctx)),
    );
  } else {
    switch (schema.type) {
      case 'integer':
      case 'number':
        node = factory.createKeywordTypeNode(SyntaxKind.NumberKeyword);
        break;
      case 'string':
        switch (schema.format) {
          case 'date-time':
            node = factory.createTypeReferenceNode(
              factory.createIdentifier('Date'),
            );
            break;
          default:
            node = factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
            break;
        }
        break;
      case 'boolean':
        node = factory.createKeywordTypeNode(SyntaxKind.BooleanKeyword);
        break;
      case 'object': {
        const hasProperties =
          schema.properties && Object.keys(schema.properties).length;

        if (hasProperties) {
          node = factory.createTypeLiteralNode(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            Object.entries(schema.properties!).map(([key, val]) => {
              const field = factory.createPropertySignature(
                undefined,
                hasUnsupportedIdentifierChar(key)
                  ? factory.createStringLiteral(key, true)
                  : factory.createIdentifier(key),
                schema.required?.includes(key)
                  ? undefined
                  : factory.createToken(SyntaxKind.QuestionToken),
                createTypeFromSchema(val, ctx),
              );

              if (ctx.hasJSDoc() && isSchemaObject(val)) {
                addJSDocToNode(field, getJSDocFromSchema(val));
              }
              return field;
            }),
          );
        }
        if (schema.additionalProperties) {
          const additionalPropsNode = factory.createTypeLiteralNode([
            factory.createIndexSignature(
              undefined,
              [
                factory.createParameterDeclaration(
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
        break;
      }
      case 'null':
        node = factory.createLiteralTypeNode(factory.createNull());
        break;
      case 'array':
        node = factory.createArrayTypeNode(
          createTypeFromSchema(schema.items, ctx),
        );
        break;
    }
  }

  if (schema.nullable) {
    node = factory.createUnionTypeNode([
      node,
      factory.createLiteralTypeNode(factory.createNull()),
    ]);
  }
  return node;
}
