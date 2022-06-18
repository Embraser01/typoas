import { Context } from './context';
import { TransformType } from './transformers';
import { HttpMethod } from './fetcher';
import { wrapApi } from './wrap-api';

type Pet = { a: 6 };

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
      success: true,
      transforms: {
        date: [[TransformType.SELECT, [ctx.resolve('date', 'Pet')]]],
      },
    },
    '400': { success: false, transforms: {} },
  });
}

const apis = {
  addPet,
  findPetsByStatus,
};

const context = new Context({});

const client = wrapApi(context, apis);

client.findPetsByStatus({ status: 'available' }).then((pets) => pets.length);
client.addPet({ status: 'sold' }, { a: 6 }).then((pet) => pet.a);
