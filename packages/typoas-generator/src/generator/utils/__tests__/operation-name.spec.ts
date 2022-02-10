import { describe, expect, it } from '@jest/globals';
import { hasUnsupportedIdentifierChar } from '../operation-name';

describe('hasUnsupportedIdentifierChar', () => {
  it('should detect -', () => {
    expect(hasUnsupportedIdentifierChar('-1')).toBe(true);
  });
});
