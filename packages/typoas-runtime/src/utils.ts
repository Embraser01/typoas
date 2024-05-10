function anyToString(data: unknown): string {
  if (typeof data === 'string') return data;
  if (data instanceof Date) return data.toISOString();
  if (typeof data === 'number') return data.toString();
  return JSON.stringify(data);
}

export function serializeParameter(data: unknown): string | string[] {
  if (Array.isArray(data)) return data.map(anyToString);
  return anyToString(data);
}

export function serializeHeader(data: unknown): string {
  return anyToString(data);
}

export function applyTemplating(
  val: string,
  variables: Record<string, unknown>,
): string {
  return Object.entries(variables).reduce(
    (url, [key, v]) =>
      url.replace(
        new RegExp(`{${key}}`, 'g'),
        encodeURIComponent(anyToString(v)),
      ),
    val,
  );
}

export function isHttpStatusValid(status: number): boolean {
  return status >= 200 && status < 400;
}

export function isBlob(data: unknown): data is Blob {
  return data?.constructor.name === 'Blob';
}

export function isFormData(data: unknown): data is FormData {
  return data?.constructor.name === 'FormData';
}

export function isURLSearchParams(data: unknown): data is URLSearchParams {
  return data?.constructor.name === 'URLSearchParams';
}
