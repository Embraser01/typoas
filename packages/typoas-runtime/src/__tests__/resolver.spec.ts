import { describe, expect, it } from '@jest/globals';
import { RefResolver } from '../resolver';

describe('ref resolver', () => {
  const resolver = new RefResolver({ A: { type: 'string' } });

  it('should resolve refs', () => {
    expect(resolver.resolveSchema('#/components/schemas/A')).toEqual({
      type: 'string',
    });
  });

  it('should return undefined if not found', () => {
    expect(resolver.resolveSchema('#/components/schemas/B')).toBeUndefined();
  });
});
