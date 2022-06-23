import { readFileSync } from 'fs';
import { describe, expect, it } from '@jest/globals';
import { resolve } from 'path';
import { OpenAPIObject } from 'openapi3-ts';
import { getStringFromNode } from '../generator/utils/ts-node';
import { generateClient } from '../index';

describe('create full specs', () => {
  it('should generate client', () => {
    const specs = JSON.parse(
      readFileSync(resolve(__dirname, '../../samples/petstore.json'), 'utf8'),
    ) as OpenAPIObject;

    const node = generateClient(specs, { jsDoc: false });

    expect(getStringFromNode(node)).toMatchSnapshot();
  });

  it('should generate enums if possible', () => {
    const specs = JSON.parse(
      readFileSync(resolve(__dirname, './spec-with-enums.json'), 'utf8'),
    ) as OpenAPIObject;

    const node = generateClient(specs, {
      jsDoc: false,
      generateEnums: true,
    });

    expect(getStringFromNode(node)).toMatchSnapshot();
  });
});
