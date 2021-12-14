/**
 * Returns if a specific http code is in a given code range
 * where the code range is defined as a combination of digits
 * and "X" (the letter X) with a length of 3
 *
 * @param codeRange string with length 3 consisting of digits and "X" (the letter X)
 * @param code the http status code to be checked against the code range
 */
export function isCodeInRange(codeRange: string, code: number): boolean {
  if (codeRange === 'default') {
    return true;
  }
  if (codeRange == code.toString()) {
    return true;
  }

  const codeString = code.toString();
  if (codeString.length != codeRange.length) {
    return false;
  }
  for (let i = 0; i < codeString.length; i++) {
    if (
      codeRange.charAt(i) != 'X' &&
      codeRange.charAt(i) != codeString.charAt(i)
    ) {
      return false;
    }
  }
  return true;
}

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
