import * as r from '@typoas/runtime';
import type { Category } from './petstore-overrides';
export type Order = {
  /**
   * @example 10
   */
  id?: number;
  /**
   * @example 198772
   */
  petId?: number;
  /**
   * @example 7
   */
  quantity?: number;
  shipDate?: Date;
  /**
   * Order Status
   * @example "approved"
   */
  status?: 'placed' | 'approved' | 'delivered';
  complete?: boolean;
};
export type Customer = {
  /**
   * @example 100000
   */
  id?: number;
  /**
   * @example "fehguy"
   */
  username?: string;
  address?: Address[];
};
export type Address = {
  /**
   * @example "437 Lytton"
   */
  street?: string;
  /**
   * @example "Palo Alto"
   */
  city?: string;
  /**
   * @example "CA"
   */
  state?: string;
  /**
   * @example "94301"
   */
  zip?: string;
};
export type User = {
  /**
   * @example 10
   */
  id?: number;
  /**
   * @example "theUser"
   */
  username?: string;
  /**
   * @example "John"
   */
  firstName?: string;
  /**
   * @example "James"
   */
  lastName?: string;
  /**
   * @example "john@email.com"
   */
  email?: string;
  /**
   * @example "12345"
   */
  password?: string;
  /**
   * @example "12345"
   */
  phone?: string;
  /**
   * User Status
   * @example 1
   */
  userStatus?: number;
};
export type Tag = {
  id?: number;
  name?: string;
};
export type Pet = {
  /**
   * @example 10
   */
  id?: number;
  /**
   * @example "doggie"
   */
  name: string;
  category?: Category;
  photoUrls: string[];
  tags?: Tag[];
  /**
   * pet status in the store
   */
  status?: 'available' | 'pending' | 'sold';
};
export type ApiResponse = {
  code?: number;
  type?: string;
  message?: string;
};
const $date_Order = (): r.TransformField[] => [
  [['access', 'shipDate'], ['this']],
];
export type AuthMethods = {
  petstore_auth?: r.OAuth2SecurityAuthentication;
  api_key?: r.ApiKeySecurityAuthentication;
};
export function configureAuth(
  params?: r.CreateContextParams<AuthMethods>['authProviders'],
): AuthMethods {
  return {
    petstore_auth:
      params?.petstore_auth &&
      new r.OAuth2SecurityAuthentication({}, params.petstore_auth),
    api_key:
      params?.api_key &&
      new r.ApiKeySecurityAuthentication(
        { name: 'api_key', in: 'header' },
        params.api_key,
      ),
  };
}
export function createContext<FetcherData extends r.BaseFetcherData>(
  params?: r.CreateContextParams<AuthMethods, FetcherData>,
): r.Context<AuthMethods, FetcherData> {
  return new r.Context<AuthMethods, FetcherData>({
    serverConfiguration: new r.ServerConfiguration('/api/v3', {}),
    authMethods: configureAuth(params?.authProviders),
    ...params,
  });
}
/**
 * Update an existing pet
 * Update an existing pet by Id
 * Tags: pet
 */
export async function updatePet<FetcherData extends r.BaseFetcherData>(
  ctx: r.Context<AuthMethods, FetcherData>,
  params: {},
  body: Pet,
  opts?: FetcherData,
): Promise<
  | r.StatusResponse<200, Pet>
  | r.StatusResponse<400, unknown>
  | r.StatusResponse<404, unknown>
  | r.StatusResponse<405, unknown>
> {
  const req = await ctx.createRequest({
    path: '/pet',
    params,
    method: r.HttpMethod.PUT,
    body,
    auth: ['petstore_auth'],
  });
  const res = await ctx.sendRequest(req, opts);
  return ctx.handleResponse(res, {}, true);
}
/**
 * Add a new pet to the store
 * Add a new pet to the store
 * Tags: pet
 */
