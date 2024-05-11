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

/**
 * Represents an HTTP status code including the default
 * status codes and the 1XX, 4XX, 5XX ranges.
 */
export type EnhancedHTTPStatus =
  | 'default'
  | '1XX'
  | '2XX'
  | '3XX'
  | '4XX'
  | '5XX'
  | 100
  | 101
  | 102
  | 103
  | 200
  | 201
  | 202
  | 203
  | 204
  | 205
  | 206
  | 207
  | 208
  | 226
  | 300
  | 301
  | 302
  | 303
  | 304
  | 305
  | 306
  | 307
  | 308
  | 400
  | 401
  | 402
  | 403
  | 404
  | 405
  | 406
  | 407
  | 408
  | 409
  | 410
  | 411
  | 412
  | 413
  | 414
  | 415
  | 416
  | 417
  | 418
  | 421
  | 422
  | 423
  | 424
  | 425
  | 426
  | 427
  | 428
  | 429
  | 430
  | 431
  | 451
  | 500
  | 501
  | 502
  | 503
  | 504
  | 505
  | 506
  | 507
  | 508
  | 509
  | 510
  | 511;

/**
 * Extracts only the successful status codes of EnhancedHTTPStatus.
 */
export type SuccessfulStatus = Extract<
  EnhancedHTTPStatus,
  | 'default'
  | '2XX'
  | 200
  | 201
  | 202
  | 203
  | 204
  | 205
  | 206
  | 207
  | 208
  | 226
  | '3XX'
  | 300
  | 301
  | 302
  | 303
  | 304
  | 305
  | 306
  | 307
  | 308
>;

/**
 * Represents a response from an api call.
 */
export type StatusResponse<
  S extends EnhancedHTTPStatus = 'default',
  R = unknown,
> = {
  data: R;
  // Here we don't use the Header type as not all fetchers will have the same headers type.
  headers: Record<string, string>;
  ok: S extends SuccessfulStatus ? true : S extends 'default' ? boolean : false;
  // When using ranges or default, we can't now the specific status code.
  status: S extends string ? number : S;
};
