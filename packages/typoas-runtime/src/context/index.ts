import type {
  ContextParams,
  CreateRequestParams,
  ResponseHandler,
} from './types';
import type { SecurityAuthentication } from '../auth';
import type { TransformResolver } from '../resolver';
import type { BaseServerConfiguration } from '../configuration';
import { ApiException } from '../exception';
import { applyTransform, Transform, TransformField } from '../transformers';
import { DateTransformer } from '../transformers';
import {
  Fetcher,
  IsomorphicFetchHttpLibrary,
  RequestContext,
  ResponseContext,
  SerializerOptions,
} from '../fetcher';
import {
  applyTemplating,
  isCodeInRange,
  serializeHeader,
  serializeParameter,
} from '../utils';

export class Context {
  fetcher: Fetcher;
  serializerOptions: SerializerOptions;
  authMethods: Record<string, SecurityAuthentication>;
  resolver: TransformResolver;
  transformers: Record<string, Transform<unknown, unknown>>;
  serverConfiguration: BaseServerConfiguration;

  constructor(params: ContextParams) {
    this.resolver = params.resolver;
    this.serverConfiguration = params.serverConfiguration;
    this.fetcher = params.fetcher || new IsomorphicFetchHttpLibrary();
    this.serializerOptions = params.serializerOptions || {};
    this.authMethods = params.authMethods || {};
    this.transformers = params.transformers || { date: DateTransformer };
  }

  /**
   * Creates a request context ready to be sent.
   */
  async createRequest(options: CreateRequestParams): Promise<RequestContext> {
    const path = applyTemplating(options.path, options.params);

    const requestContext = new RequestContext(
      this.serverConfiguration.getURL(path),
      options.method,
      this.serializerOptions,
    );

    if (options.headers) {
      for (const [key, value] of Object.entries(options.headers)) {
        requestContext.setHeaderParam(key, serializeHeader(value));
      }
    }
    if (options.queryParams?.length) {
      for (const queryParam of options.queryParams) {
        if (options.params[queryParam] !== undefined) {
          requestContext.setQueryParam(
            queryParam,
            serializeParameter(options.params[queryParam]),
          );
        }
      }
    }
    if (options.body !== undefined) {
      requestContext.setBody(JSON.stringify(options.body));
    }
    if (options.auth?.length) {
      for (const mode of options.auth) {
        // TODO Log if auth mode is not found
        if (this.authMethods[mode]) {
          await this.authMethods[mode].applySecurityAuthentication(
            requestContext,
          );
        }
      }
    }
    return requestContext;
  }

  /**
   * Sends a request.
   */
  sendRequest(request: RequestContext): Promise<ResponseContext> {
    return this.fetcher.send(request);
  }

  /**
   * Handle response by applying transforms.
   */
  async handleResponse<T = unknown>(
    res: ResponseContext,
    handlers: Record<string, ResponseHandler>,
  ): Promise<T> {
    let statusCode = Object.keys(handlers)
      .filter((code) => code !== 'default')
      .find((code) => isCodeInRange(code, res.httpStatusCode));

    if (!statusCode && handlers.default) {
      statusCode = 'default';
    }
    if (!statusCode) {
      throw new ApiException(
        res.httpStatusCode,
        `No handler for status code ${res.httpStatusCode}`,
      );
    }
    const handler = handlers[statusCode];

    const body = {}; // TODO Parse body from response

    if (handler.transforms) {
      for (const [key, transformer] of Object.entries(this.transformers)) {
        const transform = handler.transforms[key];
        if (transform) {
          applyTransform({ body }, 'body', transformer, transform, 0);
        }
      }
    }

    if (handler.success) {
      return body as T;
    }
    throw new ApiException(res.httpStatusCode, body);
  }

  resolve(type: string, ref: string): TransformField {
    return this.resolver.getTransforms(type, ref);
  }
}