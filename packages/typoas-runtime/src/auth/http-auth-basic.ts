import type { AuthProvider, SecurityAuthentication } from './base.js';
import type { RequestContext } from '../fetcher/index.js';

export type BasicAuthConfig = { username: string; password: string };

export class HttpBasicSecurityAuthentication implements SecurityAuthentication {
  constructor(private provider?: AuthProvider<BasicAuthConfig>) {}

  async applySecurityAuthentication(context: RequestContext): Promise<void> {
    if (!this.provider) return;

    const res = await this.provider.getConfig();
    if (res === null) {
      return;
    }

    const { username, password } = res;
    const base64 = btoa(`${username}:${password}`);
    return context.setHeaderParam('Authorization', `Basic ${base64}`);
  }
}
