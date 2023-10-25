import { camelCase, snakeCase, upperFirst } from 'lodash';
import { TransformerType } from './transformers/leaf-transformer-base';
import {
  es6IdentifierRegexp,
  identifierPartRegexp,
  identifierStartRegexp,
} from './identifier-regexps';

function pascalCase(str: string): string {
  return upperFirst(camelCase(str));
}

/**
 * Transform string to valid ES6 identifier names.
 * Keywords are allowed (because always transformed to another case).
 */
function transformToValidIdentifier(str: string): string {
  let res = identifierStartRegexp.test(str[0]) ? str[0] : ' ';

  for (let i = 1; i < str.length; i++) {
    res += identifierPartRegexp.test(str[i]) ? str[i] : ' ';
  }
  return res;
}

/**
 * Check if valid ES6 identifier name (https://mathiasbynens.be/notes/javascript-identifiers-es6).
 * It allows reserved keywords, so it should be used only when property access/declaration.
 */
export function isInvalidES6IdentifierName(key: string): boolean {
  return !es6IdentifierRegexp.test(key);
}

export function screamingSnakeCase(str: string): string {
  return snakeCase(transformToValidIdentifier(str)).toUpperCase();
}

export function sanitizeOperationIdName(op: string): string {
  return camelCase(transformToValidIdentifier(op));
}

export function sanitizeTypeIdentifier(type: string): string {
  return pascalCase(transformToValidIdentifier(type));
}

export function sanitizeTransformEntity(
  type: TransformerType,
  entityName: string,
): string {
  return `$${type}_${pascalCase(entityName)}`;
}
