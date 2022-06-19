import { ReferenceObject, SchemaObject } from 'openapi3-ts';

// Here we duplicate the code from runtime.
// It only concerns:
// - TransformType
// - TransformField
// - TransformLevel
//
export enum TransformType {
  ACCESS = 'access',
  THIS = 'this',
  LOOP = 'loop',
  SELECT = 'select',
  REF = 'ref',
}

export type TransformField = TransformLevel[];
export type TransformLevel =
  | [TransformType.ACCESS, string]
  | [TransformType.THIS]
  | [TransformType.LOOP]
  | [TransformType.REF, string]
  | [TransformType.SELECT, TransformField[]];

function findTransformsInternal(
  schemaOrRef: SchemaObject | ReferenceObject,
  currentField: TransformField,
  isTransformableLeaf: (schema: SchemaObject) => boolean,
): TransformField[] {
  if (schemaOrRef.$ref) {
    currentField.push([
      TransformType.REF,
      schemaOrRef.$ref.replace(/^#\/components\/schemas\//, ''),
    ]);
    return [currentField];
  }
  const schema = schemaOrRef as SchemaObject;

  if (isTransformableLeaf(schema)) {
    currentField.push([TransformType.THIS]);
    return [currentField];
  }

  if (schema.type === 'object' && schema.properties) {
    return Object.entries(schema.properties).flatMap(([key, subSchema]) => {
      const currentFieldCopy = [...currentField];
      currentFieldCopy.push([TransformType.ACCESS, key]);
      return findTransformsInternal(
        subSchema,
        currentFieldCopy,
        isTransformableLeaf,
      );
    });
  }

  // TODO Additional properties

  if (schema.type === 'array' && schema.items) {
    currentField.push([TransformType.LOOP]);
    return findTransformsInternal(
      schema.items,
      currentField,
      isTransformableLeaf,
    );
  }

  if (schema.oneOf || schema.anyOf || schema.allOf) {
    const arr = schema.oneOf || schema.anyOf || schema.allOf;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const subTransforms = arr!.flatMap(
      (subSchema: SchemaObject | ReferenceObject) =>
        findTransformsInternal(subSchema, [], isTransformableLeaf),
    );
    if (subTransforms.length) {
      currentField.push([TransformType.SELECT, subTransforms]);
    }
    return [currentField];
  }

  return [];
}

export function findLeafTransforms(
  schema: SchemaObject | ReferenceObject,
  isTransformableLeaf: (schema: SchemaObject) => boolean,
): TransformField[] {
  return findTransformsInternal(schema, [], isTransformableLeaf);
}
