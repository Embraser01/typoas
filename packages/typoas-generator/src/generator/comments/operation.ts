import { OperationObject } from 'openapi3-ts/oas31';
import { Context } from '../../context';

function wrapJSDocLine(text: string, maxWidth: number): string {
  if (maxWidth <= 0 || ' * '.length + text.length < maxWidth) {
    return `${text}\n`;
  }
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  for (const word of words) {
    if (currentLine.length + word.length > maxWidth) {
      lines.push(`${currentLine.trim()}\n`);
      currentLine = '';
    }
    currentLine += `${word} `;
  }
  if (currentLine.length) {
    lines.push(`${currentLine.trim()}\n`);
  }
  return lines.join('');
}

export function getJSDocFromOperation(
  op: OperationObject,
  ctx: Context,
): string {
  let str = '';

  if (op.summary) {
    str += wrapJSDocLine(op.summary, ctx.getWrapLinesAt());
  }

  if (op.description) {
    str += wrapJSDocLine(op.description, ctx.getWrapLinesAt());
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

  return str.trim();
}
