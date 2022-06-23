import fetch from 'node-fetch';
import { ServerConfiguration, wrapApi } from '@typoas/runtime';
import { pullsList, createContext as createGithubContext } from './github';
import {
  findPetsByStatus,
  createContext as createPetstoreContext,
} from './petstore';

if (!globalThis.fetch) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  globalThis.fetch = fetch;
}

const petstoreCtx = createPetstoreContext({
  serverConfiguration: new ServerConfiguration(
    'https://petstore3.swagger.io/api/v3',
    {},
  ),
});

findPetsByStatus(petstoreCtx, { status: 'available' })
  .then((resp) => console.log('Available pets', resp))
  .catch((err) => console.error('Error while loading available pets', err));

const githubCtx = createGithubContext();
const ghClient = wrapApi(githubCtx, { pullsList });

ghClient
  .pullsList({
    repo: 'berry',
    owner: 'yarnpkg',
  })
  .then((resp) => console.log('Yarn PRs', resp))
  .catch((err) => console.error('Error while loading yarn PRs', err));
