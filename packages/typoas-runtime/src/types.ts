import { Context } from './context';
import { TransformType } from './context/transform';
import { HttpMethod } from './http/http';

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
    headers: {},
    body,
    queryParams: [],
    auth: 'petstore_auth',
  });

  const res = await ctx.sendRequest(req);

  return ctx.handleResponse(res, {
    '200': {
      success: true,
      transform: [{ type: TransformType.LOOP }],
    },
    '400': { success: false, transform: [] },
  });
}

const apis = {
  addPet,
  findPetsByStatus,
};

type ApiFunction =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | ((ctx: Context, params: any) => Promise<unknown>)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | ((ctx: Context, params: any, body: any) => Promise<unknown>);

type WithoutContext<T> = T extends (
  ctx: Context,
  params: infer P,
) => Promise<infer R>
  ? (params: P) => Promise<R>
  : T extends (ctx: Context, params: infer P, body: infer B) => Promise<infer R>
  ? (params: P, body: B) => Promise<R>
  : never;

type WrapApiEndpoints = Record<string, ApiFunction>;

type WithoutContextObject<T extends WrapApiEndpoints> = {
  [key in keyof T]: WithoutContext<T[key]>;
};

export function wrapApi<T extends WrapApiEndpoints>(
  context: Context,
  endpoints: T,
): WithoutContextObject<T> {
  const res = {};

  for (const endpoint of Object.keys(endpoints)) {
    // @ts-expect-error TS is not smart enough to infer the type of the function
    res[endpoint] = (params: unknown, body: unknown): Promise<unknown> => {
      return endpoints[endpoint](context, params, body);
    };
  }
  return res as WithoutContextObject<T>;
}

const client = wrapApi(new Context(), apis);
client.findPetsByStatus({ status: 'available' }).then((pets) => pets.length);
client.addPet({ status: 'sold' }, { a: 6 }).then((pet) => pet.a);
