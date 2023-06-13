import { describe, expect, it } from '@jest/globals';
import { RefResolver } from '../resolver';

describe('ref resolver', () => {
  const resolver = new RefResolver({
    A: { date: [[['access', 'createdAt'], ['this']]] },
    'My0wn Schema.v2': { date: [[['this']]] },
  });

  it('should resolve refs', () => {
    expect(resolver.getTransforms('date', 'A')).toEqual([
      [['access', 'createdAt'], ['this']],
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
      [['this']],
    ]);
  });
});
