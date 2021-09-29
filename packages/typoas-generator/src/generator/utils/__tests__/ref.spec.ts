import { describe, expect, it } from '@jest/globals';
import { SchemaObject } from 'openapi3-ts';
import { filterSchema } from '../ref';

describe('filter schema', () => {
  it('should handle allOf', () => {
    const schema: SchemaObject = {
      allOf: [
        {
          type: 'object',
          properties: { d: { type: 'string', title: 'ObjectD' } },
        },
        {
          type: 'object',
          properties: { a: { type: 'string', title: 'ObjectA' } },
        },
      ],
    };

    expect(filterSchema(schema)).toMatchSnapshot();
  });

  it('should handle additionalProperties', () => {
    const schema: SchemaObject = {
      type: 'object',
      additionalProperties: {
        type: 'object',
        properties: { a: { type: 'string', title: 'ObjectA' } },
      },
    };

    expect(filterSchema(schema)).toMatchSnapshot();
  });

  it('should handle additionalProperties true', () => {
    const schema: SchemaObject = {
      type: 'object',
      additionalProperties: true,
    };

    expect(filterSchema(schema)).toMatchSnapshot();
  });
});
