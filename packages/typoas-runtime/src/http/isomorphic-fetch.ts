import { HttpLibrary, RequestContext, ResponseContext } from './http';

export class IsomorphicFetchHttpLibrary implements HttpLibrary {
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
