import { Command, Option, Usage } from 'clipanion';
import * as t from 'typanion';
import { writeFile } from 'fs/promises';
import * as path from 'path';
import { format, resolveConfig } from 'prettier';
import { generateClient, getStringFromSourceFile } from '@typoas/generator';
import { loadSpec } from '../utils/load-spec';

export class GenerateCommand extends Command {
  static paths = [[`generate`], [`g`]];

  static usage: Usage = {
    description: `Generate a TS file from an OpenAPI spec.`,
    examples: [
      [
        `Generate client from local specs`,
        `$0 generate -i spec.json -o src/client.ts`,
      ],
      [
        `Generate client from URLs`,
        `$0 generate -i https://petstore3.swagger.io/api/v3/openapi.json -o src/client.ts`,
      ],
    ],
  };

  input = Option.String('-i,--input', {
    required: true,
    description:
      'Path or URL to the OpenAPI JSON specification (yaml/json format)',
  });

  output = Option.String('-o,--output', {
    required: true,
    description: 'Path where to write the generated TS file',
  });

  name = Option.String('-n,--name', {
    hidden: true,
    description: "Deprecated, name isn't used anymore",
  });

  prettier = Option.Boolean('-p,--prettier', {
    description: 'If set, the generated file will be formatted with Prettier',
  });

  fullResponseMode = Option.Boolean('-r,--full-response-mode', {
    description:
      'Enabled by default, generate functions that only throws on network errors, can be disabled using --no-full-response-mode',
  });

  jsDoc = Option.Boolean('--js-doc', {
    description: 'Whether to add JS Doc to the generated code',
  });

  wrapLinesAt = Option.String('--wrap-lines-at', {
    validator: t.isNumber(),
    description:
      'Define a maximum width for JS Doc comments, 0 to disable (default: 120).',
  });

  onlyTypes = Option.Boolean('--only-types', {
    description: 'Use it to only generate types in #components/schemas/',
  });

  generateEnums = Option.Boolean('-e,--generate-enums', {
    description:
      'Generate enums instead of literal string types where possible',
  });

  anyInsteadOfUnknown = Option.Boolean('--any-instead-of-unknown', {
    description:
      'Use the any keyword instead of unknown in api functions return value. ' +
      'Schemas will never use the unknown keyword.',
  });

  noFetcherOptions = Option.Boolean('--no-fetcher-options', {
    description:
      'Use it to disable the additional param added to every operations.',
  });

  async execute(): Promise<void> {
    const specs = await loadSpec(this.input);

    this.context.stdout.write(`Info: Generating spec '${specs.info.title}'\n`);
    const src = generateClient(specs, {
      jsDoc: this.jsDoc,
      onlyTypes: this.onlyTypes,
      fetcherOptions: !this.noFetcherOptions,
      generateEnums: this.generateEnums,
      anyInsteadOfUnknown: this.anyInsteadOfUnknown,
      wrapLinesAt: this.wrapLinesAt,
      fullResponseMode: this.fullResponseMode,
    });

    let content = getStringFromSourceFile(src);

    const outputPath = path.resolve(process.cwd(), this.output);
    if (this.prettier) {
      const options = await resolveConfig(outputPath);
      content = await format(content, { ...options, parser: 'typescript' });
    }

    await writeFile(outputPath, content);
    this.context.stdout.write(
      `Info: ${specs.info.title} was generated at '${outputPath}'\n`,
    );
  }
}
