import { AuthProvider, SecurityAuthentication } from './base';
import { RequestContext } from '../http/http';
export declare type SupportedScheme = 'basic' | 'bearer';
export declare type HttpConfiguration = {
    scheme: SupportedScheme;
    bearerFormat: string;
};
export declare type BasicAuthConfig = {
    username: string;
    password: string;
};
export declare type BearerAuthConfig = string;
export declare class HttpSecurityAuthentication implements SecurityAuthentication {
    private provider?;
    scheme: SupportedScheme;
    bearerFormat: string;
    constructor(config: HttpConfiguration, provider?: AuthProvider<string | BasicAuthConfig> | undefined);
    applySecurityAuthentication(context: RequestContext): Promise<void>;
}
