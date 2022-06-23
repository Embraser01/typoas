import { RequestContext } from './request-context';
import { ResponseContext } from './response-context';

export * from './types';

export { RequestContext, ResponseContext };

export interface Fetcher {
  send(request: RequestContext): Promise<ResponseContext>;
}

export class IsomorphicFetchHttpLibrary implements Fetcher {
  public async send(request: RequestContext): Promise<ResponseContext> {
    const method = request.getHttpMethod().toString();
    const body = request.getBody();

    const resp = await fetch(request.getUrl(), {
      method: method,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: body as any,
      headers: request.getHeaders(),
      credentials: 'same-origin',
    });
    const headers: { [name: string]: string } = {};
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
