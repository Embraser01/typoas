import { AuthProvider, SecurityAuthentication } from './base';
import { RequestContext } from '../http/http';

export type OAuth2Configuration = {
  // We don't actually need to have any configuration for OAuth2
  // because we only use the already generated accessToken.
  //
  // flows: {
  //   authorizationCode?: {
  //     refreshUrl?: string;
  //     scopes: Record<string, string>;
  //     authorizationUrl: string;
  //     tokenUrl: string;
  //   };
  //   implicit?: {
  //     refreshUrl?: string;
  //     scopes: Record<string, string>;
  //     authorizationUrl: string;
  //   };
  //   password?: {
  //     refreshUrl?: string;
  //     scopes: Record<string, string>;
  //     tokenUrl: string;
  //   };
  //   clientCredentials?: {
  //     refreshUrl?: string;
  //     scopes: Record<string, string>;
  //     tokenUrl: string;
  //   };
  // };
};

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
    const { accessToken, tokenType } = await this.provider.getConfig();
    return context.setHeaderParam(
      'Authorization',
      `${tokenType || 'Bearer'} ${accessToken}`,
    );
  }
}
