import { HttpMethod } from '../http/http';
import { Transform, TransformField } from './transform';

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
  headers: Record<string, string>;
  /**
   * Body of the request.
   */
  body?: unknown;
  /**
   * List of query params to be taken from params.
   */
  queryParams?: string[];
  /**
   * Name of the auth mode to be used.
   */
  auth?: string;
};

export type ResponseHandler = {
  success?: boolean;
  transform: TransformField;
};
