import { Context } from './context';
import { TransformType } from './transformers';
import { HttpMethod } from './fetcher';
import { wrapApi } from './wrap-api';
import { CreateContextParams } from './context/types';
import { ServerConfiguration } from './configuration';
import { RefResolver } from './resolver';
import { HttpSecurityAuthentication } from './auth';

type Pet = { a: 6 };

export type AuthMethods = { jwt: HttpSecurityAuthentication };

// export type AuthMethods = Record<string, never>;

async function findPetsByStatus(
  ctx: Context<AuthMethods>,
  params: {
    status?: 'available' | 'pending' | 'sold';
  },
): Promise<Pet[]> {
  const a = {};

  return [];
}

async function addPet(
  ctx: Context<AuthMethods>,
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
        date: [[[TransformType.REF, 'Pet']]],
      },
    },
    '400': { transforms: {} },
  });
}

const apis = {
  addPet,
  findPetsByStatus,
};

export function configureAuth(
  params?: CreateContextParams<AuthMethods>['authProviders'],
): Partial<AuthMethods> {
  return {
    jwt:
      params?.jwt &&
      new HttpSecurityAuthentication(
        { scheme: 'bearer', bearerFormat: '' },
        params.jwt,
      ),
  };
}

export function createContext(
  params?: Partial<CreateContextParams<AuthMethods>>,
): Context<AuthMethods> {
  return new Context<AuthMethods>({
    resolver: new RefResolver({
      Pet: {
        date: [[[TransformType.ACCESS, 'createdAt'], [TransformType.THIS]]],
      },
    }),
    serverConfiguration: new ServerConfiguration('', {}),
    authMethods: configureAuth(params?.authProviders),
    ...params,
  });
}

const client = wrapApi(
  createContext({
    authProviders: {
      jwt: {
        getConfig() {
          return 'test';
        },
      },
    },
  }),
  apis,
);

client.findPetsByStatus({ status: 'available' }).then((pets) => pets.length);
client.addPet({ status: 'sold' }, { a: 6 }).then((pet) => pet.a);
