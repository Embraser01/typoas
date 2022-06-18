import { Context } from './context';

type ApiFunction =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | ((ctx: Context, params: any) => Promise<unknown>)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | ((ctx: Context, params: any, body: any) => Promise<unknown>);

type WithoutContext<T> = T extends (
  ctx: Context,
  params: infer P,
) => Promise<infer R>
  ? (params: P) => Promise<R>
  : T extends (ctx: Context, params: infer P, body: infer B) => Promise<infer R>
  ? (params: P, body: B) => Promise<R>
  : never;

type WrapApiEndpoints = Record<string, ApiFunction>;

type WithoutContextObject<T extends WrapApiEndpoints> = {
  [key in keyof T]: WithoutContext<T[key]>;
};

export function wrapApi<T extends WrapApiEndpoints>(
  context: Context,
  endpoints: T,
): WithoutContextObject<T> {
  const res = {};
  for (const endpoint of Object.keys(endpoints)) {
    // @ts-expect-error TS is not smart enough to infer the type of the function
    res[endpoint] = (params: unknown, body: unknown): Promise<unknown> => {
      return endpoints[endpoint](context, params, body);
    };
  }
  return res as WithoutContextObject<T>;
}
