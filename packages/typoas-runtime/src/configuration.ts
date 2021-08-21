import { RequestContext, HttpMethod } from './http/http';
import { applyTemplating } from './utils';

export interface BaseServerConfiguration {
  makeRequestContext(endpoint: string, httpMethod: HttpMethod): RequestContext;
}

/**
 *
 * Represents the configuration of a server including its
 * url template and variable configuration based on the url.
 *
 */
export class ServerConfiguration<T extends Record<string, string>>
  implements BaseServerConfiguration
{
  public constructor(private url: string, private variableConfiguration: T) {}

  /**
   * Sets the value of the variables of this server.
   *
   * @param variableConfiguration a partial variable configuration for the variables contained in the url
   */
  public setVariables(variableConfiguration: Partial<T>): void {
    Object.assign(this.variableConfiguration, variableConfiguration);
  }

  public getConfiguration(): T {
    return this.variableConfiguration;
  }

  /**
   * Creates a new request context for this server using the url with variables
   * replaced with their respective values and the endpoint of the request appended.
   *
   * @param endpoint the endpoint to be queried on the server
   * @param httpMethod httpMethod to be used
   *
   */
  public makeRequestContext(
    endpoint: string,
    httpMethod: HttpMethod,
  ): RequestContext {
    return new RequestContext(
      applyTemplating(this.url, this.variableConfiguration) + endpoint,
      httpMethod,
    );
  }
}
