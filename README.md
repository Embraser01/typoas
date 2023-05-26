# Typoas

Typoas is an OpenAPI 3.X generator for Typescript. It's inspired by [openapi-generator](https://openapi-generator.tech/)
but is written in Typescript for Typescript. The generator uses the Typescript AST to generate code instead on relaying
on templates which allows better schemas definitions and other cool stuff.

Main features are:

- Fully typed
- Support for `allOf`, `oneOf` and `anyOf` schemas.
- References `$ref` handling (with cyclic refs)
- Uses `fetch` api (can be customized)
- **Tree Shaking** out of the box
- Automatically convert `format: 'date-time'` to JS `Date`
- Handle **API Key**, **HTTP Config** and **OAuth2**<sup>1</sup> auth security schemes
- JSDoc for schemas and operations
- Non JSON content type support
- And more...

> <sup>1</sup>: OAuth2 scheme does not handle flows to retrieve an `accessToken`.
> You need to provide your own `accessToken` through the `provider.getConfig()` function.

The project is split into 3 parts:

- [`@typoas/generator`](./packages/typoas-generator) is used to generate the API specific code.
- [`@typoas/cli`](./packages/typoas-cli) is a CLI entry point built on top of `@typoas/generator`.
- [`@typoas/runtime`](./packages/typoas-runtime) is the package that will be used by the generated code.

## Installation

It will generate a single TS file containing all the code specific to the underlying API.
This file only has a single dependency on `@typoas/runtime`.
**You need to manually** add `@typoas/runtime` to your `dependencies`.
It handles common things like serialization/authentification

## Usage

### Ues the generator from the CLI

You can generate the TS client from the spec from the command line:

```bash
yarn dlx @typoas/cli generate -i my-spec.json -o src/client.ts
npx @typoas/cli generate -i my-spec.json -o src/client.ts
```

Here is a short list of supported command line options:

```
    -i, --input [path/url]         Path or URL to the OpenAPI JSON specification (yaml/json format)
    -o, --output [path]            Path where to write the generated TS file
    -e,--generate-enums            Generate enums instead of literal string types where possible
    --js-doc, --no-js-doc          Whether to add JS Doc to the generated code (default: true)
    --wrap-lines-at                Define a maximum width for JS Doc comments, 0 to disable (default: 120)
    --only-types                   Use it to only generate types in #components/schemas/
    --no-fetcher-options           Use it to disable the additional param added to every operations
    --version                      Output the version number
    -h, --help                     Display help for command

    -n, --name                     Deprecated, name isn't used anymore
```

or you can use it in code:

```ts
import cli from '@typoas/cli';

await cli.run(
  [
    'generate',
    '-i',
    'https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.yaml',
    '-o',
    `./src/github.ts`,
    '-n',
    `GithubClient`,
  ],
  {
    stdin: process.stdin,
    stdout: process.stdout,
    stderr: process.stderr,
  },
);
```

### Use the generator from the API

> The API is still at an **alpha** stage, so it may break between minors.

It uses `typescript` API to generate usable code:

```typescript
import { readFileSync, writeFileSync } from 'fs';
import { createPrinter, NewLineKind, SourceFile } from 'typescript';
import { generateClient, getStringFromSourceFile } from '@typoas/generator';

const specs = JSON.parse(readFileSync('path/to/github-openapi.json', 'utf8'));
const src = generateClient(specs, {
  /* options */
});
const data = getStringFromSourceFile(src);

writeFileSync('./src/client.ts', data, 'utf8');
```

### Use the generated code

Once the file is generated you'll be able to use it like this:

```typescript
import fetch from 'node-fetch';
import { ServerConfiguration } from '@typoas/runtime';
import { createContext, pullsList } from './client';

// Inject fetch polyfill into NodeJS env.
if (!globalThis.fetch) {
  // @ts-ignore
  globalThis.fetch = fetch;
}
const ctx = createGithubContext();

pullsList(ctx, {
  repo: 'typoas',
  owner: 'embraser01',
})
  .then((list) => console.log('List of PRs', list))
  .catch((err) => console.error('Error while getting PRs', err));
```

### Migrating from v1 to v2

In v1, the whole API was generated in a single class. In V2 this was replaced by individual function
which allow [Tree Shaking](https://webpack.js.org/guides/tree-shaking/). To get a similar result,
you can use `wrapApi` helper:

```typescript
import fetch from 'node-fetch';
import { ServerConfiguration, wrapApi } from '@typoas/runtime';
import { createContext, pullsList, issuesList } from './client';

// Inject fetch polyfill into NodeJS env.
if (!globalThis.fetch) {
  // @ts-ignore
  globalThis.fetch = fetch;
}
const ctx = createGithubContext();
const ghClient = wrapApi(ctx, {
  pullsList,
  issuesList,
  // ...
});

ghClient
  .pullsList(ctx, {
    repo: 'typoas',
    owner: 'embraser01',
  })
  .then((list) => console.log('List of PRs', list))
  .catch((err) => console.error('Error while getting PRs', err));
```

## Examples

You can find examples in the [`examples`](./examples) folder.

## Notes

Here is some notes on some known issues.

### Parameters serialization

_Typoas_ has partial support for serialization specified here: https://swagger.io/docs/specification/serialization/

- It **does** support array serialization for **query**.
- It **does NOT** support serialization for **path** parameters with `style` `label` or `matrix`.
- It **does NOT** support serialization for **query** parameters with nested objects. It will be JSON.stringify
- It **does NOT** support serialization for **headers** or **cookie** parameters.

On query serialization, there can only be one style for a full operation. The first query param will set the style for
the whole operation.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
