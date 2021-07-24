import { Cli } from 'clipanion';

import { GenerateCommand } from './commands/generate';

const [node, app, ...args] = process.argv;

const cli = new Cli({
  binaryLabel: `Typoas cli`,
  binaryName: `${node} ${app}`,
  binaryVersion: `1.0.0`,
});

cli.register(GenerateCommand);
cli.runExit(args, Cli.defaultContext);
