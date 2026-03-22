import { Builtins, Cli } from 'clipanion';
import pkgJson from '../package.json' with { type: 'json' };
import { GenerateCommand } from './commands/generate.js';

const cli = new Cli({
  binaryLabel: `Typoas cli`,
  binaryName: `@typoas/cli`,
  binaryVersion: pkgJson.version,
});

cli.register(GenerateCommand);
cli.register(Builtins.HelpCommand);
cli.register(Builtins.VersionCommand);

export default cli;
