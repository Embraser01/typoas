import {
  EnhancedHTTPStatus,
  SpecificStatusResponse,
  StatusResponse,
} from '@typoas/runtime';

export type TypoasReturnType<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Func extends (...args: any[]) => Promise<any>,
  S extends EnhancedHTTPStatus,
> = SpecificStatusResponse<Awaited<ReturnType<Func>>, S>;

export type TypoasFuncStatusType<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Func extends (...args: any[]) => Promise<any>,
> = Awaited<ReturnType<Func>> extends StatusResponse<infer S> ? S : never;
