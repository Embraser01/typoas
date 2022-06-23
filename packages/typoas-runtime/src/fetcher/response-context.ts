import type { HttpFile, ResponseBody } from './types';

export class ResponseContext {
  public constructor(
    public httpStatusCode: number,
    public headers: { [key: string]: string },
    public body: ResponseBody,
  ) {}

  /**
   * Parse header value in the form `value; param1="value1"`
   *
   * E.g. for Content-Type or Content-Disposition
   * Parameter names are converted to lower case
   * The first parameter is returned with the key `""`
   */
  public getParsedHeader(headerName: string): { [parameter: string]: string } {
    const result: { [parameter: string]: string } = {};
    if (!this.headers[headerName]) {
      return result;
    }

    const parameters = this.headers[headerName].split(';');
    for (const parameter of parameters) {
      let [key, value] = parameter.split('=', 2);
      key = key.toLowerCase().trim();
      if (value === undefined) {
        result[''] = key;
      } else {
        value = value.trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        result[key] = value;
      }
    }
    return result;
  }

  public async getBodyAsFile(): Promise<HttpFile> {
    const data = await this.body.binary();
    const fileName =
      this.getParsedHeader('content-disposition')['filename'] || '';
    const contentType = this.headers['content-type'] || '';
    try {
      return new File([data], fileName, { type: contentType });
    } catch (error) {
      /** Fallback for when the File constructor is not available */
      return Object.assign(data, {
        name: fileName,
        type: contentType,
      });
    }
  }
}
