import { describe, expect, it } from '@jest/globals';
import { RefResolver } from '../resolver';

describe('ref resolver', () => {
  const resolver = new RefResolver({
    A: { type: 'string' },
    'My0wn Schema.v2': { type: 'integer' },
  });

  it('should resolve refs', () => {
    expect(resolver.resolveSchema('#/components/schemas/A')).toEqual({
      type: 'string',
    });
  });

  it('should return undefined if not found', () => {
    expect(resolver.resolveSchema('#/components/schemas/B')).toBeUndefined();
  });

  it('should resolve refs with special chars', () => {
    expect(
      resolver.resolveSchema('#/components/schemas/My0wn Schema.v2'),
    ).toEqual({
      type: 'integer',
    });
  });
});
