import { Command, Option, Usage } from 'clipanion';
import { writeFile } from 'fs/promises';
import * as path from 'path';
import { generateClient, getStringFromSourceFile } from '@typoas/generator';
import { loadSpec } from '../utils/load-spec';

export class GenerateCommand extends Command {
  static paths = [[`generate`], [`g`]];

  static usage: Usage = {
    description: `Generate a TS file from an OpenAPI spec.`,
    examples: [
      [
        `Generate MyClient client`,
        `$0 generate -n MyClient -i spec.json -o src/client.ts`,
      ],
      [
        `Generate MyClient client`,
        `$0 generate -n MyClient -i https://petstore.swagger.io/v2/swagger.json -o src/client.ts`,
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

  jsDoc = Option.Boolean('--js-doc', {
    description: 'Whether to add JS Doc to the generated code',
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

  async execute(): Promise<void> {
    const specs = await loadSpec(this.input);

    this.context.stdout.write(`Info: Generating spec '${specs.info.title}'\n`);
    const src = generateClient(specs, {
      jsDoc: this.jsDoc,
      onlyTypes: this.onlyTypes,
      generateEnums: this.generateEnums,
      anyInsteadOfUnknown: this.anyInsteadOfUnknown,
    });

    const content = getStringFromSourceFile(src);

    const outputPath = path.resolve(process.cwd(), this.output);
    await writeFile(outputPath, content);
    this.context.stdout.write(
      `Info: ${specs.info.title} was generated at '${outputPath}'\n`,
    );
  }
}
