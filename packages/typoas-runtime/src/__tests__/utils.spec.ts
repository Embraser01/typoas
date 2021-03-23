import { describe, expect, it } from '@jest/globals';
import { applyTemplating, isCodeInRange } from '../utils';

describe('apply templating', () => {
  it('should replace variables in string', () => {
    expect(applyTemplating('/{userId}/test', { userId: 'my-id' })).toEqual(
      '/my-id/test',
    );
  });
  it('should not replace var if not specified', () => {
    expect(applyTemplating('/{userId}/test', {})).toEqual('/{userId}/test');
  });

  it('should replace multiple variables', () => {
    expect(
      applyTemplating('/{userId}/test/{itemId}', {
        userId: 'my-id',
        itemId: 'item-id',
      }),
    ).toEqual('/my-id/test/item-id');
  });

  it('should replace multiple occurrence of the same var', () => {
    expect(
      applyTemplating('/{userId}/test/{userId}', {
        userId: 'my-id',
      }),
    ).toEqual('/my-id/test/my-id');
  });

  it('should support encode URI components', () => {
    expect(
      applyTemplating('/{userId}/test', {
        userId: 'weird=user/id/52',
      }),
    ).toEqual('/weird%3Duser%2Fid%2F52/test');
  });
});

describe('is code in range', () => {
  it('should work with specific codes', () => {
    expect(isCodeInRange('200', 200)).toBeTruthy();
    expect(isCodeInRange('201', 201)).toBeTruthy();
    expect(isCodeInRange('2XX', 200)).toBeTruthy();
    expect(isCodeInRange('2XX', 243)).toBeTruthy();
    expect(isCodeInRange('201', 200)).toBeFalsy();
    expect(isCodeInRange('3XX', 200)).toBeFalsy();
    expect(isCodeInRange('XXX', 200)).toBeTruthy();
  });

  it('should work for default code range', () => {
    expect(isCodeInRange('default', 200)).toBeTruthy();
    expect(isCodeInRange('default', 500)).toBeTruthy();
  });
});
