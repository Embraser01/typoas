import type { Fetcher, HttpMethod, SerializerOptions } from '../fetcher';
import type { TransformEntity } from '../transformers';
import type { AuthProvider, SecurityAuthentication } from '../auth';
import type { Transform } from '../transformers';
import type { BaseServerConfiguration } from '../configuration';
import type {
  ApiKeySecurityAuthentication,
  BaseFlowConfig,
  BasicAuthConfig,
  BearerAuthConfig,
  HttpBasicSecurityAuthentication,
  HttpBearerSecurityAuthentication,
  OAuth2SecurityAuthentication,
} from '../auth';

export type CreateRequestParams = {
  /**
   * Method used by the request.
   */
  method: HttpMethod;
  /**
   * Raw path of the request. Params needed to be added to the path
   * will be added by the context.
   */
  path: string;
  /**
   * Params that will be used to be added to path or query params.
   */
  params: Record<string, unknown>;
  /**
   * Headers to be added to the request.
   */
  headers?: Record<string, unknown>;
  /**
   * Body of the request.
   */
  body?: unknown;
  /**
   * List of query params to be taken from params.
   */
  queryParams?: string[];
  /**
   * Name of the auth modes to be used.
   */
  auth?: string[];
  /**
   * Content type of the request.
   * If not provided, it will set to application/json.
   * If body is a FormData, Blob or URLSearchParams, it will not be set.
   */
  contentType?: string;
};

export type ContextParams<
  AuthModes extends Record<string, SecurityAuthentication>,
  FetcherData = unknown,
> = {
  serverConfiguration: BaseServerConfiguration;
  authMethods: Partial<AuthModes>;
  fetcher?: Fetcher<FetcherData>;
  transformers?: Record<string, Transform<unknown, unknown>>;
  serializerOptions?: SerializerOptions;
};

export type CreateContextParams<
  AuthModes extends Record<string, SecurityAuthentication>,
  FetcherData = unknown,
> = Partial<
  Omit<ContextParams<AuthModes, FetcherData>, 'authMethods'> & {
    authProviders: {
      [key in keyof AuthModes]: AuthProvider<
        AuthProviderConfig<AuthModes[key]>
      >;
    };
  }
>;

export type AuthProviderConfig<T extends SecurityAuthentication> =
  T extends ApiKeySecurityAuthentication
    ? string
    : T extends HttpBasicSecurityAuthentication
      ? BasicAuthConfig
      : T extends HttpBearerSecurityAuthentication
        ? BearerAuthConfig
        : T extends OAuth2SecurityAuthentication
          ? BaseFlowConfig
          : never;

export type ResponseHandler = {
  transforms?: TransformEntity;
};
