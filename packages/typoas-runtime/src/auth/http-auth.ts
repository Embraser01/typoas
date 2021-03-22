import { AuthProvider, SecurityAuthentication } from './base';
import { RequestContext } from '../http/http';

type SupportedScheme = 'basic' | 'bearer';
type HttpConfiguration = {
  description?: string;
  scheme: SupportedScheme;
  bearerFormat: string;
};

type BasicAuthConfig = { username: string; password: string };
type BearerAuthConfig = string;

export class HttpSecurityAuthentication implements SecurityAuthentication {
  description?: string;
  scheme: SupportedScheme;
  bearerFormat: string;

  constructor(
    config: HttpConfiguration,
    private provider: AuthProvider<BasicAuthConfig | BearerAuthConfig>,
  ) {
    this.description = config.description;
    this.scheme = config.scheme;
    this.bearerFormat = config.bearerFormat;
  }

  async applySecurityAuthentication(context: RequestContext) {
    const config = await this.provider.getConfig();
    if (this.scheme === 'basic') {
      const { username, password } = config as BasicAuthConfig;

      const base64 = window.btoa(`${username}:${password}`);
      return context.setHeaderParam('Authorization', `Basic ${base64}`);
    }
    if (this.scheme === 'bearer') {
      const token = config as BearerAuthConfig;
      return context.setHeaderParam('Authorization', `Bearer ${token}`);
    }
  }
}
