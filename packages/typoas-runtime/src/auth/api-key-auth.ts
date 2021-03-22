import { AuthProvider, SecurityAuthentication } from './base';
import { RequestContext } from '../http/http';

type ApiKeyLocation = 'query' | 'header' | 'cookie';
type ApiKeyConfiguration = {
  description?: string;
  name: string;
  in: ApiKeyLocation;
};

export class ApiKeySecurityAuthentication implements SecurityAuthentication {
  description?: string;
  name: string;
  in: ApiKeyLocation;

  constructor(
    config: ApiKeyConfiguration,
    private provider: AuthProvider<string>,
  ) {
    this.description = config.description;
    this.name = config.name;
    this.in = config.in;
  }

  async applySecurityAuthentication(context: RequestContext) {
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
