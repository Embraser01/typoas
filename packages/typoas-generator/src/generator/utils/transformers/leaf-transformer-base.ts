import {
  isReferenceObject,
  ReferenceObject,
  SchemaObject,
} from 'openapi3-ts/oas31';
import { sanitizeTransformEntity } from '../operation-name';

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

export enum TransformerType {
  DATE = 'date',
}

export type TransformField = TransformLevel[];
export type TransformLevel =
  | [TransformType.ACCESS, string]
  | [TransformType.THIS]
  | [TransformType.LOOP]
  | [TransformType.ENTRIES]
  | [TransformType.REF, string]
  | [TransformType.SELECT, TransformField[]];

export type IsTransformableLeafCb = (schema: SchemaObject) => boolean;
export type SkipRefCb = (name: string, type: TransformerType) => boolean;

function findTransformsInternal(
  type: TransformerType,
  schema: SchemaObject | ReferenceObject,
  currentField: TransformField,
  isTransformableLeaf: IsTransformableLeafCb,
  skipRef: SkipRefCb,
): TransformField[] {
  if (isReferenceObject(schema)) {
    const name = schema.$ref.replace(/^#\/components\/schemas\//, '');
    if (skipRef(name, type)) {
      return [];
    }
    currentField.push([TransformType.REF, sanitizeTransformEntity(type, name)]);
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
        type,
        subSchema,
        currentFieldCopy,
        isTransformableLeaf,
        skipRef,
      );
    });
  }

  if (typeof schema.additionalProperties === 'object') {
    currentField.push([TransformType.ENTRIES]);
    return findTransformsInternal(
      type,
      schema.additionalProperties,
      currentField,
      isTransformableLeaf,
      skipRef,
    );
  }

  if (schema.type === 'array' && schema.items) {
    currentField.push([TransformType.LOOP]);
    return findTransformsInternal(
      type,
      schema.items,
      currentField,
      isTransformableLeaf,
      skipRef,
    );
  }

  if (schema.oneOf || schema.anyOf || schema.allOf) {
    const arr = schema.oneOf || schema.anyOf || schema.allOf;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const subTransforms = arr!.flatMap(
      (subSchema: SchemaObject | ReferenceObject) =>
        findTransformsInternal(
          type,
          subSchema,
          [],
          isTransformableLeaf,
          skipRef,
        ),
    );
    if (subTransforms.length) {
      currentField.push([TransformType.SELECT, subTransforms]);
      if (currentField.length) {
        return [currentField];
      }
    }
    return [];
  }

  return [];
}

export function findLeafTransforms(
  type: TransformerType,
  schema: SchemaObject | ReferenceObject,
  isTransformableLeaf: IsTransformableLeafCb,
  skipRef: SkipRefCb = () => false,
): TransformField[] {
  return findTransformsInternal(type, schema, [], isTransformableLeaf, skipRef);
}
