import type { AuthProvider, SecurityAuthentication } from './base';
import type { RequestContext } from '../fetcher';

// We don't actually need to have any configuration for OAuth2
// because we only use the already generated accessToken.
export type OAuth2Configuration = Record<string, never>;

export type BaseFlowConfig = {
  accessToken: string;
  // Allow overriding the token type (default: Bearer)
  tokenType?: string;
};

export class OAuth2SecurityAuthentication implements SecurityAuthentication {
  constructor(
    private config: OAuth2Configuration,
    private provider?: AuthProvider<BaseFlowConfig>,
  ) {}

  async applySecurityAuthentication(context: RequestContext): Promise<void> {
    if (!this.provider) return;

    const res = await this.provider.getConfig();
    if (res === null) {
      return;
    }

    const { accessToken, tokenType } = res;
    return context.setHeaderParam(
      'Authorization',
      `${tokenType || 'Bearer'} ${accessToken}`,
    );
  }
}
