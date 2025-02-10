import {
  DefinedInitialDataOptions,
  QueryClient,
  UndefinedInitialDataOptions,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
  hashKey,
  DefaultError,
} from '@tanstack/react-query';
import {
  BaseFetcherData,
  Context,
  ok,
  SuccessfulStatus,
} from '@typoas/runtime';
import { useApiContext } from './api-context';
import { getQueryFunctionKey } from './func-names';
import { TypoasFuncStatusType, TypoasReturnType } from './types';

/**
 * Combined options usable in useQuery hook.
 */
export type TypoasQueryOptions<
  Func extends TypoasQueryFunction<FetcherData>,
  S extends TypoasFuncStatusType<Func>,
  TError,
  FetcherData extends BaseFetcherData = BaseFetcherData,
> = Omit<
  | UseQueryOptions<
      TypoasReturnType<Func, S>,
      TError,
      TypoasReturnType<Func, S>,
      [Parameters<Func>[1], ...unknown[]]
    >
  | UndefinedInitialDataOptions<
      TypoasReturnType<Func, S>,
      TError,
      TypoasReturnType<Func, S>,
      [Parameters<Func>[1], ...unknown[]]
    >
  | DefinedInitialDataOptions<
      TypoasReturnType<Func, S>,
      TError,
      TypoasReturnType<Func, S>,
      [Parameters<Func>[1], ...unknown[]]
    >,
  'queryFn'
> & {
  fetcherData?: FetcherData;
  successStatus?: S;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export type TypoasQueryFunction<FetcherData extends BaseFetcherData> = (
  ctx: Context<never, FetcherData>,
  params: any,
  opts?: FetcherData,
) => Promise<any>;
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Create a React hook for a specific query.
 *
 * @param func Typoas generated function
 * @param baseOptions Options applied to every usage of this hook. May be overridden by options passed to the hook.
 * @param context Optional default context to use for the query. If not provided, you MUST use the ApiContextProvider.
 */
export function createQueryHook<
  Func extends TypoasQueryFunction<FetcherData>,
  S extends TypoasFuncStatusType<Func> = TypoasFuncStatusType<Func> &
    SuccessfulStatus,
  TError = DefaultError,
  FetcherData extends BaseFetcherData = BaseFetcherData,
>(
  func: Func,
  baseOptions: Omit<
    TypoasQueryOptions<Func, S, TError, FetcherData>,
    'queryKey'
  > = {},
  context?: Context<never, FetcherData>,
): (
  options: Omit<
    TypoasQueryOptions<Func, S, TError, FetcherData>,
    'queryFn' | 'successStatus'
  >,
  queryClient?: QueryClient,
) => UseQueryResult<TypoasReturnType<Func, S>, TError> {
  const name = getQueryFunctionKey(func);

  return (options, queryClient) => {
    const { context: localContext } = useApiContext();
    return useQuery(
      {
        ...baseOptions,
        ...options,
        // Override the query key hash function to include the name of the query
        // This is the main way to ensure that the query key is unique
        // Note that if a user provides a custom queryKeyHashFn,
        // they will receive the name as the first argument.
        queryKeyHashFn: (queryKey) => {
          const hashFn =
            options.queryKeyHashFn || baseOptions.queryKeyHashFn || hashKey;
          return hashFn([name, ...queryKey]);
        },
        queryFn: () => {
          const ctx = localContext || context;
          if (!ctx) {
            throw new Error(
              'No context provided for query, use ApiContextProvider or provide a context in createQueryHook',
            );
          }
          return ok(
            func(
              ctx,
              options.queryKey[0],
              options.fetcherData ?? baseOptions.fetcherData,
            ),
            baseOptions.successStatus,
          );
        },
      },
      queryClient,
    );
  };
}
