import type { AuthProvider, SecurityAuthentication } from './base';
import type { RequestContext } from '../fetcher';

export type SupportedScheme = 'basic' | 'bearer';
export type HttpConfiguration = {
  scheme: SupportedScheme;
  bearerFormat: string;
};

export type BasicAuthConfig = { username: string; password: string };
export type BearerAuthConfig = string;

export class HttpSecurityAuthentication implements SecurityAuthentication {
  scheme: SupportedScheme;
  bearerFormat: string;

  constructor(
    config: HttpConfiguration,
    private provider?: AuthProvider<BasicAuthConfig | BearerAuthConfig>,
  ) {
    this.scheme = config.scheme;
    this.bearerFormat = config.bearerFormat;
  }

  async applySecurityAuthentication(context: RequestContext): Promise<void> {
    if (!this.provider) return;

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
