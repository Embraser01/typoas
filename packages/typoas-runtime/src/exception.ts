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
  S extends EnhancedHTTPStatus = SuccessfulStatus,
>(res: Promise<R>, successStatus?: S): Promise<SpecificStatusResponse<R, S>> {
  const r = await res;

  let valid: boolean;
  if (successStatus === undefined || successStatus === 'default') {
    valid = r.ok;
  } else if (successStatus === '2XX') {
    valid = r.status >= 200 && r.status < 300;
  } else if (successStatus === '3XX') {
    valid = r.status >= 300 && r.status < 400;
  } else {
    valid = r.status === successStatus;
  }

  if (valid) {
    // @ts-expect-error Data will be inferred by TS
    return r.data;
  }
  throw new ApiException(r.status, r.data);
}

/**
 * Extracts the data type depending on a specific status code.
 */
export type SpecificStatusResponse<R, S extends EnhancedHTTPStatus> =
  R extends StatusResponse<infer AvailableStatus, infer D>
    ? S extends AvailableStatus
      ? Extract<R, StatusResponse<S, D>>['data']
      : never
    : never;
