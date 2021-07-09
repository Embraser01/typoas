import { HttpLibrary, RequestContext, ResponseContext } from './http';
export declare class IsomorphicFetchHttpLibrary implements HttpLibrary {
    send(request: RequestContext): Promise<ResponseContext>;
}
