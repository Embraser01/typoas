export enum TransformType {
  ACCESS = 'access',
  THIS = 'this',
  LOOP = 'loop',
  ENTRIES = 'entries',
  SELECT = 'select',
  REF = 'ref',
}

export interface TransformResolver {
  getTransforms(type: string, ref: string): TransformField[];
}

export type TransformField = TransformLevel[];
export type TransformLevel =
  | [TransformType.ACCESS, string]
  | [TransformType.THIS]
  | [TransformType.LOOP]
  | [TransformType.ENTRIES]
  | [TransformType.REF, string]
  | [TransformType.SELECT, TransformField[]];

export type Transform<T, U> = (val: T) => U;

function isPlainObject(value: unknown): value is object {
  return (
    value !== null &&
    typeof value === 'object' &&
    Array.isArray(value) === false
  );
}

export function applyTransform<T, U>(
  resolver: TransformResolver,
  parent: Record<string, unknown>,
  dataKey: string | number,
  transformerName: string,
  transformer: Transform<T, U>,
  transformField: TransformField,
  index: number,
) {
  const transformLevel = transformField[index];

  switch (transformLevel[0]) {
    case TransformType.THIS: {
      if (!isPlainObject(parent) && !Array.isArray(parent)) {
        return;
      }
      // eslint-disable-next-line no-prototype-builtins
      if (parent.hasOwnProperty(dataKey)) {
        parent[dataKey] = transformer(parent[dataKey] as T);
      }
      break;
    }

    case TransformType.ACCESS:
      if (!isPlainObject(parent[dataKey])) {
        return;
      }
      applyTransform(
        resolver,
        parent[dataKey] as Record<string, unknown>,
        transformLevel[1],
        transformerName,
        transformer,
        transformField,
        index + 1,
      );
      break;
    case TransformType.SELECT:
      for (const subTransformField of transformLevel[1]) {
        applyTransform(
          resolver,
          parent,
          dataKey,
          transformerName,
          transformer,
          subTransformField,
          0,
        );
      }
      break;
    case TransformType.LOOP: {
      if (!Array.isArray(parent[dataKey])) {
        return;
      }
      const cast = parent[dataKey] as unknown[];
      for (let i = 0; i < cast.length; i += 1) {
        applyTransform(
          resolver,
          cast as Record<number, unknown>,
          i,
          transformerName,
          transformer,
          transformField,
          index + 1,
        );
      }
      break;
    }
    case TransformType.ENTRIES: {
      if (
        !parent[dataKey] ||
        typeof parent[dataKey] !== 'object' ||
        Array.isArray(parent[dataKey])
      ) {
        return;
      }
      const cast = parent[dataKey] as Record<string | number, unknown>;
      for (const key of Object.keys(cast)) {
        applyTransform(
          resolver,
          cast as Record<number, unknown>,
          key,
          transformerName,
          transformer,
          transformField,
          index + 1,
        );
      }
      break;
    }

    case TransformType.REF: {
      const transforms = resolver.getTransforms(
        transformerName,
        transformLevel[1],
      );
      for (const subTransformField of transforms) {
        applyTransform(
          resolver,
          parent,
          dataKey,
          transformerName,
          transformer,
          subTransformField,
          0,
        );
      }
      break;
    }
  }
}
