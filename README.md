# Typoas

![npm](https://img.shields.io/npm/v/@typoas/cli?label=cli%40npm)  
![npm](https://img.shields.io/npm/v/@typoas/generator?label=generator%40npm)  
![npm](https://img.shields.io/npm/v/@typoas/runtime?label=runtime%40npm)  
![GitHub](https://img.shields.io/github/license/embraser01/typoas)  
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@typoas/runtime)

Typoas is an OpenAPI 3.X generator for Typescript. It's inspired by [openapi-generator](https://openapi-generator.tech/)  
but is written in Typescript for Typescript. The generator uses the Typescript AST to generate code instead on relaying  
on templates which allows better schemas definitions and other cool stuff.

Main features are:

- Fully typed and fully customizable
- References `$ref` handling (including cyclic refs)
- **Tree Shaking** out of the box
- **React Query** integration
- Support for `allOf`, `oneOf` and `anyOf` schemas.
- Automatically convert `format: 'date-time'` to JS `Date`
- Handle **API Key**, **HTTP Config**, **OAuth2**<sup>1</sup> and **OIDC**<sup>1</sup> auth security schemes
- JSDoc for schemas and operations
- Override system for generated types
- Uses `fetch` api (can be customized)
- Non JSON content type support
- Small bundle size
- And more...

> <sup>1</sup>: OAuth2 and OpenIDConnect scheme do not handle flows to retrieve an `accessToken`.  
> You need to provide your own `accessToken` through the `provider.getConfig()` function.

The project is split into 4 packages:

- [`@typoas/generator`](./packages/typoas-generator) is used to generate the API specific code.
- [`@typoas/cli`](./packages/typoas-cli) is a CLI entry point built on top of `@typoas/generator`.
- [`@typoas/runtime`](./packages/typoas-runtime) is the package that will be used by the generated code.
- [`@typoas/react-query`](./packages/typoas-react-query) integrates _Typoas_ with [React Query](https://tanstack.com/query/latest).

---

- [Installation](#installation)
- [Usage](#usage)
  - [Use the generator from the CLI](#use-the-generator-from-the-cli)
  - [Use the generator from the API](#use-the-generator-from-the-api)
  - [Use the generated code](#use-the-generated-code)
    - [Customize server configuration](#customize-server-configuration)
    - [Customize fetch implementation](#customize-fetch-implementation)
    - [Handling authentification](#handling-authentification)
    - [Customizing the serialization](#customizing-the-serialization)
  - [Using with React Query](#using-with-react-query)
- [Examples](#examples)
- [Notes](#notes)
  - [Overrides](#overrides)
  - [External references](#external-references)
  - [Parameters serialization](#parameters-serialization)
  - [Migrating from v1 to v2](#migrating-from-v1-to-v2)
- [Contributing](#contributing)
- [License](#license)

## Installation

It will generate a single TS file containing all the code specific to the underlying API.  
This file only has a single dependency on `@typoas/runtime`.  
**You need to manually** add `@typoas/runtime` to your `dependencies`.  
It handles common things like serialization/authentification

## Usage

### Use the generator from the CLI

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
    -p,--prettier                  If set, the generated file will be formatted with Prettier
    -r,--full-response-mode        Enabled by default, generate functions that only throws on network errors, can be disabled using --no-full-response-mode
    --js-doc, --no-js-doc          Whether to add JS Doc to the generated code (default: true)
    --wrap-lines-at                Define a maximum width for JS Doc comments, 0 to disable (default: 120)
    --only-types                   Use it to only generate types in #components/schemas/
    --no-fetcher-options           Use it to disable the additional param added to every operations
    --override                     You can define a list of types that will be imported from a custom file instead of being generated. Must be used with --override-import
    --override-import              Path to the file that will be imported to resolve overrides
    --version                      Output the version number
    -h, --help                     Display help for command
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
import { ServerConfiguration, ok } from '@typoas/runtime';
// Client generated from:
// yarn dlx @typoas/cli generate -i https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.yaml -o client.ts
import { createContext, pullsList } from './client';

const ctx = createContext();

// By default, returns a StatusResponse that contains statusCode, data and headers.
const res = await pullsList(ctx, { repo: 'typoas', owner: 'embraser01' });
if (res.ok) {
  res.data.forEach((pr) => console.log(pr.title));
}

// An helper `ok` function can help throw on non 2xx status code and return the data
// The second argument is an optional expected status code (useful when multiple success status code are possible)
const prs = await ok(
  pullsList(ctx, { repo: 'typoas', owner: 'embraser01' }),
  200,
);
```

> You can directly generate functions that throw on non 2xx status code by using the `--no-full-response-mode` option.
> This feature may be removed in the future and isn't the recommended way.

You can customize multiple things in the `createContext` function.

#### Customize server configuration

By default, the `createContext` function will use the first `servers` entry in the spec.
You can override the server configuration by passing a `ServerConfiguration` object:

```typescript
import { ServerConfiguration } from '@typoas/runtime';
import { createContext } from './client';

const ctx = createContext({
  serverConfiguration: new ServerConfiguration(
    'https://{env}.api.example.com',
    {
      env: 'staging',
    },
  ),
});
```

> The way it's done currently is not the best. It will be improved in the future.

#### Customize fetch implementation

The default fetcher implementation [uses](./packages/typoas-runtime/src/fetcher/index.ts) the `fetch` API.
You can override the fetcher implementation if you want to customize things (like adding a retry policy, headers, etc.).

For example, you can use `axios` instead of the `fetch` API:

```typescript
import axios, { AxiosError, AxiosResponse, Method } from 'axios';
import {
  Fetcher,
  RequestContext,
  ResponseContext,
  BaseFetcherData,
} from '@typoas/runtime';
import { createContext } from './client';

class AxiosHttpLibrary implements Fetcher<BaseFetcherData> {
  async send(request: RequestContext): Promise<ResponseContext> {
    let resp: AxiosResponse;
    try {
      resp = await axios.request({
        url: request.getUrl(),
        method: request.getHttpMethod() as Method,
        headers: request.getHeaders(),
        data: request.getBody(),
      });
    } catch (e) {
      const err = e as AxiosError;
      if (!err.response) {
        throw e;
      }
      // Typoas handles errors itself
      resp = err.response;
    }

    return new ResponseContext(resp.status, resp.headers, {
      text: async () => resp.data as string,
      binary: async () => resp.data as Blob,
      json: async () => resp.data,
    });
  }
}

const ctx = createContext({ fetcher: new AxiosHttpLibrary() });
```

> Node.js >= 18.0.0 includes the `fetch` implementation, so Typoas should work out of the box.

#### Handling authentification

The `createContext` function can take an `authProviders` object to handle authentification.

For example, for the petstore sample:

```typescript
import { createContext } from './petstore';

const ctx = createContext({
  authProviders: {
    api_key: {
      async getConfig() {
        return 'MyAPIKey';
      },
    },
    petstore_auth: {
      getConfig() {
        const accessToken = globalStore.getAccessToken();

        if (accessToken) {
          return null;
        }
        return { accessToken };
      },
    },
  },
});
```

It supports 5 types of security schemes:

- `apiKey` mode
- `http` bearer and basic mode
- `oauth2` mode
- `openIdConnect` mode

The `getConfig` function should return the configuration needed to authenticate the request. Returning `null` will skip the authentification.

#### Customizing the serialization

You can switch some serialization options by passing a `serializerOptions` object to the `createContext` function.

> Not every serialization option is supported. See [#11](https://github.com/Embraser01/typoas/issues/11) for more information.

### Using with React Query

Documentation is available in the [`@typoas/react-query`](./packages/typoas-react-query) package.

## Examples

You can find examples in the [`examples`](./examples) folder.

## Notes

Here is some notes on some known issues.

### Overrides

Sometimes you may want to override some of the generated types.
For example, Typoas will not generate Template Literal Types or Generics as it's hard to be defined in an OpenAPI spec.

This works by listing the types you want to override and giving the import path you want to use.

For example, if you want to override the PetStore `Category` type of your spec:

```typescript
// my-overrides.ts
export type Category = {
  id?: number;
  name?: string;
  description?: string;
};
```

When you generate the client, you can pass the `--overrides` option:

```bash
yarn dlx @typoas/cli generate -i my-spec.json -o src/client.ts --override-import my-overrides.ts --override Category
```

This will not generate the `Category` type but import it from the `my-overrides.ts` file. This allows easy customization of generated types.

There are a couple of things to note:

- The override name is the **sanitized** name of the type. You can first generate the client and see the generated types to know the name.
- _Typoas_ will not check the override file. If the file isn't there or the type isn't exported, it will throw a TypeScript error.
- You will have to export the type yourself, _Typoas_ will not do it for you (contrary to the generated types).

### External references

External references are not supported. Every `$ref` must be in the spec.  
An issue is open [here](https://github.com/Embraser01/typoas/issues/37).

### Parameters serialization

_Typoas_ has partial support for serialization specified here: https://swagger.io/docs/specification/serialization/

- It **does** support array serialization for **query**.
- It **does NOT** support serialization for **path** parameters with `style` `label` or `matrix`.
- It **does NOT** support serialization for **query** parameters with nested objects. It will be JSON.stringify
- It **does NOT** support serialization for **headers** or **cookie** parameters.

On query serialization, there can only be one style for a full operation. The first query param will set the style for  
the whole operation.

### Migrating from v1 to v2

In v1, the whole API was generated in a single class. In V2 this was replaced by individual function  
which allow [Tree Shaking](https://webpack.js.org/guides/tree-shaking/). To get a similar result,  
you can use `wrapApi` helper:

```typescript
import { ServerConfiguration, wrapApi } from '@typoas/runtime';
import { createContext, pullsList, issuesList } from './client';

const ctx = createContext();
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

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
