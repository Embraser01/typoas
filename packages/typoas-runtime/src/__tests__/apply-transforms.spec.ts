import { describe, expect, it } from '@jest/globals';
import { applyTransforms } from '../apply-transforms';
import { RefResolver } from '../resolver';

describe('apply transforms', () => {
  const resolver = new RefResolver({
    A: { type: 'string' },
    B: { type: 'string', format: 'date-time' },
  });

  it('should handle undefined and null', () => {
    expect(applyTransforms(undefined, {}, resolver)).toEqual(undefined);
    expect(applyTransforms(null, {}, resolver)).toEqual(null);
  });

  it('should transform Date type', () => {
    const date = new Date('2020-02-02');

    expect(
      applyTransforms(
        date.toISOString(),
        { type: 'string', format: 'date-time' },
        resolver,
      ),
    ).toEqual(date);

    expect(
      applyTransforms(date.toISOString(), { type: 'string' }, resolver),
    ).toEqual(date.toISOString());
  });

  it('should handle refs', () => {
    const date = new Date('2020-02-02');

    expect(
      applyTransforms(
        date.toISOString(),
        { $ref: '#/components/schemas/B' },
        resolver,
      ),
    ).toEqual(date);
  });

  it('should handle undefined ref (no change)', () => {
    const date = new Date('2020-02-02');

    expect(
      applyTransforms(
        date.toISOString(),
        { $ref: '#/components/schemas/Unknown' },
        resolver,
      ),
    ).toEqual(date.toISOString());
  });

  it('should handle arrays of dates', () => {
    const date = new Date();

    expect(
      applyTransforms(
        [date.toISOString(), date.toISOString()],
        {
          type: 'array',
          items: { type: 'string', format: 'date-time' },
        },
        resolver,
      ),
    ).toEqual([date, date]);
  });

  it('should handle arrays of nested dates', () => {
    const date = new Date();

    expect(
      applyTransforms(
        [{ d: date.toISOString() }, { d: date.toISOString() }],
        {
          type: 'array',
          items: {
            type: 'object',
            properties: { d: { type: 'string', format: 'date-time' } },
          },
        },
        resolver,
      ),
    ).toEqual([{ d: date }, { d: date }]);
  });

  it('should handle anyOf usage', () => {
    const date = new Date();

    expect(
      applyTransforms(
        [{ d: date.toISOString() }, date.toISOString()],
        {
          type: 'array',
          items: {
            anyOf: [
              {
                type: 'object',
                properties: { d: { type: 'string', format: 'date-time' } },
              },
              { type: 'string', format: 'date-time' },
            ],
          },
        },
        resolver,
      ),
    ).toEqual([{ d: date }, date]);
  });

  it('should handle oneOf usage', () => {
    const date = new Date();

    expect(
      applyTransforms(
        [{ d: date.toISOString() }, date.toISOString()],
        {
          type: 'array',
          items: {
            oneOf: [
              {
                type: 'object',
                properties: { d: { type: 'string', format: 'date-time' } },
              },
              { type: 'string', format: 'date-time' },
            ],
          },
        },
        resolver,
      ),
    ).toEqual([{ d: date }, date]);
  });

  it('should handle allOf usage', () => {
    const date = new Date();
    expect(
      applyTransforms(
        { d: date.toISOString(), a: date.toISOString() },
        {
          allOf: [
            {
              type: 'object',
              properties: { d: { type: 'string', format: 'date-time' } },
            },
            {
              type: 'object',
              properties: { a: { type: 'string', format: 'date-time' } },
            },
          ],
        },
        resolver,
      ),
    ).toEqual({ d: date, a: date });
  });

  it('should handle case where additionalProperties is set but not properties', () => {
    const date = new Date();
    expect(
      applyTransforms(
        { d: date.toISOString(), a: date.toISOString() },
        {
          additionalProperties: { type: 'string', format: 'date-time' },
        },
        resolver,
      ),
    ).toEqual({ d: date, a: date });
  });
});
