import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import { Context } from '@typoas/runtime';

const ApiContext = createContext({});

export type ApiContextValue = { context?: Context<never> };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApiContextProviderProps = { context: Context<any> };

export function ApiContextProvider({
  children,
  context,
}: PropsWithChildren<ApiContextProviderProps>) {
  const value = useMemo<ApiContextProviderProps>(
    () => ({ context }),
    [context],
  );

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

export function useApiContext(): ApiContextValue {
  return useContext(ApiContext);
}
