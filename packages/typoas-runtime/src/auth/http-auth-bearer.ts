import type { AuthProvider, SecurityAuthentication } from './base';
import type { RequestContext } from '../fetcher';

export type BearerAuthConfig = string | { token: string; prefixName?: string };

export class HttpBearerSecurityAuthentication
  implements SecurityAuthentication
{
  constructor(private provider?: AuthProvider<BearerAuthConfig>) {}

  async applySecurityAuthentication(context: RequestContext): Promise<void> {
    if (!this.provider) return;

    const res = await this.provider.getConfig();
    if (res === null) {
      return;
    }

    const token = typeof res === 'string' ? res : res.token;
    const prefix =
      typeof res === 'string' ? 'Bearer' : res.prefixName || 'Bearer';

    return context.setHeaderParam('Authorization', `${prefix} ${token}`);
  }
}
