import { describe, expect, it } from '@jest/globals';
import { applyTransform, DateTransformer, TransformField } from '../';

describe('apply transforms', () => {
  const transform = DateTransformer;

  it('should handle undefined', () => {
    const data = { body: undefined };
    applyTransform(data, 'body', 'date', transform, [['this']], 0);
    expect(data.body).toEqual(undefined);
  });

  it('should handle null', () => {
    const data = { body: null };
    applyTransform(data, 'body', 'date', transform, [['this']], 0);
    expect(data.body).toEqual(null);
  });

  it('should transform Date type', () => {
    const date = new Date('2020-02-02');

    const data = { body: date.toISOString() };
    applyTransform(data, 'body', 'date', transform, [['this']], 0);
    expect(data.body).toEqual(date);
  });

  it('should handle refs', () => {
    const date = new Date('2020-02-02');

    const B = (): TransformField[] => [[['this']]];
    const data = { body: date.toISOString() };
    applyTransform(data, 'body', 'date', transform, [['ref', B]], 0);
    expect(data.body).toEqual(date);
  });

  it('should handle undefined ref (no change)', () => {
    const date = new Date('2020-02-02');

    const data = { body: date.toISOString() };
    applyTransform(data, 'body', 'date', transform, [['ref', () => []]], 0);
    expect(data.body).toEqual(date.toISOString());
  });

  it('should handle arrays of dates', () => {
    const date = new Date();

    const data = {
      body: [date.toISOString(), date.toISOString(), date.toISOString()],
    };

    applyTransform(data, 'body', 'date', transform, [['loop'], ['this']], 0);
    expect(data.body).toEqual([date, date, date]);
  });

  it('should handle arrays of nested dates', () => {
    const date = new Date();

    const data = {
      body: [{ d: date.toISOString() }, { d: date.toISOString() }],
    };

    applyTransform(
      data,
      'body',
      'date',
      transform,
      [['loop'], ['access', 'd'], ['this']],
      0,
    );
    expect(data.body).toEqual([{ d: date }, { d: date }]);
  });

  it('should handle entries of dates', () => {
    const date = new Date();

    const data = {
      body: { a: date.toISOString(), d: date.toISOString() },
    };

    applyTransform(data, 'body', 'date', transform, [['entries'], ['this']], 0);
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
      data,
      'body',
      'date',
      transform,
      [['entries'], ['access', 'b'], ['this']],
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
      data,
      'body',
      'date',
      transform,
      [['loop'], ['select', [[['access', 'd'], ['this']], [['this']]]]],
      0,
    );
    expect(data.body).toEqual([{ d: date }, date]);
  });
});
