import {
  SuccessfulStatus,
  StatusResponse,
  EnhancedHTTPStatus,
} from './fetcher';

/**
 * Represents an error caused by an api call i.e. it has attributes for a HTTP status code
 * and the returned body object.
 *
 * Example
 * API returns a ErrorMessageObject whenever HTTP status code is not in [200, 299]
 * => ApiException(404, someErrorMessageObject)
 *
 */
export class ApiException<T = unknown> extends Error {
  public constructor(
    public code: number,
    public body: T,
  ) {
    super('HTTP-Code: ' + code + '\nMessage: ' + JSON.stringify(body));
    this.name = 'ApiException';
  }
}

/**
 * Helper function that is available to the user to automatically throw
 * on non-2xx/non-3XX status codes.
 *
 * @param res - The promise of the API function call
 * @param successStatus - Optional parameter to specify the expected status code.
 *                  This is useful if the API has multiple success status codes.
 */
export async function ok<
  R extends StatusResponse<EnhancedHTTPStatus>,
  S extends Extract<EnhancedHTTPStatus, number> = Extract<
    SuccessfulStatus,
    number
  >,
>(
  res: Promise<R>,
  successStatus?: S,
): Promise<R extends StatusResponse<S, infer D> ? D : never> {
  const r = await res;

  const valid = successStatus === undefined ? r.ok : r.status === successStatus;

  if (valid) {
    // @ts-expect-error Data will be inferred by TS
    return r.data;
  }
  throw new ApiException(r.status, r.data);
}
