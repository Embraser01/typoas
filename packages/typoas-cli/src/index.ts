import { Builtins, Cli } from 'clipanion';

import { GenerateCommand } from './commands/generate';

const [, , ...args] = process.argv;

const cli = new Cli({
  binaryLabel: `Typoas cli`,
  binaryName: `@typoas/cli`,
  binaryVersion: `0.0.3`,
});

cli.register(GenerateCommand);
cli.register(Builtins.HelpCommand);
cli.runExit(args, Cli.defaultContext);
