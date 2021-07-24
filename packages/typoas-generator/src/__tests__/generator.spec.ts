import { readFileSync } from 'fs';
import { describe, expect, it } from '@jest/globals';
import { Context } from '../context';
import { createClient } from '../generator/api/client';
import { resolve } from 'path';
import { OpenAPIObject } from 'openapi3-ts';
import { getStringFromNode } from '../generator/utils/ts-node';

describe('create full specs', () => {
  it('should generate client', () => {
    const specs = JSON.parse(
      readFileSync(resolve(__dirname, '../../samples/petstore.json'), 'utf8'),
    ) as OpenAPIObject;
    const context = new Context({ jsDoc: false });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    context.initComponents(specs.components!);

    const node = createClient(specs, 'PetStoreClient', context);

    expect(getStringFromNode(node)).toMatchSnapshot();
  });
});
