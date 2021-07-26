import { OperationObject } from 'openapi3-ts';

export function getJSDocFromOperation(op: OperationObject): string {
  let str = '';

  if (op.summary) {
    str += `${op.summary}\n`;
  }

  if (op.description) {
    str += `${op.description}\n`;
  }

  if (op.deprecated) {
    str += `@deprecated\n`;
  }

  if (op.externalDocs) {
    str += `Learn more at {@link ${op.externalDocs.url}}\n`;
  }

  if (op.tags?.length) {
    str += `Tags: ${op.tags.join(', ')}\n`;
  }

  return str;
}
