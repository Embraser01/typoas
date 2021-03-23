import { GithubClient } from './client';
import fetch from 'node-fetch';
import { ServerConfiguration } from '@typoas/runtime';

if (!globalThis.fetch) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  globalThis.fetch = fetch;
}
console.time('client-creation');
const client = new GithubClient(
  new ServerConfiguration('https://api.github.com', {}),
);
console.timeEnd('client-creation');

client
  .pullsList({
    repo: 'berry',
    owner: 'yarnpkg',
  })
  .then((resp) => console.log('DEBUG', resp))
  .catch((err) => console.error('DEBUG5', err));
