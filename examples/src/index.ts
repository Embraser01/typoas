import fetch from 'node-fetch';
import { ServerConfiguration } from '@typoas/runtime';
import { GithubClient } from './github';
import { PetstoreClient } from './petstore';

if (!globalThis.fetch) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  globalThis.fetch = fetch;
}
const ghClient = new GithubClient(
  new ServerConfiguration('https://api.github.com', {}),
);

const petstoreClient = new PetstoreClient(
  new ServerConfiguration('https://petstore3.swagger.io/api/v3', {}),
  {},
);

ghClient
  .pullsList({
    repo: 'berry',
    owner: 'yarnpkg',
  })
  .then((resp) => console.log('Yarn PRs', resp))
  .catch((err) => console.error('Error while loading yarn PRs', err));

petstoreClient
  .findPetsByStatus({ status: 'available' })
  .then((resp) => console.log('Available pets', resp))
  .catch((err) => console.error('Error while loading available pets', err));
