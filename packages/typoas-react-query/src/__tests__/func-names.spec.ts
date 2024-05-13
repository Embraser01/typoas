import { beforeEach, describe, expect, it } from '@jest/globals';
import { _resetFuncNames, getUniqueFunctionName } from '../func-names';

describe('getUniqueFunctionName', () => {
  beforeEach(() => _resetFuncNames());

  it('should return function name', async () => {
    function testA() {}

    expect(getUniqueFunctionName(testA)).toBe('testA');
  });

  it('should append a random suffix if 2 functions with the same name', async () => {
    {
      // eslint-disable-next-line no-inner-declarations
      function testA() {}
      getUniqueFunctionName(testA);
    }
    function testA() {}

    expect(getUniqueFunctionName(testA)).toMatch(/testA_.{0,7}/);
  });

  it('should not reuse name', async () => {
    function testB() {}
    function testA() {}

    getUniqueFunctionName(testA);

    expect(getUniqueFunctionName(testB)).toBe('testB');
  });
});
