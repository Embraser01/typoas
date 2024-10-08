import type { RequestContext } from '../fetcher';

/**
 * Base class authentication schemes.
 */
export interface SecurityAuthentication {
  /**
   * Applies the authentication scheme to the request context
   *
   * @params context the request context which should use this authentication scheme
   */
  applySecurityAuthentication(context: RequestContext): void | Promise<void>;
}

export interface AuthProvider<T> {
  getConfig(): Promise<T | null> | T | null;
}

/**
 * Configuration for the OAuth2 and OIDC authentication scheme.
 */
export type BaseFlowConfig = {
  accessToken: string;
  // Allow overriding the token type (default: Bearer)
  tokenType?: string;
};
