import { Context } from './context';
import { TransformType } from './transformers';
import { HttpMethod } from './fetcher';
import { wrapApi } from './wrap-api';
import { ContextParams } from './context/types';
import { ServerConfiguration } from './configuration';
import { RefResolver } from './resolver';
import { HttpSecurityAuthentication } from './auth';

type Pet = { a: 6 };

export type AuthMethods = {
  jwt: HttpSecurityAuthentication;
};

async function findPetsByStatus(
  ctx: Context,
  params: {
    status?: 'available' | 'pending' | 'sold';
  },
): Promise<Pet[]> {
  const a = {};

  return [];
}

async function addPet(
  ctx: Context,
  params: {
    status?: 'available' | 'pending' | 'sold';
  },
  body: Pet,
): Promise<Pet> {
  const req = await ctx.createRequest({
    path: '/test/:id/test/:name',
    params,
    method: HttpMethod.GET,
    body,
    queryParams: [],
    auth: ['petstore_auth'],
  });

  const res = await ctx.sendRequest(req);

  return ctx.handleResponse(res, {
    '200': {
      transforms: {
        date: [[TransformType.SELECT, [ctx.resolve('date', 'Pet')]]],
      },
    },
    '400': { transforms: {} },
  });
}

const apis = {
  addPet,
  findPetsByStatus,
};

export function createContext(
  params?: Partial<ContextParams<AuthMethods>>,
): Context<AuthMethods> {
  return new Context<AuthMethods>({
    resolver: new RefResolver({}),
    serverConfiguration: new ServerConfiguration('', {}),
    authMethods: {},
    ...params,
  });
}

const client = wrapApi(createContext(), apis);

client.findPetsByStatus({ status: 'available' }).then((pets) => pets.length);
client.addPet({ status: 'sold' }, { a: 6 }).then((pet) => pet.a);
