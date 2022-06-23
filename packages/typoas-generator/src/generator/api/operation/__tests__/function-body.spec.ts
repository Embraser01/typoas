import { describe, expect, it } from '@jest/globals';
import { createOperationResponseHandlers } from '../function-body';
import { getStringFromNode } from '../../../utils/ts-node';
import { Context } from '../../../../context';
import { factory } from 'typescript';

describe('create operation response handlers', () => {
  it('should create responses', () => {
    const node = factory.createObjectLiteralExpression(
      createOperationResponseHandlers(
        {
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        new Context({ jsDoc: false }),
      ),
    );

    expect(getStringFromNode(node)).toMatchSnapshot();
  });
});
