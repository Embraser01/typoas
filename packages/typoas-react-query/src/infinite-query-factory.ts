import {
  DefaultError,
  QueryClient,
  hashKey,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  UndefinedInitialDataInfiniteOptions,
  DefinedInitialDataInfiniteOptions,
  UseInfiniteQueryResult,
  Optional,
  InfiniteData,
} from '@tanstack/react-query';
import { Context, ok, SuccessfulStatus } from '@typoas/runtime';
import { useApiContext } from './api-context';
import { getUniqueFunctionName } from './func-names';
import { TypoasFuncStatusType, TypoasReturnType } from './types';

/**
 * Combined options usable in useInfiniteQuery hook.
 */
export type TypoasInfiniteQueryOptions<
  Func extends TypoasInfiniteQueryFunction<FetcherData>,
  S extends TypoasFuncStatusType<Func>,
  TError = DefaultError,
  TPageParam = unknown,
  FetcherData = unknown,
> = (
  | UseInfiniteQueryOptions<
      TypoasReturnType<Func, S>,
      TError,
      InfiniteData<TypoasReturnType<Func, S>, TPageParam>,
      TypoasReturnType<Func, S>,
      [Parameters<Func>[1], ...unknown[]],
      TPageParam
    >
  | UndefinedInitialDataInfiniteOptions<
      TypoasReturnType<Func, S>,
      TError,
      InfiniteData<TypoasReturnType<Func, S>, TPageParam>,
      [Parameters<Func>[1], ...unknown[]],
      TPageParam
    >
  | DefinedInitialDataInfiniteOptions<
      TypoasReturnType<Func, S>,
      TError,
      InfiniteData<TypoasReturnType<Func, S>, TPageParam>,
      [Parameters<Func>[1], ...unknown[]],
      TPageParam
    >
) & {
  fetcherData?: FetcherData;
  successStatus?: S;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export type TypoasInfiniteQueryFunction<FetcherData = unknown> = (
  ctx: Context<never, FetcherData>,
  params: any,
  opts?: FetcherData,
) => Promise<any>;
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Create a React hook for a specific infinite query.
 *
 * A `getNextPageParam` function should be provided either in the options or in the base options.
 * This function should return an object with the pagination parameters to set in the query.
 *
 * Note that TS wise, if there is required pagination params, you will have to provide them in the query key.
 * This will be overridden by the pageParam object returned by the getNextPageParam function.
 *
 * @param func Typoas generated function
 * @param baseOptions Options applied to every usage of this hook. May be overridden by options passed to the hook.
 * @param context Optional default context to use for the query. If not provided, you MUST use the ApiContextProvider.
 */
export function createInfiniteQueryHook<
  Func extends TypoasInfiniteQueryFunction<FetcherData>,
  S extends TypoasFuncStatusType<Func> = TypoasFuncStatusType<Func> &
    SuccessfulStatus,
  TError = unknown,
  TPageParam extends Record<string, unknown> = NonNullable<unknown>,
  FetcherData = unknown,
>(
  func: Func,
  baseOptions: Optional<
    Omit<
      TypoasInfiniteQueryOptions<Func, S, TError, TPageParam, FetcherData>,
      'queryKey' | 'queryFn'
    >,
    'getNextPageParam' | 'initialPageParam'
  >,
  context?: Context<never, FetcherData>,
): (
  options: Optional<
    Omit<
      TypoasInfiniteQueryOptions<Func, S, TError, TPageParam, FetcherData>,
      'queryFn' | 'successStatus'
    >,
    'getNextPageParam' | 'initialPageParam'
  >,
  queryClient?: QueryClient,
) => UseInfiniteQueryResult<
  InfiniteData<TypoasReturnType<Func, S>, TPageParam>,
  TError
> {
  const name = getUniqueFunctionName(func);

  return (options, queryClient) => {
    const { context: localContext } = useApiContext();

    const getNextPageParam =
      options.getNextPageParam || baseOptions.getNextPageParam;
    const initialPageParam =
      options.initialPageParam || baseOptions.initialPageParam;

    if (!getNextPageParam || !initialPageParam) {
      throw new Error('getNextPageParam and initialPageParam must be provided');
    }
    return useInfiniteQuery(
      {
        ...baseOptions,
        ...options,
        getNextPageParam,
        initialPageParam,
        // Override the query key hash function to include the name of the query
        // This is the main way to ensure that the query key is unique
        // Note that if a user provides a custom queryKeyHashFn,
        // they will receive the name as the first argument.
        queryKeyHashFn: (queryKey) => {
          const hashFn =
            options.queryKeyHashFn || baseOptions.queryKeyHashFn || hashKey;
          return hashFn([name, ...queryKey]);
        },
        queryFn: ({ pageParam }) => {
          const ctx = localContext || context;
          if (!ctx) {
            throw new Error(
              'No context provided for query, use ApiContextProvider or provide a context in createQueryHook',
            );
          }
          return ok(
            func(
              ctx,
              // Use Object.assign as pageParam is badly typed by TS. TS forces it to be a record
              Object.assign({}, options.queryKey[0], pageParam),
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
