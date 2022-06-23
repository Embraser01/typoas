import { describe, expect, it } from '@jest/globals';
import { getSchemaTransforms } from '../index';
import { TransformType } from '../leaf-transformer-base';

describe('getSchemaTransforms', () => {
  it('should handle simple date', () => {
    expect(
      getSchemaTransforms({ type: 'string', format: 'date-time' }),
    ).toEqual({ date: [[[TransformType.THIS]]] });
  });

  it('should handle simple objects', () => {
    expect(
      getSchemaTransforms({
        type: 'object',
        properties: { a: { type: 'string', format: 'date-time' } },
      }),
    ).toEqual({ date: [[[TransformType.ACCESS, 'a'], [TransformType.THIS]]] });
  });

  it('should handle array of objects', () => {
    expect(
      getSchemaTransforms({
        type: 'array',
        items: { type: 'string', format: 'date-time' },
      }),
    ).toEqual({ date: [[[TransformType.LOOP], [TransformType.THIS]]] });
  });

  it('should handle additionalProperties', () => {
    expect(
      getSchemaTransforms({
        type: 'object',
        additionalProperties: { type: 'string', format: 'date-time' },
      }),
    ).toEqual({ date: [[[TransformType.ENTRIES], [TransformType.THIS]]] });
  });

  it('should handle deep additionalProperties', () => {
    expect(
      getSchemaTransforms({
        type: 'object',
        additionalProperties: {
          type: 'object',
          properties: { a: { type: 'string', format: 'date-time' } },
        },
      }),
    ).toEqual({
      date: [
        [
          [TransformType.ENTRIES],
          [TransformType.ACCESS, 'a'],
          [TransformType.THIS],
        ],
      ],
    });
  });

  it('should handle anyOf ', () => {
    expect(
      getSchemaTransforms({
        anyOf: [
          { type: 'string', format: 'date-time' },
          {
            type: 'object',
            properties: { d: { type: 'string', format: 'date-time' } },
          },
        ],
      }),
    ).toEqual({
      date: [
        [
          [
            TransformType.SELECT,
            [
              [[TransformType.THIS]],
              [[TransformType.ACCESS, 'd'], [TransformType.THIS]],
            ],
          ],
        ],
      ],
    });
  });

  it('should handle allOf ', () => {
    expect(
      getSchemaTransforms({
        allOf: [
          { type: 'string', format: 'date-time' },
          {
            type: 'object',
            properties: { d: { type: 'string', format: 'date-time' } },
          },
        ],
      }),
    ).toEqual({
      date: [
        [
          [
            TransformType.SELECT,
            [
              [[TransformType.THIS]],
              [[TransformType.ACCESS, 'd'], [TransformType.THIS]],
            ],
          ],
        ],
      ],
    });
  });

  it('should handle oneOf ', () => {
    expect(
      getSchemaTransforms({
        oneOf: [
          { type: 'string', format: 'date-time' },
          {
            type: 'object',
            properties: { d: { type: 'string', format: 'date-time' } },
          },
        ],
      }),
    ).toEqual({
      date: [
        [
          [
            TransformType.SELECT,
            [
              [[TransformType.THIS]],
              [[TransformType.ACCESS, 'd'], [TransformType.THIS]],
            ],
          ],
        ],
      ],
    });
  });
});
