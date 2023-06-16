import type { AuthProvider, SecurityAuthentication } from './base';
import type { RequestContext } from '../fetcher';

export type BearerAuthConfig = string;

export class HttpBearerSecurityAuthentication
  implements SecurityAuthentication
{
  constructor(private provider?: AuthProvider<BearerAuthConfig>) {}

  async applySecurityAuthentication(context: RequestContext): Promise<void> {
    if (!this.provider) return;

    const token = await this.provider.getConfig();
    return context.setHeaderParam('Authorization', `Bearer ${token}`);
  }
}
