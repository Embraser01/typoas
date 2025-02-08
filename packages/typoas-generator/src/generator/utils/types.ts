import {
  isReferenceObject,
  isSchemaObject,
  ReferenceObject,
  SchemaObject,
} from 'openapi3-ts/oas31';
import { SchemaObject as SchemaObjectOAS30 } from 'openapi3-ts/oas30';
import { factory, TypeNode, SyntaxKind } from 'typescript';
import { Context } from '../../context';
import { addJSDocToNode } from '../comments/fields';
import { getJSDocFromSchema } from '../comments/schema';
import {
  isInvalidES6IdentifierName,
  sanitizeTypeIdentifier,
} from './operation-name';
import { TYPOAS_BLOB_TYPE_KEY } from './content-type';

export function createTypeFromSchema(
  schemaOrRef: SchemaObjectOAS30 | SchemaObject | ReferenceObject | undefined,
  ctx: Context,
): TypeNode {
  let node: TypeNode = factory.createKeywordTypeNode(
    ctx.generateAnyInsteadOfUnknown()
      ? SyntaxKind.AnyKeyword
      : SyntaxKind.UnknownKeyword,
  );

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

  if (schema[TYPOAS_BLOB_TYPE_KEY]) {
    return factory.createTypeReferenceNode(factory.createIdentifier('Blob'));
  }

  let sEnum: unknown[] | null = null;
  if (schema.enum) {
    sEnum = schema.enum;
  } else if (schema.const) {
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
            const literal = factory.createNumericLiteral(Math.abs(e));
            if (e >= 0) {
              return literal;
            }
            return factory.createPrefixUnaryExpression(
              SyntaxKind.MinusToken,
              literal,
            );
          }
          return factory.createStringLiteral(e as string, true);
        })
        .map((e) => factory.createLiteralTypeNode(e)),
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
            Object.entries(schema.properties!).map(([key, val]) => {
              const field = factory.createPropertySignature(
                undefined,
                isInvalidES6IdentifierName(key)
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

        if (
          schema.additionalProperties ||
          schema.patternProperties ||
          schema.unevaluatedProperties
        ) {
          const hasAnyShortcut =
            schema.additionalProperties === true ||
            schema.unevaluatedProperties === true;

          const valueTypes: TypeNode[] = [];

          if (!hasAnyShortcut) {
            if (
              schema.additionalProperties &&
              schema.additionalProperties !== true // useless but TS doesn't know
            ) {
              valueTypes.push(
                createTypeFromSchema(schema.additionalProperties, ctx),
              );
            }
            if (schema.patternProperties) {
              valueTypes.push(
                ...Object.values(schema.patternProperties).map((s) =>
                  createTypeFromSchema(s, ctx),
                ),
              );
            }
            if (
              schema.unevaluatedProperties &&
              schema.unevaluatedProperties !== true // useless but TS doesn't know
            ) {
              valueTypes.push(
                createTypeFromSchema(schema.unevaluatedProperties, ctx),
              );
            }
          } else {
            valueTypes.push(
              factory.createKeywordTypeNode(
                ctx.generateAnyInsteadOfUnknown()
                  ? SyntaxKind.AnyKeyword
                  : SyntaxKind.UnknownKeyword,
              ),
            );
          }

          const indexSignature = factory.createTypeLiteralNode([
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
              factory.createUnionTypeNode(valueTypes),
            ),
          ]);

          node = hasProperties
            ? factory.createIntersectionTypeNode([node, indexSignature])
            : indexSignature;
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

  let subSchemaType: TypeNode | null = null;
  if (schema.oneOf && schema.oneOf.length) {
    subSchemaType = factory.createUnionTypeNode(
      schema.oneOf.map((s) => createTypeFromSchema(s, ctx)),
    );
  } else if (schema.anyOf && schema.anyOf.length) {
    subSchemaType = factory.createUnionTypeNode(
      schema.anyOf.map((s) => createTypeFromSchema(s, ctx)),
    );
  } else if (schema.allOf && schema.allOf.length) {
    subSchemaType = factory.createIntersectionTypeNode(
      schema.allOf.map((s) => createTypeFromSchema(s, ctx)),
    );
  }

  if (subSchemaType) {
    // allOf/oneOf/anyOf can be used with a schema that has already a type
    // In our case, we only care about 'object' types as others wouldn't add typings information
    if (
      schema.type === 'object' ||
      (Array.isArray(schema.type) && schema.type.includes('object'))
    ) {
      node = factory.createIntersectionTypeNode([node, subSchemaType]);
    } else {
      node = subSchemaType;
    }
  }

  if ((schema as SchemaObjectOAS30).nullable) {
    node = factory.createUnionTypeNode([
      node,
      factory.createLiteralTypeNode(factory.createNull()),
    ]);
  }
  return node;
}
