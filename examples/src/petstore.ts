import * as r from '@typoas/runtime';
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
export type Category = {
  /**
   * @example 1
   */
  id?: number;
  /**
   * @example "Dogs"
   */
  name?: string;
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
export function createContext(
  params?: r.CreateContextParams<AuthMethods>,
): r.Context<AuthMethods> {
  return new r.Context<AuthMethods>({
    resolver: new r.RefResolver({
      Order: {
        date: [[[r.TransformType.ACCESS, 'shipDate'], [r.TransformType.THIS]]],
      },
    }),
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
export async function updatePet(
  ctx: r.Context<AuthMethods>,
  params: {},
  body: Pet,
): Promise<Pet> {
  const req = await ctx.createRequest({
    path: '/pet',
    params,
    method: r.HttpMethod.PUT,
    body,
    auth: ['petstore_auth'],
  });
  const res = await ctx.sendRequest(req);
  return ctx.handleResponse(res, {
    '200': { transforms: { date: [[[r.TransformType.REF, 'Pet']]] } },
  });
}
/**
 * Add a new pet to the store
 * Add a new pet to the store
 * Tags: pet
 */
export async function addPet(
  ctx: r.Context<AuthMethods>,
  params: {},
  body: Pet,
): Promise<Pet> {
  const req = await ctx.createRequest({
    path: '/pet',
    params,
    method: r.HttpMethod.POST,
    body,
    auth: ['petstore_auth'],
  });
  const res = await ctx.sendRequest(req);
  return ctx.handleResponse(res, {
    '200': { transforms: { date: [[[r.TransformType.REF, 'Pet']]] } },
  });
}
/**
 * Finds Pets by status
 * Multiple status values can be provided with comma separated strings
 * Tags: pet
 */
export async function findPetsByStatus(
  ctx: r.Context<AuthMethods>,
  params: {
    status?: 'available' | 'pending' | 'sold';
  },
): Promise<Pet[]> {
  const req = await ctx.createRequest({
    path: '/pet/findByStatus',
    params,
    method: r.HttpMethod.GET,
    queryParams: ['status'],
    auth: ['petstore_auth'],
  });
  const res = await ctx.sendRequest(req);
  return ctx.handleResponse(res, {
    '200': {
      transforms: {
        date: [[[r.TransformType.LOOP], [r.TransformType.REF, 'Pet']]],
      },
    },
  });
}
/**
 * Finds Pets by tags
 * Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.
 * Tags: pet
 */
export async function findPetsByTags(
  ctx: r.Context<AuthMethods>,
  params: {
    tags?: string[];
  },
): Promise<Pet[]> {
  const req = await ctx.createRequest({
    path: '/pet/findByTags',
    params,
    method: r.HttpMethod.GET,
    queryParams: ['tags'],
    auth: ['petstore_auth'],
  });
  const res = await ctx.sendRequest(req);
  return ctx.handleResponse(res, {
    '200': {
      transforms: {
        date: [[[r.TransformType.LOOP], [r.TransformType.REF, 'Pet']]],
      },
    },
  });
}
/**
 * Find pet by ID
 * Returns a single pet
 * Tags: pet
 */
export async function getPetById(
  ctx: r.Context<AuthMethods>,
  params: {
    petId: number;
  },
): Promise<Pet> {
  const req = await ctx.createRequest({
    path: '/pet/{petId}',
    params,
    method: r.HttpMethod.GET,
    auth: ['api_key', 'petstore_auth'],
  });
  const res = await ctx.sendRequest(req);
  return ctx.handleResponse(res, {
    '200': { transforms: { date: [[[r.TransformType.REF, 'Pet']]] } },
  });
}
/**
 * Updates a pet in the store with form data
 * Tags: pet
 */
export async function updatePetWithForm(
  ctx: r.Context<AuthMethods>,
  params: {
    petId: number;
    name?: string;
    status?: string;
  },
): Promise<unknown> {
  const req = await ctx.createRequest({
    path: '/pet/{petId}',
    params,
    method: r.HttpMethod.POST,
    queryParams: ['name', 'status'],
    auth: ['petstore_auth'],
  });
  const res = await ctx.sendRequest(req);
  return ctx.handleResponse(res, {});
}
/**
 * Deletes a pet
 * Tags: pet
 */
export async function deletePet(
  ctx: r.Context<AuthMethods>,
  params: {
    api_key?: string;
    petId: number;
  },
): Promise<unknown> {
  const req = await ctx.createRequest({
    path: '/pet/{petId}',
    params,
    method: r.HttpMethod.DELETE,
    auth: ['petstore_auth'],
  });
  const res = await ctx.sendRequest(req);
  return ctx.handleResponse(res, {});
}
/**
 * uploads an image
 * Tags: pet
 */
export async function uploadFile(
  ctx: r.Context<AuthMethods>,
  params: {
    petId: number;
    additionalMetadata?: string;
  },
  body: Blob,
): Promise<ApiResponse> {
  const req = await ctx.createRequest({
    path: '/pet/{petId}/uploadImage',
    params,
    method: r.HttpMethod.POST,
    body,
    queryParams: ['additionalMetadata'],
    auth: ['petstore_auth'],
  });
  const res = await ctx.sendRequest(req);
  return ctx.handleResponse(res, {
    '200': { transforms: { date: [[[r.TransformType.REF, 'ApiResponse']]] } },
  });
}
/**
 * Returns pet inventories by status
 * Returns a map of status codes to quantities
 * Tags: store
 */
export async function getInventory(
  ctx: r.Context<AuthMethods>,
  params: {},
): Promise<{
  [key: string]: number;
}> {
  const req = await ctx.createRequest({
    path: '/store/inventory',
    params,
    method: r.HttpMethod.GET,
    auth: ['api_key'],
  });
  const res = await ctx.sendRequest(req);
  return ctx.handleResponse(res, {});
}
/**
 * Place an order for a pet
 * Place a new order in the store
 * Tags: store
 */
export async function placeOrder(
  ctx: r.Context<AuthMethods>,
  params: {},
  body: Order,
): Promise<Order> {
  const req = await ctx.createRequest({
    path: '/store/order',
    params,
    method: r.HttpMethod.POST,
    body,
  });
  const res = await ctx.sendRequest(req);
  return ctx.handleResponse(res, {
    '200': { transforms: { date: [[[r.TransformType.REF, 'Order']]] } },
  });
}
/**
 * Find purchase order by ID
 * For valid response try integer IDs with value <= 5 or > 10. Other values will generated exceptions
 * Tags: store
 */
export async function getOrderById(
  ctx: r.Context<AuthMethods>,
  params: {
    orderId: number;
  },
): Promise<Order> {
  const req = await ctx.createRequest({
    path: '/store/order/{orderId}',
    params,
    method: r.HttpMethod.GET,
  });
  const res = await ctx.sendRequest(req);
  return ctx.handleResponse(res, {
    '200': { transforms: { date: [[[r.TransformType.REF, 'Order']]] } },
  });
}
/**
 * Delete purchase order by ID
 * For valid response try integer IDs with value < 1000. Anything above 1000 or nonintegers will generate API errors
 * Tags: store
 */
export async function deleteOrder(
  ctx: r.Context<AuthMethods>,
  params: {
    orderId: number;
  },
): Promise<unknown> {
  const req = await ctx.createRequest({
    path: '/store/order/{orderId}',
    params,
    method: r.HttpMethod.DELETE,
  });
  const res = await ctx.sendRequest(req);
  return ctx.handleResponse(res, {});
}
/**
 * Create user
 * This can only be done by the logged in user.
 * Tags: user
 */
export async function createUser(
  ctx: r.Context<AuthMethods>,
  params: {},
  body: User,
): Promise<User> {
  const req = await ctx.createRequest({
    path: '/user',
    params,
    method: r.HttpMethod.POST,
    body,
  });
  const res = await ctx.sendRequest(req);
  return ctx.handleResponse(res, {
    default: { transforms: { date: [[[r.TransformType.REF, 'User']]] } },
  });
}
/**
 * Creates list of users with given input array
 * Creates list of users with given input array
 * Tags: user
 */
export async function createUsersWithListInput(
  ctx: r.Context<AuthMethods>,
  params: {},
  body: User[],
): Promise<User> {
  const req = await ctx.createRequest({
    path: '/user/createWithList',
    params,
    method: r.HttpMethod.POST,
    body,
  });
  const res = await ctx.sendRequest(req);
  return ctx.handleResponse(res, {
    '200': { transforms: { date: [[[r.TransformType.REF, 'User']]] } },
  });
}
/**
 * Logs user into the system
 * Tags: user
 */
export async function loginUser(
  ctx: r.Context<AuthMethods>,
  params: {
    username?: string;
    password?: string;
  },
): Promise<string> {
  const req = await ctx.createRequest({
    path: '/user/login',
    params,
    method: r.HttpMethod.GET,
    queryParams: ['username', 'password'],
  });
  const res = await ctx.sendRequest(req);
  return ctx.handleResponse(res, {});
}
/**
 * Logs out current logged in user session
 * Tags: user
 */
export async function logoutUser(
  ctx: r.Context<AuthMethods>,
  params: {},
): Promise<any> {
  const req = await ctx.createRequest({
    path: '/user/logout',
    params,
    method: r.HttpMethod.GET,
  });
  const res = await ctx.sendRequest(req);
  return ctx.handleResponse(res, {});
}
/**
 * Get user by user name
 * Tags: user
 */
export async function getUserByName(
  ctx: r.Context<AuthMethods>,
  params: {
    username: string;
  },
): Promise<User> {
  const req = await ctx.createRequest({
    path: '/user/{username}',
    params,
    method: r.HttpMethod.GET,
  });
  const res = await ctx.sendRequest(req);
  return ctx.handleResponse(res, {
    '200': { transforms: { date: [[[r.TransformType.REF, 'User']]] } },
  });
}
/**
 * Update user
 * This can only be done by the logged in user.
 * Tags: user
 */
export async function updateUser(
  ctx: r.Context<AuthMethods>,
  params: {
    username: string;
  },
  body: User,
): Promise<any> {
  const req = await ctx.createRequest({
    path: '/user/{username}',
    params,
    method: r.HttpMethod.PUT,
    body,
  });
  const res = await ctx.sendRequest(req);
  return ctx.handleResponse(res, {});
}
/**
 * Delete user
 * This can only be done by the logged in user.
 * Tags: user
 */
export async function deleteUser(
  ctx: r.Context<AuthMethods>,
  params: {
    username: string;
  },
): Promise<unknown> {
  const req = await ctx.createRequest({
    path: '/user/{username}',
    params,
    method: r.HttpMethod.DELETE,
  });
  const res = await ctx.sendRequest(req);
  return ctx.handleResponse(res, {});
}
