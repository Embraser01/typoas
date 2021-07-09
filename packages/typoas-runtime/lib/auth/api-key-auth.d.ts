import { AuthProvider, SecurityAuthentication } from './base';
import { RequestContext } from '../http/http';
export declare type ApiKeyLocation = 'query' | 'header' | 'cookie';
declare type ApiKeyConfiguration = {
    name: string;
    in: ApiKeyLocation;
};
export declare class ApiKeySecurityAuthentication implements SecurityAuthentication {
    private provider?;
    name: string;
    in: ApiKeyLocation;
    constructor(config: ApiKeyConfiguration, provider?: AuthProvider<string> | undefined);
    applySecurityAuthentication(context: RequestContext): Promise<void>;
}
export {};
