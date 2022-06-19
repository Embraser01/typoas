import type { Fetcher, HttpMethod, SerializerOptions } from '../fetcher';
import type { TransformField, TransformResolver } from '../transformers';
import type { AuthProvider, SecurityAuthentication } from '../auth';
import type { Transform } from '../transformers';
import type { BaseServerConfiguration } from '../configuration';
import type {
  ApiKeySecurityAuthentication,
  BaseFlowConfig,
  BasicAuthConfig,
  BearerAuthConfig,
  HttpSecurityAuthentication,
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
};

export type ContextParams<
  AuthModes extends Record<string, SecurityAuthentication>,
> = {
  resolver: TransformResolver;
  serverConfiguration: BaseServerConfiguration;
  authMethods: Partial<AuthModes>;
  fetcher?: Fetcher;
  transformers?: Record<string, Transform<unknown, unknown>>;
  serializerOptions?: SerializerOptions;
};

export type CreateContextParams<
  AuthModes extends Record<string, SecurityAuthentication>,
> = Omit<ContextParams<AuthModes>, 'authMethods'> & {
  authProviders: {
    [key in keyof AuthModes]: AuthProvider<
      AuthModes[key] extends ApiKeySecurityAuthentication
        ? string
        : AuthModes[key] extends HttpSecurityAuthentication
        ? BasicAuthConfig | BearerAuthConfig
        : AuthModes[key] extends OAuth2SecurityAuthentication
        ? BaseFlowConfig
        : never
    >;
  };
};

export type ResponseHandler = {
  transforms?: Record<string, TransformField[]>;
};
