import { Context } from './context';
import { SecurityAuthentication } from './auth';
import { BaseFetcherData } from './fetcher';

type ApiFunction<
  AuthModes extends Record<string, SecurityAuthentication>,
  FetcherData extends BaseFetcherData,
> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | ((ctx: Context<AuthModes, FetcherData>, params: any) => Promise<unknown>)
  | ((
      ctx: Context<AuthModes, FetcherData>,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      params: any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: any,
    ) => Promise<unknown>);

type WithoutContext<T> = T extends (
  ctx: Context<never>,
  params: infer P,
) => Promise<infer R>
  ? (params: P) => Promise<R>
  : T extends (
        ctx: Context<never>,
        params: infer P,
        body: infer B,
      ) => Promise<infer R>
    ? (params: P, body: B) => Promise<R>
    : never;

type WrapApiEndpoints<
  AuthModes extends Record<string, SecurityAuthentication>,
  FetcherData extends BaseFetcherData,
> = Record<string, ApiFunction<AuthModes, FetcherData>>;

type WithoutContextObject<
  T extends WrapApiEndpoints<AuthModes, FetcherData>,
  AuthModes extends Record<string, SecurityAuthentication>,
  FetcherData extends BaseFetcherData,
> = {
  [key in keyof T]: WithoutContext<T[key]>;
};

export function wrapApi<
  T extends WrapApiEndpoints<AuthModes, FetcherData>,
  AuthModes extends Record<string, SecurityAuthentication>,
  FetcherData extends BaseFetcherData = BaseFetcherData,
>(
  context: Context<AuthModes>,
  endpoints: T,
): WithoutContextObject<T, AuthModes, FetcherData> {
  const res = {};
  for (const endpoint of Object.keys(endpoints)) {
    // @ts-expect-error TS is not smart enough to infer the type of the function
    res[endpoint] = (params: unknown, body: unknown): Promise<unknown> => {
      return endpoints[endpoint](context, params, body);
    };
  }
  return res as WithoutContextObject<T, AuthModes, FetcherData>;
}
