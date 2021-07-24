import { Command, Option, Usage } from 'clipanion';
import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import * as path from 'path';
import { generateClient, getStringFromSourceFile } from '@typoas/generator';

export class GenerateCommand extends Command {
  static paths = [[`generate`], [`g`]];

  static usage: Usage = {
    description: `Generate a TS file from an OpenAPI spec.`,
    examples: [
      [
        `Generate MyClient client`,
        `$0 generate MyClient -i spec.json -o src/client.ts`,
      ],
    ],
  };

  input = Option.String('-i,--input', {
    required: true,
    description: 'Path to the OpenAPI JSON specification',
  });

  output = Option.String('-o,--output', {
    required: true,
    description: 'Path where to write the generated TS file',
  });

  name = Option.String({ required: true });

  jsDoc = Option.Boolean('--js-doc', {
    description: 'Whether to add JS Doc to the generated code',
  });

  useEnum = Option.Boolean('--use-enum', {
    description: 'OpenAPI enums will be generated as Enums instead of Types',
  });

  async execute(): Promise<void> {
    const inputPath = path.resolve(process.cwd(), this.input);
    if (!existsSync(inputPath)) {
      this.context.stdout.write(`Error: File ${inputPath} does not exist\n`);
      process.exit(1);
      return;
    }

    const rawSpecs = await readFile(inputPath, { encoding: 'utf-8' });
    // TODO Read YAML
    const specs = JSON.parse(rawSpecs) as Parameters<typeof generateClient>[0];

    this.context.stdout.write(`Info: Generating spec '${specs.info.title}'\n`);
    const src = generateClient(specs, this.name, { jsDoc: this.jsDoc });

    const content = getStringFromSourceFile(src);

    const outputPath = path.resolve(process.cwd(), this.output);
    await writeFile(outputPath, content);
    this.context.stdout.write(
      `Info: ${this.name} was generated at '${outputPath}'\n`,
    );
  }
}
