import { describe, expect, it } from '@jest/globals';
import { ReferenceObject, SchemaObject } from 'openapi3-ts';
import { factory, SyntaxKind } from 'typescript';
import { canConvertSchemaToEnum, createEnumMembersFromSchema } from '../enums';
import { sanitizeTypeIdentifier } from '../operation-name';
import { getStringFromNode } from '../ts-node';
import { createTypeFromSchema } from '../types';
import { Context } from '../../../context';

describe('canConvertSchemaToEnum', () => {
  it('should handle string schema', () => {
    const schema: SchemaObject = { type: 'string', enum: ['a', 'b', 'c'] };
    expect(canConvertSchemaToEnum(schema)).toMatchSnapshot();
  });

  it('should not handle string schema without enum', () => {
    const schema: SchemaObject = { type: 'string' };
    expect(canConvertSchemaToEnum(schema)).toMatchSnapshot();
  });

  it('should not handle non string schemas', () => {
    const schema: SchemaObject = { type: 'number', enum: [2, 4, 7] };
    expect(canConvertSchemaToEnum(schema)).toMatchSnapshot();
  });
});

describe('createEnumMembersFromSchema', () => {
  it('should handle string schema', () => {
    const schema: SchemaObject = { type: 'string', enum: ['a', 'b', 'c'] };
    const node = factory.createEnumDeclaration(
        undefined,
        [factory.createModifier(SyntaxKind.ExportKeyword)],
        factory.createIdentifier('Test'),
        createEnumMembersFromSchema(schema),
    );
    expect(getStringFromNode(node)).toMatchSnapshot();
  });
});
