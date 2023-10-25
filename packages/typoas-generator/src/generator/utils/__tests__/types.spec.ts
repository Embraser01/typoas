import { describe, expect, it } from '@jest/globals';
import { ReferenceObject, SchemaObject } from 'openapi3-ts/oas31';
import { SchemaObject as SchemaObjectOAS30 } from 'openapi3-ts/oas30';
import { getStringFromNode } from '../ts-node';
import { createTypeFromSchema } from '../types';
import { Context } from '../../../context';

describe('create type from schema', () => {
  it('should handle integer schema', () => {
    const schema: SchemaObject = { type: 'integer' };

    const node = createTypeFromSchema(schema, new Context());

    expect(getStringFromNode(node)).toMatchSnapshot();
  });

  it('should handle primitive number schema', () => {
    const schema: SchemaObject = { type: 'number' };

    const node = createTypeFromSchema(schema, new Context());

    expect(getStringFromNode(node)).toMatchSnapshot();
  });

  it('should handle primitive string schema', () => {
    const schema: SchemaObject = { type: 'string' };

    const node = createTypeFromSchema(schema, new Context());

    expect(getStringFromNode(node)).toMatchSnapshot();
  });

  it('should handle primitive boolean schema', () => {
    const schema: SchemaObject = { type: 'boolean' };

    const node = createTypeFromSchema(schema, new Context());

    expect(getStringFromNode(node)).toMatchSnapshot();
  });

  it('should handle primitive boolean enums', () => {
    const schema: SchemaObject = { type: 'boolean', enum: [true] };

    const node = createTypeFromSchema(schema, new Context());

    expect(getStringFromNode(node)).toMatchSnapshot();
  });

  it('should handle primitive string enums', () => {
    const schema: SchemaObject = { type: 'string', enum: ['a', 'b'] };

    const node = createTypeFromSchema(schema, new Context());

    expect(getStringFromNode(node)).toMatchSnapshot();
  });

  it('should handle type as an array', () => {
    const schema: SchemaObject = { type: ['string', 'number'] };

    const node = createTypeFromSchema(schema, new Context());

    expect(getStringFromNode(node)).toMatchSnapshot();
  });

  it('should handle const string', () => {
    // @ts-expect-error const is not supported by openapi3, but we still
    // have support for it
    const schema: SchemaObject = { type: 'string', const: 'a' };

    const node = createTypeFromSchema(schema, new Context());

    expect(getStringFromNode(node)).toMatchSnapshot();
  });

  it('should handle primitive number enums', () => {
    const schema: SchemaObject = { type: 'number', enum: [1, 6] };

    const node = createTypeFromSchema(schema, new Context());

    expect(getStringFromNode(node)).toMatchSnapshot();
  });

  it('should handle dates', () => {
    const schema: SchemaObject = { type: 'string', format: 'date-time' };

    const node = createTypeFromSchema(schema, new Context());

    expect(getStringFromNode(node)).toMatchSnapshot();
  });

  it('should handle array of strings', () => {
    const schema: SchemaObject = { type: 'array', items: { type: 'string' } };

    const node = createTypeFromSchema(schema, new Context());

    expect(getStringFromNode(node)).toMatchSnapshot();
  });

  it('should handle simple object schema', () => {
    const schema: SchemaObject = {
      type: 'object',
      required: ['a'],
      properties: {
        a: { type: 'string' },
        b: { type: 'number' },
      },
    };

    const node = createTypeFromSchema(schema, new Context());
    expect(getStringFromNode(node)).toMatchSnapshot();
  });

  it('should handle object schema without properties', () => {
    const schema: SchemaObject = {
      type: 'object',
      additionalProperties: true,
    };

    const node = createTypeFromSchema(schema, new Context());
    expect(getStringFromNode(node)).toMatchSnapshot();
  });

  it('should handle objects with special named properties', () => {
    const schema: SchemaObject = {
      type: 'object',
      required: ['a'],
      properties: {
        '^Test^': { type: 'string' },
        await: { type: 'string' },
        b: { type: 'number' },
        ʱ: { type: 'number' },
        _1: { type: 'number' },
        1: { type: 'number' },
        'page[number]': { type: 'number' },
      },
    };

    const node = createTypeFromSchema(schema, new Context());
    expect(getStringFromNode(node)).toMatchSnapshot();
  });

  describe('with complex object', () => {
    it('should create nested objects', () => {
      const schema: SchemaObject = {
        type: 'object',
        required: ['a'],
        properties: {
          a: { type: 'string' },
          b: { type: 'number' },
          c: {
            type: 'object',
            properties: {
              d: { type: 'string' },
              e: {
                type: 'object',
                properties: {
                  f: { type: 'number' },
                },
              },
            },
          },
        },
      };

      const node = createTypeFromSchema(schema, new Context());
      expect(getStringFromNode(node)).toMatchSnapshot();
    });

    it('should allow additional properties if set to true', () => {
      const schema: SchemaObject = {
        type: 'object',
        required: ['a'],
        additionalProperties: true,
        properties: {
          a: { type: 'string' },
          b: { type: 'number' },
        },
      };

      const node = createTypeFromSchema(schema, new Context());
      expect(getStringFromNode(node)).toMatchSnapshot();
    });

    it('should handle additionalProperties specific type', () => {
      const schema: SchemaObject = {
        type: 'object',
        additionalProperties: {
          type: 'object',
          properties: { a: { type: 'string' } },
        },
      };

      const node = createTypeFromSchema(schema, new Context());
      expect(getStringFromNode(node)).toMatchSnapshot();
    });

    it('should handle anyOf', () => {
      const schema: SchemaObject = {
        anyOf: [
          { type: 'string' },
          { type: 'array', items: { type: 'string' } },
        ],
      };

      const node = createTypeFromSchema(schema, new Context());
      expect(getStringFromNode(node)).toMatchSnapshot();
    });

    it('should handle allOf', () => {
      const schema: SchemaObject = {
        allOf: [
          {
            type: 'object',
            properties: {
              a: { type: 'string' },
            },
          },
          {
            type: 'object',
            properties: {
              b: { type: 'integer' },
            },
          },
        ],
      };

      const node = createTypeFromSchema(schema, new Context());
      expect(getStringFromNode(node)).toMatchSnapshot();
    });

    it('should handle nullable props', () => {
      const schema: SchemaObjectOAS30 = { type: 'integer', nullable: true };

      const node = createTypeFromSchema(schema, new Context());

      expect(getStringFromNode(node)).toMatchSnapshot();
    });

    it('should handle oneOf', () => {
      const schema: SchemaObject = {
        anyOf: [
          { type: 'string' },
          { type: 'array', items: { type: 'string' } },
        ],
      };

      const node = createTypeFromSchema(schema, new Context());
      expect(getStringFromNode(node)).toMatchSnapshot();
    });
  });

  describe('with refs', () => {
    it('should work referencing ref', () => {
      const ctx = new Context();
      ctx.initComponents({ schemas: { BaseItem: { type: 'string' } } });

      const schema: ReferenceObject = { $ref: '#/components/schemas/BaseItem' };

      const node = createTypeFromSchema(schema, ctx);
      expect(getStringFromNode(node)).toMatchSnapshot();
    });

    it('should work in nested properties', () => {
      const ctx = new Context();
      ctx.initComponents({ schemas: { BaseItem: { type: 'string' } } });

      const schema: SchemaObject = {
        type: 'object',
        properties: {
          a: { $ref: '#/components/schemas/BaseItem' },
        },
      };

      const node = createTypeFromSchema(schema, ctx);
      expect(getStringFromNode(node)).toMatchSnapshot();
    });
  });
});
