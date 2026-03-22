import { describe, expect, it } from 'vitest';
import { createOperationResponseHandlers } from '../function-body.js';
import { getStringFromNode } from '../../../utils/ts-node.js';
import { Context } from '../../../../context.js';
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
