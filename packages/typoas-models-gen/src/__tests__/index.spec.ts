import { readFileSync, writeFileSync } from 'fs';
import { describe, expect, it } from '@jest/globals';
import { createPrinter, NewLineKind, SourceFile } from 'typescript';
import { resolve } from 'path';
import { OpenAPIObject } from 'openapi3-ts';
import { generateClient } from '../index';

const getStringFromSourceFile = (src: SourceFile): string => {
  const printer = createPrinter({ newLine: NewLineKind.LineFeed });

  return printer.printFile(src);
};

describe('create full specs', () => {
  it('should generate client', () => {
    const specs = JSON.parse(
      readFileSync(
        resolve(__dirname, '../../samples/wavy-openapi.json'),
        'utf8',
      ),
    ) as OpenAPIObject;

    const src = generateClient(specs, 'PetStoreClient');

    writeFileSync('test.ts', getStringFromSourceFile(src), 'utf8');
  });
});
