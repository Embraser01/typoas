import { HttpLibrary, RequestContext, ResponseContext } from './http';
import 'whatwg-fetch';

export class IsomorphicFetchHttpLibrary implements HttpLibrary {
  public async send(request: RequestContext): Promise<ResponseContext> {
    let method = request.getHttpMethod().toString();
    let body = request.getBody();

    const resp = await fetch(request.getUrl(), {
      method: method,
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
    });
  }
}
