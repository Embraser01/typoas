import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { resolve } from 'node:path';
import { OpenAPIObject } from 'openapi3-ts/oas31';
import { getStringFromNode } from '../generator/utils/ts-node.js';
import { generateClient } from '../index.js';

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

  it('should allow overrides if possible', () => {
    const specs = JSON.parse(
      readFileSync(resolve(__dirname, './spec-with-overrides.json'), 'utf8'),
    ) as OpenAPIObject;

    const node = generateClient(specs, {
      jsDoc: false,
      generateEnums: true,
      overrides: {
        import: './overrides',
        list: ['PetStatus'],
      },
    });

    expect(getStringFromNode(node)).toMatchSnapshot();
  });

  it('should handle deep refs transforms', () => {
    const specs = JSON.parse(
      readFileSync(resolve(__dirname, './spec-deep-refs.json'), 'utf8'),
    ) as OpenAPIObject;

    const node = generateClient(specs, {
      jsDoc: false,
      generateEnums: true,
    });

    expect(getStringFromNode(node)).toMatchSnapshot();
  });
});
