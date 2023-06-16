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
  getConfig(): Promise<T> | T;
}