export async function addPet<FetcherData extends r.BaseFetcherData>(
  ctx: r.Context<AuthMethods, FetcherData>,
  params: {},
  body: Pet,
  opts?: FetcherData,
): Promise<r.StatusResponse<200, Pet> | r.StatusResponse<405, unknown>> {
  const req = await ctx.createRequest({
    path: '/pet',
    params,
    method: r.HttpMethod.POST,
    body,
    auth: ['petstore_auth'],
  });
  const res = await ctx.sendRequest(req, opts);
  return ctx.handleResponse(res, {}, true);
}
/**
 * Finds Pets by status
 * Multiple status values can be provided with comma separated strings
 * Tags: pet
 */
export async function findPetsByStatus<FetcherData extends r.BaseFetcherData>(
  ctx: r.Context<AuthMethods, FetcherData>,
  params: {
    status?: 'available' | 'pending' | 'sold';
  },
  opts?: FetcherData,
): Promise<r.StatusResponse<200, Pet[]> | r.StatusResponse<400, unknown>> {
  const req = await ctx.createRequest({
    path: '/pet/findByStatus',
    params,
    method: r.HttpMethod.GET,
    queryParams: ['status'],
    auth: ['petstore_auth'],
  });
  const res = await ctx.sendRequest(req, opts);
  return ctx.handleResponse(res, {}, true);
}
/**
 * Finds Pets by tags
 * Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.
 * Tags: pet
 */
export async function findPetsByTags<FetcherData extends r.BaseFetcherData>(
  ctx: r.Context<AuthMethods, FetcherData>,
  params: {
    tags?: string[];
  },
  opts?: FetcherData,
): Promise<r.StatusResponse<200, Pet[]> | r.StatusResponse<400, unknown>> {
  const req = await ctx.createRequest({
    path: '/pet/findByTags',
    params,
    method: r.HttpMethod.GET,
    queryParams: ['tags'],
    auth: ['petstore_auth'],
  });
  const res = await ctx.sendRequest(req, opts);
  return ctx.handleResponse(res, {}, true);
}
/**
 * Find pet by ID
 * Returns a single pet
 * Tags: pet
 */
export async function getPetById<FetcherData extends r.BaseFetcherData>(
  ctx: r.Context<AuthMethods, FetcherData>,
  params: {
    petId: number;
  },
  opts?: FetcherData,
): Promise<
  | r.StatusResponse<200, Pet>
  | r.StatusResponse<400, unknown>
  | r.StatusResponse<404, unknown>
> {
  const req = await ctx.createRequest({
    path: '/pet/{petId}',
    params,
    method: r.HttpMethod.GET,
    auth: ['api_key', 'petstore_auth'],
  });
  const res = await ctx.sendRequest(req, opts);
  return ctx.handleResponse(res, {}, true);
}
/**
 * Updates a pet in the store with form data
 * Tags: pet
 */
export async function updatePetWithForm<FetcherData extends r.BaseFetcherData>(
  ctx: r.Context<AuthMethods, FetcherData>,
  params: {
    petId: number;
    name?: string;
    status?: string;
  },
  opts?: FetcherData,
): Promise<r.StatusResponse<405, unknown>> {
  const req = await ctx.createRequest({
    path: '/pet/{petId}',
    params,
    method: r.HttpMethod.POST,
    queryParams: ['name', 'status'],
    auth: ['petstore_auth'],
  });
  const res = await ctx.sendRequest(req, opts);
  return ctx.handleResponse(res, {}, true);
}
/**
 * Deletes a pet
 * Tags: pet
 */
export async function deletePet<FetcherData extends r.BaseFetcherData>(
  ctx: r.Context<AuthMethods, FetcherData>,
  params: {
    api_key?: string;
    petId: number;
  },
  opts?: FetcherData,
): Promise<r.StatusResponse<400, unknown>> {
  const req = await ctx.createRequest({
    path: '/pet/{petId}',
    params,
    method: r.HttpMethod.DELETE,
    auth: ['petstore_auth'],
  });
  const res = await ctx.sendRequest(req, opts);
  return ctx.handleResponse(res, {}, true);
}
/**
 * uploads an image
 * Tags: pet
 */
