# Typoas

Typoas is an OpenAPI 3.X generator for Typescript. It's inspired by [openapi-generator](https://openapi-generator.tech/)
but is written in Typescript for Typescript. The generator uses the Typescript AST to generate code instead on relaying
on templates which allows better schemas definitions and other cool stuff.

Main features are:

- Fully typed
- Support for `oneOf` and `anyOf` schemas.
- References `$ref` handling (with cyclic refs)
- Uses `fetch` api
- Handle **API Key** and **HTTP Config** auth security schemes
- JSDoc for schemas and operations
- And more...

The project is split into 3 parts:

- [`@typoas/generator`](./packages/typoas-generator) is used to generate the API specific code.
- [`@typoas/cli`](./packages/typoas-cli) is a CLI entry point built on top of `@typoas/generator`.
- [`@typoas/runtime`](./packages/typoas-runtime) is the package that will be used by the generated code.

## Installation

It will generate a single TS file containing all the code specific to the underlying API. It has a single dependency
on `@typoas/runtime` that handles common things like serialization/authentification.

## Usage

### Ues the generator from the CLI

You can generate the TS client from the spec from the command line:

```bash
yarn dlx @typoas/cli generate -i my-spec.json -n MyClient -o src/client.ts
npx @typoas/cli generate -i my-spec.json -n MyClient -o src/client.ts
```

### Use the generator from the API

> The API is still at an **alpha** stage, so it may break between minors.

It uses `typescript` API to generate usable code:

```typescript
import { readFileSync, writeFileSync } from 'fs';
import { createPrinter, NewLineKind, SourceFile } from 'typescript';
import { generateClient, getStringFromSourceFile } from '@typoas/generator';

const specs = JSON.parse(readFileSync('path/to/github-openapi.json', 'utf8'));
const src = generateClient(specs, 'GithubClient');
const data = getStringFromSourceFile(src);

writeFileSync('./src/client.ts', data, 'utf8');
```

### Use the generated code

Once the file is generated you'll be able to use it like this:

```typescript
import fetch from 'node-fetch';
import { ServerConfiguration } from '@typoas/runtime';
import { GithubClient } from './client';

// Inject fetch polyfill into NodeJS env.
if (!globalThis.fetch) {
  // @ts-ignore
  globalThis.fetch = fetch;
}

const client = new GithubClient(
  new ServerConfiguration('https://api.github.com', {}),
);

client
  .pullsList({
    repo: 'typoas',
    owner: 'embraser01',
  })
  .then((list) => console.log('List of PRs', list))
  .catch((err) => console.error('Error while getting PRs', err));
```

## Examples

You can find examples in the [`packages`](./packages) folder.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
