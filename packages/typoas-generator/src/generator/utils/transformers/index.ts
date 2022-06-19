import {
  ArrayLiteralExpression,
  Expression,
  factory,
  ObjectLiteralElementLike,
  ObjectLiteralExpression,
} from 'typescript';
import { ReferenceObject, SchemaObject, SchemasObject } from 'openapi3-ts';
import { Context } from '../../../context';
import { isTransformableLeafDate } from './date';
import {
  findLeafTransforms,
  TransformField,
  TransformType,
} from './leaf-transformer-base';
import { createRuntimeRefProperty, ExportedRef } from '../ref';
import { hasUnsupportedIdentifierChar } from '../operation-name';

export function createAllSchemaTransforms(
  schemas: SchemasObject,
  ctx: Context,
): ObjectLiteralExpression {
  const transforms: Record<string, Record<string, TransformField[]>> = {};

  for (const [name, schema] of Object.entries(schemas)) {
    const res = getSchemaTransforms(schema);
    if (Object.keys(res).length) {
      transforms[name] = res;
    }
  }

  // Optimize transforms
  for (const [entityName, entityTransforms] of Object.entries(transforms)) {
    for (const [transformType, fields] of Object.entries(entityTransforms)) {
      if (
        !isEntityHasTransforms(
          transforms,
          transformType,
          new WeakSet<TransformField>(),
          fields,
        )
      ) {
        delete entityTransforms[transformType];
      }
    }

    if (Object.values(entityTransforms).every((val) => val.length === 0)) {
      delete transforms[entityName];
    }
  }

  return factory.createObjectLiteralExpression(
    Object.entries(transforms).map(([name, entity]) =>
      factory.createPropertyAssignment(
        hasUnsupportedIdentifierChar(name)
          ? factory.createStringLiteral(name, true)
          : factory.createIdentifier(name),
        factory.createObjectLiteralExpression(
          Object.entries(entity).map(([transformType, fields]) =>
            factory.createPropertyAssignment(
              transformType,
              createFromRawTransforms(fields, ctx),
            ),
          ),
          true,
        ),
      ),
    ),
    true,
  );
}

function isEntityHasTransforms(
  transforms: Record<string, Record<string, TransformField[]>>,
  transformerType: string,
  visited: WeakSet<TransformField>,
  fields?: TransformField[],
): boolean {
  if (!fields?.length) {
    return false;
  }

  let hasTransforms = false;

  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    if (field.length) {
      if (field.some(([type]) => type === TransformType.THIS)) {
        hasTransforms = true;
        continue;
      }
      if (visited.has(field)) {
        continue;
      }
      visited.add(field);

      const [type, data] = field[field.length - 1];
      if (
        type === TransformType.REF &&
        transforms[data as string] &&
        isEntityHasTransforms(
          transforms,
          transformerType,
          visited,
          transforms[data as string][transformerType],
        )
      ) {
        hasTransforms = true;
      } else if (
        type === TransformType.SELECT &&
        isEntityHasTransforms(
          transforms,
          transformerType,
          visited,
          data as TransformField[],
        )
      ) {
        hasTransforms = true;
      } else {
        i--;
        fields.splice(fields.indexOf(field), 1);
      }
    }
  }
  return hasTransforms;
}

function getSchemaTransforms(
  schema: SchemaObject | ReferenceObject,
): Record<string, TransformField[]> {
  const transforms: Record<string, TransformField[]> = {};

  // Date transforms
  const dateRawTransforms = findLeafTransforms(schema, isTransformableLeafDate);
  if (dateRawTransforms.length) {
    transforms.date = dateRawTransforms;
  }

  return transforms;
}

export function createSchemaTransforms(
  schema: SchemaObject | ReferenceObject,
  ctx: Context,
): ObjectLiteralExpression | null {
  const transforms: ObjectLiteralElementLike[] = Object.entries(
    getSchemaTransforms(schema),
  ).map(([type, rawTransforms]) =>
    factory.createPropertyAssignment(
      type,
      createFromRawTransforms(rawTransforms, ctx),
    ),
  );

  if (!transforms.length) {
    return null;
  }
  return factory.createObjectLiteralExpression(transforms);
}

function createFromRawTransforms(
  rawTransforms: TransformField[],
  ctx: Context,
): ArrayLiteralExpression {
  return factory.createArrayLiteralExpression(
    rawTransforms.map((transformFields) =>
      factory.createArrayLiteralExpression(
        transformFields.map(([type, data]) => {
          const items: Expression[] = [
            factory.createPropertyAccessExpression(
              createRuntimeRefProperty(ExportedRef.TransformType),
              factory.createIdentifier(type.toUpperCase()),
            ),
          ];

          if (typeof data === 'string') {
            items.push(factory.createStringLiteral(data));
          } else if (Array.isArray(data)) {
            items.push(createFromRawTransforms(data, ctx));
          }

          return factory.createArrayLiteralExpression(items);
        }),
      ),
    ),
  );
}
