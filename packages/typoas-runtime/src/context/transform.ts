export enum TransformType {
  ACCESS = 'access',
  THIS = 'this',
  LOOP = 'loop',
  SELECT = 'select',
}

export type TransformField = TransformLevel[];
export type TransformLevel =
  | { type: TransformType.ACCESS; key: string }
  | { type: TransformType.THIS }
  | { type: TransformType.LOOP }
  | { type: TransformType.SELECT; subTransforms: TransformField[] };

export type Transform<T, U> = (val: T) => U;

function isPlainObject(value: unknown): value is object {
  return (
    value !== null &&
    typeof value === 'object' &&
    Array.isArray(value) === false
  );
}

export function applyTransform<T, U>(
  parent: Record<string, unknown>,
  dataKey: string | number,
  transformer: Transform<T, U>,
  transformField: TransformField,
  index: number,
) {
  const transformLevel = transformField[index];

  switch (transformLevel.type) {
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
        parent[dataKey] as Record<string, unknown>,
        transformLevel.key,
        transformer,
        transformField,
        index + 1,
      );
      break;
    case TransformType.SELECT:
      for (const subTransformField of transformLevel.subTransforms) {
        applyTransform(parent, dataKey, transformer, subTransformField, 0);
      }
      break;
    case TransformType.LOOP: {
      if (!Array.isArray(parent[dataKey])) {
        return;
      }
      const cast = parent[dataKey] as unknown[];
      for (let i = 0; i < cast.length; i += 1) {
        applyTransform(
          cast as Record<number, unknown>,
          i,
          transformer,
          transformField,
          index + 1,
        );
      }
      break;
    }
  }
}
