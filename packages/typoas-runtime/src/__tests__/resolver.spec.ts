import { describe, expect, it } from '@jest/globals';
import { RefResolver } from '../resolver';
import { TransformType } from '../transformers';

describe('ref resolver', () => {
  const resolver = new RefResolver({
    A: { date: [[[TransformType.ACCESS, 'createdAt'], [TransformType.THIS]]] },
    'My0wn Schema.v2': { date: [[[TransformType.THIS]]] },
  });

  it('should resolve refs', () => {
    expect(resolver.getTransforms('date', 'A')).toEqual([
      [[TransformType.ACCESS, 'createdAt'], [TransformType.THIS]],
    ]);
  });

  it('should return empty array if ref not found', () => {
    expect(resolver.getTransforms('date', 'B')).toEqual([]);
  });

  it('should return empty array if transform type not found', () => {
    expect(resolver.getTransforms('not-a-date', 'A')).toEqual([]);
  });

  it('should resolve refs with special chars', () => {
    expect(resolver.getTransforms('date', 'My0wn Schema.v2')).toEqual([
      [[TransformType.THIS]],
    ]);
  });
});
