import * as queryString from 'query-string';
import type { ParsedQuery, ParsedUrl, StringifyOptions } from 'query-string';
import type { HttpMethod, RequestBody, SerializerOptions } from './types';

/**
 * Represents an HTTP request context
 */
export class RequestContext {
  private headers: { [key: string]: string } = {};
  private body: RequestBody = undefined;
  private url: ParsedUrl;

  /**
   * Creates the request context using a http method and request resource url
   */
  public constructor(
    url: string,
    private httpMethod: HttpMethod,
    private opts: SerializerOptions = {},
  ) {
    this.url = queryString.parseUrl(url);
  }

  /**
   * Returns the url set in the constructor including the query string
   */
  public getUrl(): string {
    let arrayFormat: StringifyOptions['arrayFormat'] = 'none';
    let arrayFormatSeparator: StringifyOptions['arrayFormatSeparator'] = ',';

    if (this.opts.explode === false) {
      arrayFormat = 'separator';
      switch (this.opts.queryStyle) {
        case 'spaceDelimited':
          arrayFormatSeparator = ' ';
          break;
        case 'pipeDelimited':
          arrayFormatSeparator = '|';
          break;
        case 'form':
        default:
          arrayFormatSeparator = ',';
          break;
      }
    }
    return queryString.stringifyUrl(this.url, {
      arrayFormat,
      arrayFormatSeparator,
    });
  }

  /**
   * Return the url parsed object.
   */
  public getRawUrl(): ParsedUrl {
    return this.url;
  }

  /**
   * Replaces the url set in the constructor with this url.
   *
   */
  public setUrl(url: string): void {
    this.url = queryString.parseUrl(url);
  }

  /**
   * Sets the body of the http request either as a string or FormData
   *
   * Note that setting a body on a HTTP GET, HEAD, DELETE, CONNECT or TRACE
   * request is discouraged.
   * https://httpwg.org/http-core/draft-ietf-httpbis-semantics-latest.html#rfc.section.7.3.1
   *
   * @param body the body of the request
   */
  public setBody(body: RequestBody): void {
    this.body = body;
  }

  public getHttpMethod(): HttpMethod {
    return this.httpMethod;
  }

  public getHeaders(): { [key: string]: string } {
    return this.headers;
  }

  public getBody(): RequestBody {
    return this.body;
  }

  public setQueryParam(name: string, value: string | string[]): void {
    const queryObj = this.url.query as ParsedQuery<unknown>;
    const currentVal = queryObj[name];
    if (currentVal === undefined) {
      queryObj[name] = value;
      return;
    }
    if (Array.isArray(value)) {
      if (Array.isArray(currentVal)) {
        currentVal.push(...value);
      } else {
        queryObj[name] = [currentVal, ...value];
      }
    } else {
      if (Array.isArray(currentVal)) {
        currentVal.push(value);
      } else {
        queryObj[name] = [currentVal, value];
      }
    }
  }

  /**
   *  Sets a cookie with the name and value. NO check  for duplicate cookies is performed
   *
   */
  public addCookie(name: string, value: string): void {
    if (!this.headers['Cookie']) {
      this.headers['Cookie'] = '';
    }
    this.headers['Cookie'] += name + '=' + value + '; ';
  }

  public setHeaderParam(key: string, value: string): void {
    this.headers[key] = value;
  }
}
