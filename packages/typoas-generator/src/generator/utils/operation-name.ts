import { upperFirst, words } from 'lodash';

function customWords(str: string): string[] {
  const lWords = words(str);
  for (let i = 0; i < lWords.length; i++) {
    const w = lWords[i];

    // Merge cases like UserV2 but not countTo3
    const isNumber = i && /^\d+$/.test(w) && /^[A-Z]+$/.test(lWords[i - 1]);

    // Merge number to previous word
    if (isNumber) {
      lWords[i - 1] += w;
      lWords.splice(i, 1);
      i--;
    }
  }
  return lWords;
}

function pascalCase(str: string): string {
  return customWords(str).reduce((result, word) => {
    word = word.toLowerCase();
    return result + upperFirst(word);
  }, '');
}

function removeUnsupportedChars(str: string): string {
  return str.replace(/[-/.+@\s:]/g, ' '); //convert all unsupported char to spaces
}

export function hasUnsupportedIdentifierChar(key: string): boolean {
  return /[-/.+@\s:]/.test(key);
}

export function screamingSnakeCase(str: string): string {
  return customWords(removeUnsupportedChars(str)).reduce(
    (result, word, index) => result + (index ? '_' : '') + word.toUpperCase(),
    '',
  );
}

export function sanitizeOperationIdName(op: string): string {
  return customWords(removeUnsupportedChars(op)).reduce(
    (result, word, index) => {
      word = word.toLowerCase();
      return result + (index ? upperFirst(word) : word);
    },
    '',
  );
}

export function sanitizeTypeIdentifier(type: string): string {
  return pascalCase(removeUnsupportedChars(type));
}
