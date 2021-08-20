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
    required: true,
    description: 'Class name of the generated client',
  });

  jsDoc = Option.Boolean('--js-doc', {
    description: 'Whether to add JS Doc to the generated code',
  });

  onlyTypes = Option.Boolean('--only-types', {
    description: 'Use it to only generate types in #components/schemas/',
  });

  async execute(): Promise<void> {
    const specs = await loadSpec(this.input);

    this.context.stdout.write(`Info: Generating spec '${specs.info.title}'\n`);
    const src = generateClient(specs, this.name, {
      jsDoc: this.jsDoc,
      onlyTypes: this.onlyTypes,
    });

    const content = getStringFromSourceFile(src);

    const outputPath = path.resolve(process.cwd(), this.output);
    await writeFile(outputPath, content);
    this.context.stdout.write(
      `Info: ${this.name} was generated at '${outputPath}'\n`,
    );
  }
}
