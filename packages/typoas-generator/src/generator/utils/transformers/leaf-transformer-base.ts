import {
  isReferenceObject,
  ReferenceObject,
  SchemaObject,
} from 'openapi3-ts/oas31';

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
  ENTRIES = 'entries',
  SELECT = 'select',
  REF = 'ref',
}

export type TransformField = TransformLevel[];
export type TransformLevel =
  | [TransformType.ACCESS, string]
  | [TransformType.THIS]
  | [TransformType.LOOP]
  | [TransformType.ENTRIES]
  | [TransformType.REF, string]
  | [TransformType.SELECT, TransformField[]];

function findTransformsInternal(
  schema: SchemaObject | ReferenceObject,
  currentField: TransformField,
  isTransformableLeaf: (schema: SchemaObject) => boolean,
): TransformField[] {
  if (isReferenceObject(schema)) {
    currentField.push([
      TransformType.REF,
      schema.$ref.replace(/^#\/components\/schemas\//, ''),
    ]);
    return [currentField];
  }

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

  if (typeof schema.additionalProperties === 'object') {
    currentField.push([TransformType.ENTRIES]);
    return findTransformsInternal(
      schema.additionalProperties,
      currentField,
      isTransformableLeaf,
    );
  }

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
    if (currentField.length) {
      return [currentField];
    }
    return [];
  }

  return [];
}

export function findLeafTransforms(
  schema: SchemaObject | ReferenceObject,
  isTransformableLeaf: (schema: SchemaObject) => boolean,
): TransformField[] {
  return findTransformsInternal(schema, [], isTransformableLeaf);
}
