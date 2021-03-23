function lowerCase(str: string) {
  return str.toLowerCase();
}

function upperCase(str: string) {
  return str.toUpperCase();
}

/**
 * Convert string to camelCase text.
 */
function camelCase(str: string): string {
  return str
    .replace(/[-./]/g, ' ') //convert all hyphens to spaces
    .replace(/\s[a-z]/g, upperCase) //convert first char of each word to UPPERCASE
    .replace(/\s+/g, '') //remove spaces
    .replace(/^[A-Z]/g, lowerCase); //convert first char to lowercase
}

function pascalCase(str: string): string {
  return camelCase(str).replace(/^[a-z]/, upperCase);
}

export function hasUnsupportedIdentifierChar(key: string): boolean {
  return /[-/.+@]/.test(key);
}

export function sanitizeOperationIdName(op: string): string {
  return camelCase(op);
}

export function sanitizeTypeIdentifier(type: string): string {
  return pascalCase(type);
}
