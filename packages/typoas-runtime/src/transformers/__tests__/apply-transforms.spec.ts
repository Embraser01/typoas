import { describe, expect, it } from '@jest/globals';
import { RefResolver } from '../../resolver';
import { applyTransform, DateTransformer, TransformType } from '../';

describe('apply transforms', () => {
  const resolver = new RefResolver({
    A: { date: [[[TransformType.ACCESS, 'date'], [TransformType.THIS]]] },
    B: { date: [[[TransformType.THIS]]] },
  });

  const transform = DateTransformer;

  it('should handle undefined', () => {
    const data = { body: undefined };
    applyTransform(
      resolver,
      data,
      'body',
      'date',
      transform,
      [[TransformType.THIS]],
      0,
    );
    expect(data.body).toEqual(undefined);
  });

  it('should handle null', () => {
    const data = { body: null };
    applyTransform(
      resolver,
      data,
      'body',
      'date',
      transform,
      [[TransformType.THIS]],
      0,
    );
    expect(data.body).toEqual(null);
  });

  it('should transform Date type', () => {
    const date = new Date('2020-02-02');

    const data = { body: date.toISOString() };
    applyTransform(
      resolver,
      data,
      'body',
      'date',
      transform,
      [[TransformType.THIS]],
      0,
    );
    expect(data.body).toEqual(date);
  });

  it('should handle refs', () => {
    const date = new Date('2020-02-02');

    const data = { body: date.toISOString() };
    applyTransform(
      resolver,
      data,
      'body',
      'date',
      transform,
      [[TransformType.REF, 'B']],
      0,
    );
    expect(data.body).toEqual(date);
  });

  it('should handle undefined ref (no change)', () => {
    const date = new Date('2020-02-02');

    const data = { body: date.toISOString() };
    applyTransform(
      resolver,
      data,
      'body',
      'date',
      transform,
      [[TransformType.REF, 'Unknown']],
      0,
    );
    expect(data.body).toEqual(date.toISOString());
  });

  it('should handle arrays of dates', () => {
    const date = new Date();

    const data = {
      body: [date.toISOString(), date.toISOString(), date.toISOString()],
    };

    applyTransform(
      resolver,
      data,
      'body',
      'date',
      transform,
      [[TransformType.LOOP], [TransformType.THIS]],
      0,
    );
    expect(data.body).toEqual([date, date, date]);
  });

  it('should handle arrays of nested dates', () => {
    const date = new Date();

    const data = {
      body: [{ d: date.toISOString() }, { d: date.toISOString() }],
    };

    applyTransform(
      resolver,
      data,
      'body',
      'date',
      transform,
      [[TransformType.LOOP], [TransformType.ACCESS, 'd'], [TransformType.THIS]],
      0,
    );
    expect(data.body).toEqual([{ d: date }, { d: date }]);
  });

  it('should handle entries of dates', () => {
    const date = new Date();

    const data = {
      body: { a: date.toISOString(), d: date.toISOString() },
    };

    applyTransform(
      resolver,
      data,
      'body',
      'date',
      transform,
      [[TransformType.ENTRIES], [TransformType.THIS]],
      0,
    );
    expect(data.body).toEqual({ a: date, d: date });
  });

  it('should handle entries of nested dates', () => {
    const date = new Date();

    const data = {
      body: {
        a: { b: date.toISOString() },
        d: { b: date.toISOString() },
      },
    };

    applyTransform(
      resolver,
      data,
      'body',
      'date',
      transform,
      [
        [TransformType.ENTRIES],
        [TransformType.ACCESS, 'b'],
        [TransformType.THIS],
      ],
      0,
    );
    expect(data.body).toEqual({ a: { b: date }, d: { b: date } });
  });

  it('should handle selection (anyOf, oneOf, ...)', () => {
    const date = new Date();

    const data = {
      body: [{ d: date.toISOString() }, date.toISOString()],
    };

    applyTransform(
      resolver,
      data,
      'body',
      'date',
      transform,
      [
        [TransformType.LOOP],
        [
          TransformType.SELECT,
          [
            [[TransformType.ACCESS, 'd'], [TransformType.THIS]],
            [[TransformType.THIS]],
          ],
        ],
      ],
      0,
    );
    expect(data.body).toEqual([{ d: date }, date]);
  });
});
