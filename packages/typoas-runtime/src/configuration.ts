import { applyTemplating } from './utils';

export interface BaseServerConfiguration {
  getURL(endpoint: string): string;
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
  public constructor(
    private url: string,
    private variableConfiguration: T,
  ) {}

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

  getURL(endpoint: string): string {
    return applyTemplating(this.url, this.variableConfiguration) + endpoint;
  }
}
