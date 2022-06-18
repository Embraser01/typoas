import {
  HttpLibrary,
  IsomorphicFetchHttpLibrary,
  RequestContext,
  ResponseContext,
  SerializerOptions,
} from '../http/http';
import { CreateRequestParams, ResponseHandler } from './types';
import { isCodeInRange } from '../utils';
import { ApiException } from '../exception';

export class Context {
  fetcher: HttpLibrary = new IsomorphicFetchHttpLibrary();

  serializerOptions: SerializerOptions = {};

  constructor() {}

  /**
   * Creates a request context ready to be sent.
   */
  async createRequest(options: CreateRequestParams): Promise<RequestContext> {
    return new RequestContext(
      // TODO Setup server url
      options.path,
      options.method,
      this.serializerOptions,
    );
  }
  /**
   * Sends a request.
   */
  sendRequest(request: RequestContext): Promise<ResponseContext> {
    return this.fetcher.send(request);
  }
  /**
   *
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
  }
}
