import { describe, expect, it } from '@jest/globals';
import { sanitizeTypeIdentifier, screamingSnakeCase } from '../operation-name';

describe('sanitizeTypeIdentifier', () => {
  it('should not lowercase acronyms', () => {
    expect(sanitizeTypeIdentifier('MyOTP')).toBe('MyOtp');
  });

  it('should handle identifiers with _', () => {
    expect(sanitizeTypeIdentifier('my_variable')).toBe('MyVariable');
  });

  it('should convert from screaming case to camelCase', () => {
    expect(sanitizeTypeIdentifier('MY_VARIABLE_V2')).toBe('MyVariableV2');
  });

  it('should not merge lowercase and numbers', () => {
    expect(sanitizeTypeIdentifier('countTo3')).toBe('CountTo3');
  });
});

describe('screamingSnakeCase', () => {
  it('should convert to screaming snake case', () => {
    expect(screamingSnakeCase('MyVariable.V2')).toBe('MY_VARIABLE_V2');
  });

  it('should merge numbers if following multiple uppercase', () => {
    expect(screamingSnakeCase('MyVariableABC2')).toBe('MY_VARIABLE_ABC2');
  });

  it('should hande acronym', () => {
    expect(screamingSnakeCase('MyABC')).toBe('MY_ABC');
  });

  it('should not merge lowercase and numbers', () => {
    expect(screamingSnakeCase('countTo3')).toBe('COUNT_TO_3');
  });
});
