import { describe, expect, it } from '@jest/globals';
import { applyTemplating } from '../utils';

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
