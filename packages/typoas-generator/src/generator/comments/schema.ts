import { SchemaObject } from 'openapi3-ts';

function hasMultiline(text: string): boolean {
  return text.includes('\n');
}

export function getJSDocFromSchema(schema: SchemaObject): string {
  let str = '';

  if (schema.title) {
    str += `${schema.title}\n`;
  }

  if (schema.description) {
    str += `${schema.description}\n`;
  }
  if (schema.example) {
    const example = JSON.stringify(schema.example, null, 2);
    str += `@example${hasMultiline(example) ? '\n' : ' '}${example}\n`;
  }

  if (schema.default) {
    const defaultVal = JSON.stringify(schema.default, null, 2);
    str += `@defaultValue${
      hasMultiline(defaultVal) ? '\n' : ' '
    }${defaultVal}\n`;
  }

  if (schema.deprecated) {
    str += `@deprecated\n`;
  }

  if (schema.externalDocs) {
    str += `Learn more at {@link ${schema.externalDocs.url}}\n`;
  }

  return str.trim();
}
