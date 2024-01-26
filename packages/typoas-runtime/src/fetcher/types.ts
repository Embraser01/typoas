/**
 * Represents an HTTP method.
 */
export enum HttpMethod {
  GET = 'GET',
  HEAD = 'HEAD',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  CONNECT = 'CONNECT',
  OPTIONS = 'OPTIONS',
  TRACE = 'TRACE',
  PATCH = 'PATCH',
}

/**
 * Represents an HTTP file which will be transferred from or to a server.
 */
export type HttpFile = Blob & { readonly name: string };

/**
 * Represents the body of an outgoing HTTP request.
 */
export type RequestBody =
  | undefined
  | string
  | FormData
  | Blob
  | URLSearchParams;

export type QueryStyles =
  | 'form'
  | 'spaceDelimited'
  | 'pipeDelimited'
  | 'deepObject';
/**
 * Options are following https://swagger.io/docs/specification/serialization/.
 */
export type SerializerOptions = {
  explode?: boolean;
  queryStyle?: QueryStyles;
};

export interface ResponseBody {
  text(): Promise<string>;
  binary(): Promise<Blob>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  json(): Promise<any>;
}
