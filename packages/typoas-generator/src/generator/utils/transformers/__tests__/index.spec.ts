import { describe, expect, it } from '@jest/globals';
import { getSchemaTransforms } from '../index';
import { TransformerType, TransformType } from '../leaf-transformer-base';

describe('getSchemaTransforms', () => {
  it('should handle simple date', () => {
    expect(
      getSchemaTransforms(TransformerType.DATE, {
        type: 'string',
        format: 'date-time',
      }),
    ).toEqual([[[TransformType.THIS]]]);
  });

  it('should handle simple objects', () => {
    expect(
      getSchemaTransforms(TransformerType.DATE, {
        type: 'object',
        properties: { a: { type: 'string', format: 'date-time' } },
      }),
    ).toEqual([[[TransformType.ACCESS, 'a'], [TransformType.THIS]]]);
  });

  it('should handle array of objects', () => {
    expect(
      getSchemaTransforms(TransformerType.DATE, {
        type: 'array',
        items: { type: 'string', format: 'date-time' },
      }),
    ).toEqual([[[TransformType.LOOP], [TransformType.THIS]]]);
  });

  it('should handle additionalProperties', () => {
    expect(
      getSchemaTransforms(TransformerType.DATE, {
        type: 'object',
        additionalProperties: { type: 'string', format: 'date-time' },
      }),
    ).toEqual([[[TransformType.ENTRIES], [TransformType.THIS]]]);
  });

  it('should handle deep additionalProperties', () => {
    expect(
      getSchemaTransforms(TransformerType.DATE, {
        type: 'object',
        additionalProperties: {
          type: 'object',
          properties: { a: { type: 'string', format: 'date-time' } },
        },
      }),
    ).toEqual([
      [
        [TransformType.ENTRIES],
        [TransformType.ACCESS, 'a'],
        [TransformType.THIS],
      ],
    ]);
  });

  it('should not generate anything if oneOf does not have transforms', () => {
    expect(
      getSchemaTransforms(TransformerType.DATE, {
        oneOf: [
          { type: 'string', format: 'password' },
          { type: 'string', format: 'byte' },
        ],
      }),
    ).toEqual([]);
  });

  it('should handle anyOf ', () => {
    expect(
      getSchemaTransforms(TransformerType.DATE, {
        anyOf: [
          { type: 'string', format: 'date-time' },
          {
            type: 'object',
            properties: { d: { type: 'string', format: 'date-time' } },
          },
        ],
      }),
    ).toEqual([
      [
        [
          TransformType.SELECT,
          [
            [[TransformType.THIS]],
            [[TransformType.ACCESS, 'd'], [TransformType.THIS]],
          ],
        ],
      ],
    ]);
  });

  it('should handle allOf ', () => {
    expect(
      getSchemaTransforms(TransformerType.DATE, {
        allOf: [
          { type: 'string', format: 'date-time' },
          {
            type: 'object',
            properties: { d: { type: 'string', format: 'date-time' } },
          },
        ],
      }),
    ).toEqual([
      [
        [
          TransformType.SELECT,
          [
            [[TransformType.THIS]],
            [[TransformType.ACCESS, 'd'], [TransformType.THIS]],
          ],
        ],
      ],
    ]);
  });

  it('should handle oneOf ', () => {
    expect(
      getSchemaTransforms(TransformerType.DATE, {
        oneOf: [
          { type: 'string', format: 'date-time' },
          {
            type: 'object',
            properties: { d: { type: 'string', format: 'date-time' } },
          },
        ],
      }),
    ).toEqual([
      [
        [
          TransformType.SELECT,
          [
            [[TransformType.THIS]],
            [[TransformType.ACCESS, 'd'], [TransformType.THIS]],
          ],
        ],
      ],
    ]);
  });
});
