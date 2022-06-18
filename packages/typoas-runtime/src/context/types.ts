import type { Fetcher, HttpMethod, SerializerOptions } from '../fetcher';
import type { TransformField } from '../transformers';
import type { SecurityAuthentication } from '../auth';
import type { TransformResolver } from '../resolver';
import type { Transform } from '../transformers';
import type { BaseServerConfiguration } from '../configuration';

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

export type ContextParams = {
  resolver: TransformResolver;
  serverConfiguration: BaseServerConfiguration;
  fetcher?: Fetcher;
  transformers?: Record<string, Transform<unknown, unknown>>;
  serializerOptions?: SerializerOptions;
  authMethods?: Record<string, SecurityAuthentication>;
};

export type ResponseHandler = {
  success?: boolean;
  transforms?: Record<string, TransformField>;
};
