import cli from '@typoas/cli';

function capitalize(txt: string): string {
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}

function makeArgs(name: string): string[] {
  return [
    'generate',
    '-i',
    `./samples/${name}.yaml`,
    '-o',
    `./src/${name}.ts`,
    '-n',
    `${capitalize(name)}Client`,
    '-e',
  ];
}

async function run() {
  const context = {
    stdin: process.stdin,
    stdout: process.stdout,
    stderr: process.stderr,
  };

  // await cli.run(makeArgs('github'), context);
  await cli.run(makeArgs('petstore'), context);
}

run();
