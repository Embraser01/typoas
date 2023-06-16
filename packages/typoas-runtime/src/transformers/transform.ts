export type TransformEntity = Record<string, TransformField[]>;
export type TransformField = TransformLevel[];
export type TransformLevel =
  | ['access', string]
  | ['this']
  | ['loop']
  | ['entries']
  | ['ref', () => TransformField[]]
  | ['select', TransformField[]];

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
  transformerName: string,
  transformer: Transform<T, U>,
  transformField: TransformField,
  index: number,
) {
  const transformLevel = transformField[index];

  switch (transformLevel[0]) {
    case 'this': {
      if (!isPlainObject(parent) && !Array.isArray(parent)) {
        return;
      }
      // eslint-disable-next-line no-prototype-builtins
      if (parent.hasOwnProperty(dataKey)) {
        parent[dataKey] = transformer(parent[dataKey] as T);
      }
      break;
    }

    case 'access':
      if (!isPlainObject(parent[dataKey])) {
        return;
      }
      applyTransform(
        parent[dataKey] as Record<string, unknown>,
        transformLevel[1],
        transformerName,
        transformer,
        transformField,
        index + 1,
      );
      break;
    case 'select':
      for (const subTransformField of transformLevel[1]) {
        applyTransform(
          parent,
          dataKey,
          transformerName,
          transformer,
          subTransformField,
          0,
        );
      }
      break;
    case 'loop': {
      if (!Array.isArray(parent[dataKey])) {
        return;
      }
      const cast = parent[dataKey] as unknown[];
      for (let i = 0; i < cast.length; i += 1) {
        applyTransform(
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
    case 'entries': {
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
    case 'ref': {
      for (const subTransformField of transformLevel[1]()) {
        applyTransform(
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