export async function uploadFile<FetcherData extends r.BaseFetcherData>(
  ctx: r.Context<AuthMethods, FetcherData>,
  params: {
    petId: number;
    additionalMetadata?: string;
  },
  body: Blob,
  opts?: FetcherData,
): Promise<r.StatusResponse<200, ApiResponse>> {
  const req = await ctx.createRequest({
    path: '/pet/{petId}/uploadImage',
    params,
    method: r.HttpMethod.POST,
    body,
    queryParams: ['additionalMetadata'],
    auth: ['petstore_auth'],
  });
  const res = await ctx.sendRequest(req, opts);
  return ctx.handleResponse(res, {}, true);
}
/**
 * Returns pet inventories by status
 * Returns a map of status codes to quantities
 * Tags: store
 */
export async function getInventory<FetcherData extends r.BaseFetcherData>(
  ctx: r.Context<AuthMethods, FetcherData>,
  params: {},
  opts?: FetcherData,
): Promise<
  r.StatusResponse<
    200,
    {
      [key: string]: number;
    }
  >
> {
  const req = await ctx.createRequest({
    path: '/store/inventory',
    params,
    method: r.HttpMethod.GET,
    auth: ['api_key'],
  });
  const res = await ctx.sendRequest(req, opts);
  return ctx.handleResponse(res, {}, true);
}
/**
 * Place an order for a pet
 * Place a new order in the store
 * Tags: store
 */
export async function placeOrder<FetcherData extends r.BaseFetcherData>(
  ctx: r.Context<AuthMethods, FetcherData>,
  params: {},
  body: Order,
  opts?: FetcherData,
): Promise<r.StatusResponse<200, Order> | r.StatusResponse<405, unknown>> {
  const req = await ctx.createRequest({
    path: '/store/order',
    params,
    method: r.HttpMethod.POST,
    body,
  });
  const res = await ctx.sendRequest(req, opts);
  return ctx.handleResponse(
    res,
    {
      '200': { transforms: { date: [[['ref', $date_Order]]] } },
    },
    true,
  );
}
/**
 * Find purchase order by ID
 * For valid response try integer IDs with value <= 5 or > 10. Other values will generate exceptions.
 * Tags: store
 */
export async function getOrderById<FetcherData extends r.BaseFetcherData>(
  ctx: r.Context<AuthMethods, FetcherData>,
  params: {
    orderId: number;
  },
  opts?: FetcherData,
): Promise<
  | r.StatusResponse<200, Order>
  | r.StatusResponse<400, unknown>
  | r.StatusResponse<404, unknown>
> {
  const req = await ctx.createRequest({
    path: '/store/order/{orderId}',
    params,
    method: r.HttpMethod.GET,
  });
  const res = await ctx.sendRequest(req, opts);
  return ctx.handleResponse(
    res,
    {
      '200': { transforms: { date: [[['ref', $date_Order]]] } },
    },
    true,
  );
}
/**
 * Delete purchase order by ID
 * For valid response try integer IDs with value < 1000. Anything above 1000 or nonintegers will generate API errors
 * Tags: store
 */
export async function deleteOrder<FetcherData extends r.BaseFetcherData>(
  ctx: r.Context<AuthMethods, FetcherData>,
  params: {
    orderId: number;
  },
  opts?: FetcherData,
): Promise<r.StatusResponse<400, unknown> | r.StatusResponse<404, unknown>> {
  const req = await ctx.createRequest({
    path: '/store/order/{orderId}',
    params,
    method: r.HttpMethod.DELETE,
  });
  const res = await ctx.sendRequest(req, opts);
  return ctx.handleResponse(res, {}, true);
}
/**
 * Create user
 * This can only be done by the logged in user.
 * Tags: user
 */
