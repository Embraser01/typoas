import { Builtins, Cli } from 'clipanion';
import { readFileSync } from 'fs';
import { join } from 'path';
import { GenerateCommand } from './commands/generate';

const cli = new Cli({
  binaryLabel: `Typoas cli`,
  binaryName: `@typoas/cli`,
  binaryVersion: (
    JSON.parse(
      readFileSync(join(__dirname, '../package.json'), 'utf8'),
    ) as Record<string, unknown>
  ).version as string,
});

cli.register(GenerateCommand);
cli.register(Builtins.HelpCommand);
cli.register(Builtins.VersionCommand);

export default cli;
