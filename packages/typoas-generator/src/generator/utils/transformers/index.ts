import {
  ArrayLiteralExpression,
  Expression,
  factory,
  ObjectLiteralElementLike,
  ObjectLiteralExpression,
} from 'typescript';
import { ReferenceObject, SchemaObject } from 'openapi3-ts/oas31';
import { Context } from '../../../context';
import { isTransformableLeafDate } from './date';
import {
  findLeafTransforms,
  TransformField,
  TransformType,
  TransformerType,
  SkipRefCb,
  IsTransformableLeafCb,
} from './leaf-transformer-base';
import { sanitizeTransformEntity } from '../operation-name';

export function getSchemaTransforms(
  type: TransformerType,
  schema: SchemaObject | ReferenceObject,
  skipRef?: SkipRefCb,
): TransformField[] {
  let cb: IsTransformableLeafCb;
  switch (type) {
    case TransformerType.DATE:
      cb = isTransformableLeafDate;
      break;
  }
  return findLeafTransforms(type, schema, cb, skipRef);
}

export function createSchemaTransforms(
  schema: SchemaObject | ReferenceObject,
  ctx: Context,
): ObjectLiteralExpression | null {
  const transforms: ObjectLiteralElementLike[] = [];

  for (const type of Object.values(TransformerType)) {
    const fields = getSchemaTransforms(
      type,
      schema,
      (name) => !ctx.transformSchemas.has(sanitizeTransformEntity(type, name)),
    );
    if (fields.length) {
      transforms.push(
        factory.createPropertyAssignment(
          type,
          createFromRawTransforms(fields, ctx),
        ),
      );
    }
  }
  if (!transforms.length) {
    return null;
  }
  return factory.createObjectLiteralExpression(transforms);
}

export function createFromRawTransforms(
  rawTransforms: TransformField[],
  ctx: Context,
): ArrayLiteralExpression {
  return factory.createArrayLiteralExpression(
    rawTransforms.map((transformFields) =>
      factory.createArrayLiteralExpression(
        transformFields.map(([type, data]) => {
          const items: Expression[] = [factory.createStringLiteral(type, true)];

          if (type === TransformType.REF) {
            items.push(factory.createIdentifier(data));
          } else if (typeof data === 'string') {
            items.push(factory.createStringLiteral(data, true));
          } else if (Array.isArray(data)) {
            items.push(createFromRawTransforms(data, ctx));
          }
          return factory.createArrayLiteralExpression(items);
        }),
      ),
    ),
  );
}
