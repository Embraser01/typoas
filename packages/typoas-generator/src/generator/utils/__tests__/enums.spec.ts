import { describe, expect, it } from '@jest/globals';
import { SchemaObject } from 'openapi3-ts';
import { factory, SyntaxKind } from 'typescript';
import { canConvertSchemaToEnum, createEnumMembersFromSchema } from '../enums';
import { getStringFromNode } from '../ts-node';

describe('canConvertSchemaToEnum', () => {
  it('should handle string schema', () => {
    const schema: SchemaObject = { type: 'string', enum: ['a', 'b', 'c'] };
    expect(canConvertSchemaToEnum(schema)).toBe(true);
  });

  it('should not handle string schema without enum', () => {
    const schema: SchemaObject = { type: 'string' };
    expect(canConvertSchemaToEnum(schema)).toBe(false);
  });

  it('should not handle non string schemas', () => {
    const schema: SchemaObject = { type: 'number', enum: [2, 4, 7] };
    expect(canConvertSchemaToEnum(schema)).toBe(false);
  });

  it('should not handle enums with null or empty values', () => {
    const schema: SchemaObject = { type: 'string', enum: [null, 'test'] };
    expect(canConvertSchemaToEnum(schema)).toBe(false);
  });

  it('should not handle nullable enums', () => {
    const schema: SchemaObject = {
      type: 'string',
      enum: ['a', 'test'],
      nullable: true,
    };
    expect(canConvertSchemaToEnum(schema)).toBe(false);
  });
});

describe('createEnumMembersFromSchema', () => {
  it('should handle string schema', () => {
    const schema: SchemaObject = {
      type: 'string',
      enum: ['dog-and-cat', 'dog', 'catWithoutDog'],
    };
    const node = factory.createEnumDeclaration(
      [factory.createModifier(SyntaxKind.ExportKeyword)],
      factory.createIdentifier('Test'),
      createEnumMembersFromSchema(schema),
    );
    expect(getStringFromNode(node)).toMatchSnapshot();
  });

  it('should handle enum with special chars in it', () => {
    const schema: SchemaObject = {
      type: 'string',
      enum: ['my:complex:enum', 'and:this/one'],
    };
    const node = factory.createEnumDeclaration(
      [factory.createModifier(SyntaxKind.ExportKeyword)],
      factory.createIdentifier('Test'),
      createEnumMembersFromSchema(schema),
    );
    expect(getStringFromNode(node)).toMatchSnapshot();
  });
});
