import { describe, expect, it } from '@jest/globals';
import { factory, SyntaxKind } from 'typescript';
import { getStringFromNode } from '../../utils/ts-node';
import { addJSDocToNode } from '../fields';

describe('jsdoc on fields', () => {
  it('should add a simple jsdoc comment to a node', () => {
    const node = factory.createTypeAliasDeclaration(
      undefined,
      [factory.createModifier(SyntaxKind.ExportKeyword)],
      factory.createIdentifier('MyType'),
      undefined,
      factory.createKeywordTypeNode(SyntaxKind.AnyKeyword),
    );

    addJSDocToNode(node);

    expect(getStringFromNode(node)).toMatchSnapshot();
  });
});
