import type {
  AuthProvider,
  BaseFlowConfig,
  SecurityAuthentication,
} from './base';
import type { RequestContext } from '../fetcher';

// We don't actually need to have any configuration for OpenIdConnect
// because we only use the already generated accessToken.
export type OpenIdConnectConfiguration = Record<string, never>;

export class OpenIdConnectSecurityAuthentication
  implements SecurityAuthentication
{
  constructor(
    private config: OpenIdConnectConfiguration,
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
