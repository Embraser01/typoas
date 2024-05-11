import { RequestContext } from './request-context';
import { ResponseContext } from './response-context';

export * from './types';

export { RequestContext, ResponseContext };

export interface Fetcher<T = unknown> {
  send(request: RequestContext, options?: T): Promise<ResponseContext>;
}

export class IsomorphicFetchHttpLibrary<T = unknown> implements Fetcher<T> {
  public async send(
    request: RequestContext,
    options: T,
  ): Promise<ResponseContext> {
    const method = request.getHttpMethod().toString();
    const body = request.getBody();

    const resp = await fetch(request.getUrl(), {
      credentials: 'same-origin',
      headers: request.getHeaders(),
      ...options,
      // Method, URL and Body can't be overridden in this fetcher implementation
      method,
      body,
    });
    const headers: Record<string, string> = {};
    resp.headers.forEach((value: string, name: string) => {
      headers[name] = value;
    });

    return new ResponseContext(resp.status, headers, {
      text: () => resp.text(),
      binary: () => resp.blob(),
      json: () => resp.json(),
    });
  }
}
