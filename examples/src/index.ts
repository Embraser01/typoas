import { ok, ServerConfiguration, wrapApi } from '@typoas/runtime';
import { pullsList, createContext as createGithubContext } from './github';
import {
  findPetsByStatus,
  createContext as createPetstoreContext,
} from './petstore';

const petstoreCtx = createPetstoreContext({
  serverConfiguration: new ServerConfiguration(
    'https://petstore3.swagger.io/api/v3',
    {},
  ),
});

const githubCtx = createGithubContext();
const ghClient = wrapApi(githubCtx, { pullsList });

async function main() {
  try {
    const pets = await ok(
      findPetsByStatus(petstoreCtx, { status: 'available' }),
    );
    console.log(`Found ${pets.length} pets available`);
  } catch (e) {
    console.error('Error while loading pets', e);
  }

  try {
    const yarnPRs = await ok(
      ghClient.pullsList({ repo: 'berry', owner: 'yarnpkg' }),
      200,
    );
    console.log(`Found ${yarnPRs.length} yarn PRs opened`);
  } catch (e) {
    console.error('Error while loading yarn PRs', e);
  }

  try {
    const error = await ok(
      ghClient.pullsList({ repo: 'berry', owner: 'yarnpkg' }),
      422,
    );
    console.log(`Found ${error.errors?.length} errors`);
  } catch (e) {
    console.error('Error while loading yarn PRs');
  }

  const yarnPRsRes = await ghClient.pullsList({
    repo: 'berry',
    owner: 'yarnpkg',
  });

  if (yarnPRsRes.ok && yarnPRsRes.status === 200) {
    console.log(`Found ${yarnPRsRes.data.length} PRs`);
  } else if (yarnPRsRes.status === 422) {
    console.log('Error while loading PRs', yarnPRsRes.data.message);
  }
}

main();
