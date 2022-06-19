import {
  ArrayLiteralExpression,
  Expression,
  factory,
  ObjectLiteralElementLike,
  ObjectLiteralExpression,
} from 'typescript';
import { ReferenceObject, SchemaObject } from 'openapi3-ts';
import { Context } from '../../../context';
import { isTransformableLeafDate } from './date';
import { findLeafTransforms, TransformField } from './leaf-transformer-base';
import { createRuntimeRefProperty, ExportedRef } from '../ref';

export function createSchemaTransforms(
  schema: SchemaObject | ReferenceObject,
  ctx: Context,
): ObjectLiteralExpression | null {
  const transforms: ObjectLiteralElementLike[] = [];

  // Date transform
  const rawTransforms = findLeafTransforms(schema, isTransformableLeafDate);
  if (rawTransforms.length) {
    transforms.push(
      factory.createPropertyAssignment(
        'date',
        createFromRawTransforms(rawTransforms, ctx),
      ),
    );
  }

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
