import cli from '@typoas/cli';

type Sample = { input: string; output: string };

async function run() {
  const context = {
    stdin: process.stdin,
    stdout: process.stdout,
    stderr: process.stderr,
  };

  const samples: Sample[] = [
    { input: './samples/github.yaml', output: 'github-sample' },
    {
      input:
        'https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.yaml',
      output: 'github',
    },
    {
      input:
        'https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json',
      output: 'stripe',
    },
    {
      input: 'https://petstore3.swagger.io/api/v3/openapi.json',
      output: 'petstore',
    },
  ];

  for (const sample of samples) {
    await cli.run(
      ['generate', '-i', sample.input, '-o', `./src/${sample.output}.ts`, '-e'],
      context,
    );
  }
}

run();
