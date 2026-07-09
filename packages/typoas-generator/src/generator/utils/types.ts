import {
  isReferenceObject,
  isSchemaObject,
  ReferenceObject,
  SchemaObject,
} from 'openapi3-ts/oas31';
import { SchemaObject as SchemaObjectOAS30 } from 'openapi3-ts/oas30';
import { factory, SyntaxKind, TypeNode } from 'typescript';
import { Context } from '../../context.js';
import { addJSDocToNode } from '../comments/fields.js';
import { getJSDocFromSchema } from '../comments/schema.js';
import {
  isInvalidES6IdentifierName,
  sanitizeTypeIdentifier,
} from './operation-name.js';
import { TYPOAS_BLOB_TYPE_KEY } from './content-type.js';

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

          // Define possible value types
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

          // Define possible key types, most of the time, just a string type
          let mappedType: TypeNode | undefined;

          // propertyNames can be handled in 3 ways:
          // - If it is a $ref, create a mapped type for the related ref
          // - If it defines enums (or const), create the equivalent object
          // - Else, keep the existing mapped type
          //
          // Note that propertyNames should always link to a string type (as JSON keys are always string).
          // We don't do complete check here so it may break TS (but that's bad JSON schema anyway).
          const { propertyNames } = schema;
          if (propertyNames && isReferenceObject(propertyNames)) {
            const ref = ctx.resolveReference('schemas', propertyNames.$ref);
            if (!ref) {
              throw new Error(`$ref '${propertyNames.$ref}' wasn't found`);
            }

            const isOptionalMappedType =
              ref.spec.enum?.every((e) =>
                schema.required?.includes(e as string),
              ) || false;

            // Create a [key in Type]: <valueTypes>
            mappedType = factory.createMappedTypeNode(
              undefined,
              factory.createTypeParameterDeclaration(
                undefined,
                factory.createIdentifier('key'),
                factory.createTypeReferenceNode(
                  factory.createIdentifier(sanitizeTypeIdentifier(ref.name)),
                ),
                undefined,
              ),
              undefined,
              isOptionalMappedType
                ? factory.createToken(SyntaxKind.QuestionToken)
                : undefined,
              factory.createUnionTypeNode(valueTypes),
              undefined,
            );
          } else if (
            !hasProperties &&
            (propertyNames?.enum || propertyNames?.const)
          ) {
            // This case can be translated to a simple object with known properties
            // If properties exists, we don't specify key type and will fall back to a string type.
            const names = propertyNames.enum || [propertyNames.const];
            if (names.every((n) => typeof n === 'string')) {
              mappedType = factory.createTypeLiteralNode(
                names.map((key) =>
                  factory.createPropertySignature(
                    undefined,
                    isInvalidES6IdentifierName(key)
                      ? factory.createStringLiteral(key, true)
                      : factory.createIdentifier(key),
                    schema.required?.includes(key)
                      ? undefined
                      : factory.createToken(SyntaxKind.QuestionToken),
                    factory.createUnionTypeNode(valueTypes),
                  ),
                ),
              );
            }
          }

          // By default create a { [key: string]: <valueTypes> }
          if (!mappedType) {
            mappedType = factory.createTypeLiteralNode([
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
          }
          node = hasProperties
            ? factory.createIntersectionTypeNode([node, mappedType])
            : mappedType;
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
    // We also filter out the cases where the schema only defines the object type (no properties, etc.)

    const isObject =
      schema.type === 'object' ||
      (Array.isArray(schema.type) && schema.type.includes('object'));
    const isComplexObject =
      schema.properties ||
      schema.additionalProperties ||
      schema.patternProperties ||
      schema.unevaluatedProperties;

    if (isObject && isComplexObject) {
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
