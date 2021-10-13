import * as r from '@typoas/runtime';
export type Order = {
  /**
   * @example 10
   *
   */
  id?: number;
  /**
   * @example 198772
   *
   */
  petId?: number;
  /**
   * @example 7
   *
   */
  quantity?: number;
  shipDate?: Date;
  /**
   * Order Status
   * @example "approved"
   *
   */
  status?: 'placed' | 'approved' | 'delivered';
  complete?: boolean;
};
export type Customer = {
  /**
   * @example 100000
   *
   */
  id?: number;
  /**
   * @example "fehguy"
   *
   */
  username?: string;
  address?: Address[];
};
export type Address = {
  /**
   * @example "437 Lytton"
   *
   */
  street?: string;
  /**
   * @example "Palo Alto"
   *
   */
  city?: string;
  /**
   * @example "CA"
   *
   */
  state?: string;
  /**
   * @example "94301"
   *
   */
  zip?: string;
};
export type Category = {
  /**
   * @example 1
   *
   */
  id?: number;
  /**
   * @example "Dogs"
   *
   */
  name?: string;
};
export type User = {
  /**
   * @example 10
   *
   */
  id?: number;
  /**
   * @example "theUser"
   *
   */
  username?: string;
  /**
   * @example "John"
   *
   */
  firstName?: string;
  /**
   * @example "James"
   *
   */
  lastName?: string;
  /**
   * @example "john@email.com"
   *
   */
  email?: string;
  /**
   * @example "12345"
   *
   */
  password?: string;
  /**
   * @example "12345"
   *
   */
  phone?: string;
  /**
   * User Status
   * @example 1
   *
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
   *
   */
  id?: number;
  /**
   * @example "doggie"
   *
   */
  name: string;
  category?: Category;
  photoUrls: string[];
  tags?: Tag[];
  /**
   * pet status in the store
   *
   */
  status?: 'available' | 'pending' | 'sold';
};
export type ApiResponse = {
  code?: number;
  type?: string;
  message?: string;
};
type AuthMethods = {
  petstore_auth?: r.AuthProvider<r.BaseFlowConfig>;
  api_key?: r.AuthProvider<string>;
};
function configureAuthMethods(config: AuthMethods): {
  petstore_auth: r.SecurityAuthentication;
  api_key: r.SecurityAuthentication;
} {
  return {
    petstore_auth: new r.OAuth2SecurityAuthentication({}, config.petstore_auth),
    api_key: new r.ApiKeySecurityAuthentication(
      { name: 'api_key', in: 'header' },
      config.api_key,
    ),
  };
}
export class PetstoreClient {
  private authMethods: {
    petstore_auth: r.SecurityAuthentication;
    api_key: r.SecurityAuthentication;
  };
  constructor(
    private server: r.BaseServerConfiguration,
    authMethodConfig: AuthMethods,
    private http: r.HttpLibrary = new r.IsomorphicFetchHttpLibrary(),
    private resolver: r.SchemaRefResolver = new r.RefResolver(
      JSON.parse(
        '{"Order":{"type":"object","properties":{"id":{"type":"integer","format":"int64"},"petId":{"type":"integer","format":"int64"},"quantity":{"type":"integer","format":"int32"},"shipDate":{"type":"string","format":"date-time"},"status":{"type":"string"},"complete":{"type":"boolean"}}},"Customer":{"type":"object","properties":{"id":{"type":"integer","format":"int64"},"username":{"type":"string"},"address":{"type":"array","items":{"$ref":"#/components/schemas/Address"}}}},"Address":{"type":"object","properties":{"street":{"type":"string"},"city":{"type":"string"},"state":{"type":"string"},"zip":{"type":"string"}}},"Category":{"type":"object","properties":{"id":{"type":"integer","format":"int64"},"name":{"type":"string"}}},"User":{"type":"object","properties":{"id":{"type":"integer","format":"int64"},"username":{"type":"string"},"firstName":{"type":"string"},"lastName":{"type":"string"},"email":{"type":"string"},"password":{"type":"string"},"phone":{"type":"string"},"userStatus":{"type":"integer","format":"int32"}}},"Tag":{"type":"object","properties":{"id":{"type":"integer","format":"int64"},"name":{"type":"string"}}},"Pet":{"type":"object","properties":{"id":{"type":"integer","format":"int64"},"name":{"type":"string"},"category":{"$ref":"#/components/schemas/Category"},"photoUrls":{"type":"array","items":{"type":"string","xml":{"name":"photoUrl"}}},"tags":{"type":"array","items":{"$ref":"#/components/schemas/Tag"}},"status":{"type":"string"}}},"ApiResponse":{"type":"object","properties":{"code":{"type":"integer","format":"int32"},"type":{"type":"string"},"message":{"type":"string"}}}}',
      ),
    ),
  ) {
    this.authMethods = configureAuthMethods(authMethodConfig);
  }
  /**
   * Update an existing pet
   * Update an existing pet by Id
   * Tags: pet
   *
   */
  async updatePet(params: {}, body: Pet): Promise<Pet> {
    const requestContext = this.server.makeRequestContext(
      r.applyTemplating('/pet', params),
      r.HttpMethod.PUT,
    );
    requestContext.setHeaderParam('Content-Type', 'application/json');
    requestContext.setBody(JSON.stringify(body));
    await this.authMethods.petstore_auth.applySecurityAuthentication(
      requestContext,
    );
    const res = await this.http.send(requestContext);
    if (r.isCodeInRange('200', res.httpStatusCode))
      return r.handleResponse(
        res,
        JSON.parse('{"$ref":"#/components/schemas/Pet"}'),
        this.resolver,
      );
    if (r.isCodeInRange('400', res.httpStatusCode))
      throw new r.ApiException<any>(
        res.httpStatusCode,
        await r.handleResponse(res, {}, this.resolver),
      );
    if (r.isCodeInRange('404', res.httpStatusCode))
      throw new r.ApiException<any>(
        res.httpStatusCode,
        await r.handleResponse(res, {}, this.resolver),
      );
    if (r.isCodeInRange('405', res.httpStatusCode))
      throw new r.ApiException<any>(
        res.httpStatusCode,
        await r.handleResponse(res, {}, this.resolver),
      );
    throw new r.ApiException(
      res.httpStatusCode,
      await r.handleResponse(res, {}, this.resolver),
    );
  }
  /**
   * Add a new pet to the store
   * Add a new pet to the store
   * Tags: pet
   *
   */
  async addPet(params: {}, body: Pet): Promise<Pet> {
    const requestContext = this.server.makeRequestContext(
      r.applyTemplating('/pet', params),
      r.HttpMethod.POST,
    );
    requestContext.setHeaderParam('Content-Type', 'application/json');
    requestContext.setBody(JSON.stringify(body));
    await this.authMethods.petstore_auth.applySecurityAuthentication(
      requestContext,
    );
    const res = await this.http.send(requestContext);
    if (r.isCodeInRange('200', res.httpStatusCode))
      return r.handleResponse(
        res,
        JSON.parse('{"$ref":"#/components/schemas/Pet"}'),
        this.resolver,
      );
    if (r.isCodeInRange('405', res.httpStatusCode))
      throw new r.ApiException<any>(
        res.httpStatusCode,
        await r.handleResponse(res, {}, this.resolver),
      );
    throw new r.ApiException(
      res.httpStatusCode,
      await r.handleResponse(res, {}, this.resolver),
    );
  }
  /**
   * Finds Pets by status
   * Multiple status values can be provided with comma separated strings
   * Tags: pet
   *
   */
  async findPetsByStatus(params: {
    status?: 'available' | 'pending' | 'sold';
  }): Promise<Pet[]> {
    const requestContext = this.server.makeRequestContext(
      r.applyTemplating('/pet/findByStatus', params),
      r.HttpMethod.GET,
    );
    requestContext.setHeaderParam('Content-Type', 'application/json');
    if (params.status !== undefined)
      requestContext.setQueryParam(
        'status',
        r.serializeParameter(params.status),
      );
    await this.authMethods.petstore_auth.applySecurityAuthentication(
      requestContext,
    );
    const res = await this.http.send(requestContext);
    if (r.isCodeInRange('200', res.httpStatusCode))
      return r.handleResponse(
        res,
        JSON.parse(
          '{"type":"array","items":{"$ref":"#/components/schemas/Pet"}}',
        ),
        this.resolver,
      );
    if (r.isCodeInRange('400', res.httpStatusCode))
      throw new r.ApiException<any>(
        res.httpStatusCode,
        await r.handleResponse(res, {}, this.resolver),
      );
    throw new r.ApiException(
      res.httpStatusCode,
      await r.handleResponse(res, {}, this.resolver),
    );
  }
  /**
   * Finds Pets by tags
   * Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.
   * Tags: pet
   *
   */
  async findPetsByTags(params: { tags?: string[] }): Promise<Pet[]> {
    const requestContext = this.server.makeRequestContext(
      r.applyTemplating('/pet/findByTags', params),
      r.HttpMethod.GET,
    );
    requestContext.setHeaderParam('Content-Type', 'application/json');
    if (params.tags !== undefined)
      requestContext.setQueryParam('tags', r.serializeParameter(params.tags));
    await this.authMethods.petstore_auth.applySecurityAuthentication(
      requestContext,
    );
    const res = await this.http.send(requestContext);
    if (r.isCodeInRange('200', res.httpStatusCode))
      return r.handleResponse(
        res,
        JSON.parse(
          '{"type":"array","items":{"$ref":"#/components/schemas/Pet"}}',
        ),
        this.resolver,
      );
    if (r.isCodeInRange('400', res.httpStatusCode))
      throw new r.ApiException<any>(
        res.httpStatusCode,
        await r.handleResponse(res, {}, this.resolver),
      );
    throw new r.ApiException(
      res.httpStatusCode,
      await r.handleResponse(res, {}, this.resolver),
    );
  }
  /**
   * Find pet by ID
   * Returns a single pet
   * Tags: pet
   *
   */
  async getPetById(params: { petId: number }): Promise<Pet> {
    const requestContext = this.server.makeRequestContext(
      r.applyTemplating('/pet/{petId}', params),
      r.HttpMethod.GET,
    );
    requestContext.setHeaderParam('Content-Type', 'application/json');
    await this.authMethods.api_key.applySecurityAuthentication(requestContext);
    await this.authMethods.petstore_auth.applySecurityAuthentication(
      requestContext,
    );
    const res = await this.http.send(requestContext);
    if (r.isCodeInRange('200', res.httpStatusCode))
      return r.handleResponse(
        res,
        JSON.parse('{"$ref":"#/components/schemas/Pet"}'),
        this.resolver,
      );
    if (r.isCodeInRange('400', res.httpStatusCode))
      throw new r.ApiException<any>(
        res.httpStatusCode,
        await r.handleResponse(res, {}, this.resolver),
      );
    if (r.isCodeInRange('404', res.httpStatusCode))
      throw new r.ApiException<any>(
        res.httpStatusCode,
        await r.handleResponse(res, {}, this.resolver),
      );
    throw new r.ApiException(
      res.httpStatusCode,
      await r.handleResponse(res, {}, this.resolver),
    );
  }
  /**
   * Updates a pet in the store with form data
   * Tags: pet
   *
   */
  async updatePetWithForm(params: {
    petId: number;
    name?: string;
    status?: string;
  }): Promise<any> {
    const requestContext = this.server.makeRequestContext(
      r.applyTemplating('/pet/{petId}', params),
      r.HttpMethod.POST,
    );
    requestContext.setHeaderParam('Content-Type', 'application/json');
    if (params.name !== undefined)
      requestContext.setQueryParam('name', r.serializeParameter(params.name));
    if (params.status !== undefined)
      requestContext.setQueryParam(
        'status',
        r.serializeParameter(params.status),
      );
    await this.authMethods.petstore_auth.applySecurityAuthentication(
      requestContext,
    );
    const res = await this.http.send(requestContext);
    if (r.isCodeInRange('2XX', res.httpStatusCode))
      return r.handleResponse(
        res,
        JSON.parse('{"type":"object"}'),
        this.resolver,
      );
    if (r.isCodeInRange('405', res.httpStatusCode))
      throw new r.ApiException<any>(
        res.httpStatusCode,
        await r.handleResponse(res, {}, this.resolver),
      );
    throw new r.ApiException(
      res.httpStatusCode,
      await r.handleResponse(res, {}, this.resolver),
    );
  }
  /**
   * Deletes a pet
   * Tags: pet
   *
   */
  async deletePet(params: { api_key?: string; petId: number }): Promise<any> {
    const requestContext = this.server.makeRequestContext(
      r.applyTemplating('/pet/{petId}', params),
      r.HttpMethod.DELETE,
    );
    requestContext.setHeaderParam('Content-Type', 'application/json');
    if (params.api_key !== undefined)
      requestContext.setHeaderParam(
        'api_key',
        r.serializeParameter(params.api_key),
      );
    await this.authMethods.petstore_auth.applySecurityAuthentication(
      requestContext,
    );
    const res = await this.http.send(requestContext);
    if (r.isCodeInRange('2XX', res.httpStatusCode))
      return r.handleResponse(
        res,
        JSON.parse('{"type":"object"}'),
        this.resolver,
      );
    if (r.isCodeInRange('400', res.httpStatusCode))
      throw new r.ApiException<any>(
        res.httpStatusCode,
        await r.handleResponse(res, {}, this.resolver),
      );
    throw new r.ApiException(
      res.httpStatusCode,
      await r.handleResponse(res, {}, this.resolver),
    );
  }
  /**
   * uploads an image
   * Tags: pet
   *
   */
  async uploadFile(
    params: {
      petId: number;
      additionalMetadata?: string;
    },
    body: any,
  ): Promise<ApiResponse> {
    const requestContext = this.server.makeRequestContext(
      r.applyTemplating('/pet/{petId}/uploadImage', params),
      r.HttpMethod.POST,
    );
    requestContext.setHeaderParam('Content-Type', 'application/json');
    if (params.additionalMetadata !== undefined)
      requestContext.setQueryParam(
        'additionalMetadata',
        r.serializeParameter(params.additionalMetadata),
      );
    requestContext.setBody(JSON.stringify(body));
    await this.authMethods.petstore_auth.applySecurityAuthentication(
      requestContext,
    );
    const res = await this.http.send(requestContext);
    if (r.isCodeInRange('200', res.httpStatusCode))
      return r.handleResponse(
        res,
        JSON.parse('{"$ref":"#/components/schemas/ApiResponse"}'),
        this.resolver,
      );
    throw new r.ApiException(
      res.httpStatusCode,
      await r.handleResponse(res, {}, this.resolver),
    );
  }
  /**
   * Returns pet inventories by status
   * Returns a map of status codes to quantities
   * Tags: store
   *
   */
  async getInventory(params: {}): Promise<{
    [key: string]: number;
  }> {
    const requestContext = this.server.makeRequestContext(
      r.applyTemplating('/store/inventory', params),
      r.HttpMethod.GET,
    );
    requestContext.setHeaderParam('Content-Type', 'application/json');
    await this.authMethods.api_key.applySecurityAuthentication(requestContext);
    const res = await this.http.send(requestContext);
    if (r.isCodeInRange('200', res.httpStatusCode))
      return r.handleResponse(
        res,
        JSON.parse(
          '{"type":"object","additionalProperties":{"type":"integer","format":"int32"}}',
        ),
        this.resolver,
      );
    throw new r.ApiException(
      res.httpStatusCode,
      await r.handleResponse(res, {}, this.resolver),
    );
  }
  /**
   * Place an order for a pet
   * Place a new order in the store
   * Tags: store
   *
   */
  async placeOrder(params: {}, body: Order): Promise<Order> {
    const requestContext = this.server.makeRequestContext(
      r.applyTemplating('/store/order', params),
      r.HttpMethod.POST,
    );
    requestContext.setHeaderParam('Content-Type', 'application/json');
    requestContext.setBody(JSON.stringify(body));
    const res = await this.http.send(requestContext);
    if (r.isCodeInRange('200', res.httpStatusCode))
      return r.handleResponse(
        res,
        JSON.parse('{"$ref":"#/components/schemas/Order"}'),
        this.resolver,
      );
    if (r.isCodeInRange('405', res.httpStatusCode))
      throw new r.ApiException<any>(
        res.httpStatusCode,
        await r.handleResponse(res, {}, this.resolver),
      );
    throw new r.ApiException(
      res.httpStatusCode,
      await r.handleResponse(res, {}, this.resolver),
    );
  }
  /**
   * Find purchase order by ID
   * For valid response try integer IDs with value <= 5 or > 10. Other values will generated exceptions
   * Tags: store
   *
   */
  async getOrderById(params: { orderId: number }): Promise<Order> {
    const requestContext = this.server.makeRequestContext(
      r.applyTemplating('/store/order/{orderId}', params),
      r.HttpMethod.GET,
    );
    requestContext.setHeaderParam('Content-Type', 'application/json');
    const res = await this.http.send(requestContext);
    if (r.isCodeInRange('200', res.httpStatusCode))
      return r.handleResponse(
        res,
        JSON.parse('{"$ref":"#/components/schemas/Order"}'),
        this.resolver,
      );
    if (r.isCodeInRange('400', res.httpStatusCode))
      throw new r.ApiException<any>(
        res.httpStatusCode,
        await r.handleResponse(res, {}, this.resolver),
      );
    if (r.isCodeInRange('404', res.httpStatusCode))
      throw new r.ApiException<any>(
        res.httpStatusCode,
        await r.handleResponse(res, {}, this.resolver),
      );
    throw new r.ApiException(
      res.httpStatusCode,
      await r.handleResponse(res, {}, this.resolver),
    );
  }
  /**
   * Delete purchase order by ID
   * For valid response try integer IDs with value < 1000. Anything above 1000 or nonintegers will generate API errors
   * Tags: store
   *
   */
  async deleteOrder(params: { orderId: number }): Promise<any> {
    const requestContext = this.server.makeRequestContext(
      r.applyTemplating('/store/order/{orderId}', params),
      r.HttpMethod.DELETE,
    );
    requestContext.setHeaderParam('Content-Type', 'application/json');
    const res = await this.http.send(requestContext);
    if (r.isCodeInRange('2XX', res.httpStatusCode))
      return r.handleResponse(
        res,
        JSON.parse('{"type":"object"}'),
        this.resolver,
      );
    if (r.isCodeInRange('400', res.httpStatusCode))
      throw new r.ApiException<any>(
        res.httpStatusCode,
        await r.handleResponse(res, {}, this.resolver),
      );
    if (r.isCodeInRange('404', res.httpStatusCode))
      throw new r.ApiException<any>(
        res.httpStatusCode,
        await r.handleResponse(res, {}, this.resolver),
      );
    throw new r.ApiException(
      res.httpStatusCode,
      await r.handleResponse(res, {}, this.resolver),
    );
  }
  /**
   * Create user
   * This can only be done by the logged in user.
   * Tags: user
   *
   */
  async createUser(params: {}, body: User): Promise<User> {
    const requestContext = this.server.makeRequestContext(
      r.applyTemplating('/user', params),
      r.HttpMethod.POST,
    );
    requestContext.setHeaderParam('Content-Type', 'application/json');
    requestContext.setBody(JSON.stringify(body));
    const res = await this.http.send(requestContext);
    if (r.isCodeInRange('default', res.httpStatusCode))
      return r.handleResponse(
        res,
        JSON.parse('{"$ref":"#/components/schemas/User"}'),
        this.resolver,
      );
    throw new r.ApiException(
      res.httpStatusCode,
      await r.handleResponse(res, {}, this.resolver),
    );
  }
  /**
   * Creates list of users with given input array
   * Creates list of users with given input array
   * Tags: user
   *
   */
  async createUsersWithListInput(params: {}, body: User[]): Promise<User> {
    const requestContext = this.server.makeRequestContext(
      r.applyTemplating('/user/createWithList', params),
      r.HttpMethod.POST,
    );
    requestContext.setHeaderParam('Content-Type', 'application/json');
    requestContext.setBody(JSON.stringify(body));
    const res = await this.http.send(requestContext);
    if (r.isCodeInRange('200', res.httpStatusCode))
      return r.handleResponse(
        res,
        JSON.parse('{"$ref":"#/components/schemas/User"}'),
        this.resolver,
      );
    if (r.isCodeInRange('default', res.httpStatusCode))
      throw new r.ApiException<any>(
        res.httpStatusCode,
        await r.handleResponse(res, {}, this.resolver),
      );
    throw new r.ApiException(
      res.httpStatusCode,
      await r.handleResponse(res, {}, this.resolver),
    );
  }
  /**
   * Logs user into the system
   * Tags: user
   *
   */
  async loginUser(params: {
    username?: string;
    password?: string;
  }): Promise<string> {
    const requestContext = this.server.makeRequestContext(
      r.applyTemplating('/user/login', params),
      r.HttpMethod.GET,
    );
    requestContext.setHeaderParam('Content-Type', 'application/json');
    if (params.username !== undefined)
      requestContext.setQueryParam(
        'username',
        r.serializeParameter(params.username),
      );
    if (params.password !== undefined)
      requestContext.setQueryParam(
        'password',
        r.serializeParameter(params.password),
      );
    const res = await this.http.send(requestContext);
    if (r.isCodeInRange('200', res.httpStatusCode))
      return r.handleResponse(
        res,
        JSON.parse('{"type":"string"}'),
        this.resolver,
      );
    if (r.isCodeInRange('400', res.httpStatusCode))
      throw new r.ApiException<any>(
        res.httpStatusCode,
        await r.handleResponse(res, {}, this.resolver),
      );
    throw new r.ApiException(
      res.httpStatusCode,
      await r.handleResponse(res, {}, this.resolver),
    );
  }
  /**
   * Logs out current logged in user session
   * Tags: user
   *
   */
  async logoutUser(params: {}): Promise<any> {
    const requestContext = this.server.makeRequestContext(
      r.applyTemplating('/user/logout', params),
      r.HttpMethod.GET,
    );
    requestContext.setHeaderParam('Content-Type', 'application/json');
    const res = await this.http.send(requestContext);
    if (r.isCodeInRange('default', res.httpStatusCode))
      return r.handleResponse(res, {}, this.resolver);
    throw new r.ApiException(
      res.httpStatusCode,
      await r.handleResponse(res, {}, this.resolver),
    );
  }
  /**
   * Get user by user name
   * Tags: user
   *
   */
  async getUserByName(params: { username: string }): Promise<User> {
    const requestContext = this.server.makeRequestContext(
      r.applyTemplating('/user/{username}', params),
      r.HttpMethod.GET,
    );
    requestContext.setHeaderParam('Content-Type', 'application/json');
    const res = await this.http.send(requestContext);
    if (r.isCodeInRange('200', res.httpStatusCode))
      return r.handleResponse(
        res,
        JSON.parse('{"$ref":"#/components/schemas/User"}'),
        this.resolver,
      );
    if (r.isCodeInRange('400', res.httpStatusCode))
      throw new r.ApiException<any>(
        res.httpStatusCode,
        await r.handleResponse(res, {}, this.resolver),
      );
    if (r.isCodeInRange('404', res.httpStatusCode))
      throw new r.ApiException<any>(
        res.httpStatusCode,
        await r.handleResponse(res, {}, this.resolver),
      );
    throw new r.ApiException(
      res.httpStatusCode,
      await r.handleResponse(res, {}, this.resolver),
    );
  }
  /**
   * Update user
   * This can only be done by the logged in user.
   * Tags: user
   *
   */
  async updateUser(
    params: {
      username: string;
    },
    body: User,
  ): Promise<any> {
    const requestContext = this.server.makeRequestContext(
      r.applyTemplating('/user/{username}', params),
      r.HttpMethod.PUT,
    );
    requestContext.setHeaderParam('Content-Type', 'application/json');
    requestContext.setBody(JSON.stringify(body));
    const res = await this.http.send(requestContext);
    if (r.isCodeInRange('default', res.httpStatusCode))
      return r.handleResponse(res, {}, this.resolver);
    throw new r.ApiException(
      res.httpStatusCode,
      await r.handleResponse(res, {}, this.resolver),
    );
  }
  /**
   * Delete user
   * This can only be done by the logged in user.
   * Tags: user
   *
   */
  async deleteUser(params: { username: string }): Promise<any> {
    const requestContext = this.server.makeRequestContext(
      r.applyTemplating('/user/{username}', params),
      r.HttpMethod.DELETE,
    );
    requestContext.setHeaderParam('Content-Type', 'application/json');
    const res = await this.http.send(requestContext);
    if (r.isCodeInRange('2XX', res.httpStatusCode))
      return r.handleResponse(
        res,
        JSON.parse('{"type":"object"}'),
        this.resolver,
      );
    if (r.isCodeInRange('400', res.httpStatusCode))
      throw new r.ApiException<any>(
        res.httpStatusCode,
        await r.handleResponse(res, {}, this.resolver),
      );
    if (r.isCodeInRange('404', res.httpStatusCode))
      throw new r.ApiException<any>(
        res.httpStatusCode,
        await r.handleResponse(res, {}, this.resolver),
      );
    throw new r.ApiException(
      res.httpStatusCode,
      await r.handleResponse(res, {}, this.resolver),
    );
  }
}
