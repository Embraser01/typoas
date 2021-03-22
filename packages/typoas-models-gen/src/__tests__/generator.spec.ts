import { readFileSync } from 'fs';
import { describe, expect, it } from '@jest/globals';
import {
  createPrinter,
  EmitHint,
  factory,
  NewLineKind,
  SyntaxKind,
  NodeFlags,
  Node,
} from 'typescript';
import { Context } from '../context';
import { createClient } from '../generator/api/client';
import { resolve } from 'path';
import { OpenAPIObject } from 'openapi3-ts';

const getStringFromNode = (node: Node): string => {
  const printer = createPrinter({ newLine: NewLineKind.LineFeed });
  const resultFile = factory.createSourceFile(
    [],
    factory.createToken(SyntaxKind.EndOfFileToken),
    NodeFlags.Const,
  );

  return printer.printNode(EmitHint.Unspecified, node, resultFile);
};

describe('create full specs', () => {
  it('should generate client', () => {
    const specs = JSON.parse(
      readFileSync(resolve(__dirname, '../../samples/petstore.json'), 'utf8'),
    ) as OpenAPIObject;
    const context = new Context();

    context.initComponents(specs.components!);

    const node = createClient(specs, 'PetStoreClient', context);

    expect(getStringFromNode(node)).toMatchSnapshot();
  });
});