export async function createUser<FetcherData extends r.BaseFetcherData>(
  ctx: r.Context<AuthMethods, FetcherData>,
  params: {},
  body: User,
  opts?: FetcherData,
): Promise<r.StatusResponse<'default', User>> {
  const req = await ctx.createRequest({
    path: '/user',
    params,
    method: r.HttpMethod.POST,
    body,
  });
  const res = await ctx.sendRequest(req, opts);
  return ctx.handleResponse(res, {}, true);
}
/**
 * Creates list of users with given input array
 * Creates list of users with given input array
 * Tags: user
 */
export async function createUsersWithListInput<
  FetcherData extends r.BaseFetcherData,
>(
  ctx: r.Context<AuthMethods, FetcherData>,
  params: {},
  body: User[],
  opts?: FetcherData,
): Promise<r.StatusResponse<200, User> | r.StatusResponse<'default', unknown>> {
  const req = await ctx.createRequest({
    path: '/user/createWithList',
    params,
    method: r.HttpMethod.POST,
    body,
  });
  const res = await ctx.sendRequest(req, opts);
  return ctx.handleResponse(res, {}, true);
}
/**
 * Logs user into the system
 * Tags: user
 */
export async function loginUser<FetcherData extends r.BaseFetcherData>(
  ctx: r.Context<AuthMethods, FetcherData>,
  params: {
    username?: string;
    password?: string;
  },
  opts?: FetcherData,
): Promise<r.StatusResponse<200, string> | r.StatusResponse<400, unknown>> {
  const req = await ctx.createRequest({
    path: '/user/login',
    params,
    method: r.HttpMethod.GET,
    queryParams: ['username', 'password'],
  });
  const res = await ctx.sendRequest(req, opts);
  return ctx.handleResponse(res, {}, true);
}
/**
 * Logs out current logged in user session
 * Tags: user
 */
export async function logoutUser<FetcherData extends r.BaseFetcherData>(
  ctx: r.Context<AuthMethods, FetcherData>,
  params: {},
  opts?: FetcherData,
): Promise<r.StatusResponse<'default', unknown>> {
  const req = await ctx.createRequest({
    path: '/user/logout',
    params,
    method: r.HttpMethod.GET,
  });
  const res = await ctx.sendRequest(req, opts);
  return ctx.handleResponse(res, {}, true);
}
/**
 * Get user by user name
 * Tags: user
 */
export async function getUserByName<FetcherData extends r.BaseFetcherData>(
  ctx: r.Context<AuthMethods, FetcherData>,
  params: {
    username: string;
  },
  opts?: FetcherData,
): Promise<
  | r.StatusResponse<200, User>
  | r.StatusResponse<400, unknown>
  | r.StatusResponse<404, unknown>
> {
  const req = await ctx.createRequest({
    path: '/user/{username}',
    params,
    method: r.HttpMethod.GET,
  });
  const res = await ctx.sendRequest(req, opts);
  return ctx.handleResponse(res, {}, true);
}
/**
 * Update user
 * This can only be done by the logged in user.
 * Tags: user
 */
export async function updateUser<FetcherData extends r.BaseFetcherData>(
  ctx: r.Context<AuthMethods, FetcherData>,
  params: {
    username: string;
  },
  body: User,
  opts?: FetcherData,
): Promise<r.StatusResponse<'default', unknown>> {
  const req = await ctx.createRequest({
    path: '/user/{username}',
    params,
    method: r.HttpMethod.PUT,
    body,
  });
  const res = await ctx.sendRequest(req, opts);
  return ctx.handleResponse(res, {}, true);
}
/**
 * Delete user
 * This can only be done by the logged in user.
 * Tags: user
 */
export async function deleteUser<FetcherData extends r.BaseFetcherData>(
  ctx: r.Context<AuthMethods, FetcherData>,
  params: {
    username: string;
  },
  opts?: FetcherData,
): Promise<r.StatusResponse<400, unknown> | r.StatusResponse<404, unknown>> {
  const req = await ctx.createRequest({
    path: '/user/{username}',
    params,
    method: r.HttpMethod.DELETE,
  });
  const res = await ctx.sendRequest(req, opts);
  return ctx.handleResponse(res, {}, true);
}
