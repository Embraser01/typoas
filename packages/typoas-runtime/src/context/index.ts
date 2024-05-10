import type {
  ContextParams,
  CreateRequestParams,
  ResponseHandler,
} from './types';
import type { SecurityAuthentication } from '../auth';
import type { BaseServerConfiguration } from '../configuration';
import { ApiException } from '../exception';
import { applyTransform, Transform } from '../transformers';
import { DateTransformer } from '../transformers';
import {
  EnhancedHTTPStatus,
  Fetcher,
  IsomorphicFetchHttpLibrary,
  RequestContext,
  ResponseContext,
  SerializerOptions,
  StatusResponse,
} from '../fetcher';
import {
  applyTemplating,
  isBlob,
  isFormData,
  isHttpStatusValid,
  isURLSearchParams,
  serializeHeader,
  serializeParameter,
} from '../utils';

const CONTENT_TYPE_HEADER = 'content-type';

export class Context<
  AuthModes extends Record<string, SecurityAuthentication>,
  FetcherData = unknown,
> {
  fetcher: Fetcher<FetcherData>;
  serializerOptions: SerializerOptions;
  authMethods: Partial<AuthModes>;
  transformers: Record<string, Transform<unknown, unknown>>;
  serverConfiguration: BaseServerConfiguration;

  constructor(params: ContextParams<AuthModes, FetcherData>) {
    this.serverConfiguration = params.serverConfiguration;
    this.fetcher =
      params.fetcher || new IsomorphicFetchHttpLibrary<FetcherData>();
    this.serializerOptions = params.serializerOptions || {};
    this.authMethods = params.authMethods;
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
      // Some body types should not have content-type header
      // as it is set automatically by the browser
      // https://fetch.spec.whatwg.org/#concept-bodyinit-extract
      if (
        isBlob(options.body) ||
        isFormData(options.body) ||
        isURLSearchParams(options.body)
      ) {
        requestContext.setBody(options.body);
      } else {
        requestContext.setHeaderParam(
          CONTENT_TYPE_HEADER,
          options.contentType || 'application/json;charset=UTF-8',
        );
        requestContext.setBody(JSON.stringify(options.body));
      }
    }
    if (options.auth?.length) {
      for (const mode of options.auth) {
        await this.authMethods[mode]?.applySecurityAuthentication(
          requestContext,
        );
      }
    }
    return requestContext;
  }

  /**
   * Sends a request.
   */
  sendRequest(
    request: RequestContext,
    options?: FetcherData,
  ): Promise<ResponseContext> {
    return this.fetcher.send(request, options);
  }

  /**
   * Apply transformations (like Dates) to the response body.
   * Uses the response status code to find the correct handler (schema).
   */
  private async transformResponse(
    res: ResponseContext,
    handlers?: Record<string, ResponseHandler>,
  ): Promise<unknown> {
    const contentType = res.headers[CONTENT_TYPE_HEADER];

    if (contentType?.includes('text/')) {
      return res.body.text();
    }
    if (!contentType?.includes('application/json')) {
      return res.body.binary();
    }

    const rangeCode = `${res.httpStatusCode.toString().slice(0, 1)}XX`;
    const handler =
      handlers?.[res.httpStatusCode] ||
      handlers?.[rangeCode] ||
      handlers?.default;

    const body = await res.body.json();

    if (handler?.transforms) {
      for (const [key, transformer] of Object.entries(this.transformers)) {
        const transforms = handler.transforms[key];
        if (transforms) {
          for (const transform of transforms) {
            applyTransform({ body }, 'body', key, transformer, transform, 0);
          }
        }
      }
    }
    return body;
  }

  /**
   * Handle response by applying transforms.
   *
   * When fullResponseMode is set, all responses will be returned as a StatusResponse object
   * instead of throwing on non-2xx status codes.
   *
   * Note that the possibility of disabling this mode might be removed in the future.
   */
  async handleResponse<T = unknown>(
    res: ResponseContext,
    handlers?: Record<string, ResponseHandler>,
    fullResponseMode = false,
  ): Promise<T> {
    if (fullResponseMode) {
      let body: unknown;

      // Empty body codes
      if (res.httpStatusCode === 204 || res.httpStatusCode === 304) {
        body = null;
      } else {
        body = await this.transformResponse(res, handlers);
      }

      const r: StatusResponse<EnhancedHTTPStatus> = {
        data: body,
        headers: res.headers,
        ok: isHttpStatusValid(res.httpStatusCode),
        status: res.httpStatusCode,
      };
      return r as T;
    }

    if (res.httpStatusCode === 204 || res.httpStatusCode === 304 || !res.body) {
      if (isHttpStatusValid(res.httpStatusCode)) {
        // In case there isn't body, force return value to null
        return null as unknown as T;
      }
      throw new ApiException(res.httpStatusCode, null);
    }

    const body = await this.transformResponse(res, handlers);

    // Do not throw on valid http status code.
    if (isHttpStatusValid(res.httpStatusCode)) {
      return body as T;
    }
    throw new ApiException(res.httpStatusCode, body);
  }
}
