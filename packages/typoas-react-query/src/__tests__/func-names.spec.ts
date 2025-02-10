import { beforeEach, describe, expect, it } from '@jest/globals';
import { _resetFuncNames, getQueryFunctionKey } from '../func-names';

describe('getUniqueFunctionName', () => {
  beforeEach(() => _resetFuncNames());

  it('should return function name', () => {
    function testA() {}

    expect(getQueryFunctionKey(testA)).toBe('testA');
  });

  it('should append a random suffix if 2 functions with the same name', () => {
    {
      function testA() {}
      getQueryFunctionKey(testA);
    }
    function testA() {}

    expect(getQueryFunctionKey(testA)).toMatch(/testA_.{0,7}/);
  });

  it('should not reuse name', () => {
    function testB() {}
    function testA() {}

    getQueryFunctionKey(testA);

    expect(getQueryFunctionKey(testB)).toBe('testB');
  });
});
