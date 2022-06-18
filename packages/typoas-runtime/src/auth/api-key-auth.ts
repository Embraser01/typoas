import type { AuthProvider, SecurityAuthentication } from './base';
import type { RequestContext } from '../fetcher';

export type ApiKeyLocation = 'query' | 'header' | 'cookie';

type ApiKeyConfiguration = {
  name: string;
  in: ApiKeyLocation;
};

export class ApiKeySecurityAuthentication implements SecurityAuthentication {
  name: string;
  in: ApiKeyLocation;

  constructor(
    config: ApiKeyConfiguration,
    private provider?: AuthProvider<string>,
  ) {
    this.name = config.name;
    this.in = config.in;
  }

  async applySecurityAuthentication(context: RequestContext): Promise<void> {
    if (!this.provider) return;
    const apiToken = await this.provider.getConfig();
    switch (this.in) {
      case 'query':
        return context.setQueryParam(this.name, apiToken);
      case 'header':
        return context.setHeaderParam(this.name, apiToken);
      case 'cookie':
        return context.addCookie(this.name, apiToken);
    }
  }
}
