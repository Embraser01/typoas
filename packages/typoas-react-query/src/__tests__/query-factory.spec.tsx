import { describe, expect, it } from '@jest/globals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { createQueryHook } from '../query-factory';
import { createContext, findPetsByStatus, Pet } from './sample-client';
import { ApiContextProvider } from '../api-context';
import { MockFetcher } from './mock-fetcher';

describe('createQueryHook', () => {
  const queryClient = new QueryClient();
  const fetcher = new MockFetcher();
  const ctx = createContext({ fetcher });

  const wrapper = ({ children }: PropsWithChildren) => (
    <ApiContextProvider context={ctx}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ApiContextProvider>
  );

  it('should work for simple cases', async () => {
    const useFindPetsByStatus = createQueryHook(findPetsByStatus, {
      successStatus: 200,
    });
    fetcher.mockResponse<Pet[]>([
      { id: 1, name: 'Rufus', status: 'available', photoUrls: [] },
      { id: 2, name: 'Rocky', status: 'available', photoUrls: [] },
    ]);

    const { result } = renderHook(
      () => useFindPetsByStatus({ queryKey: [{ status: 'available' }] }),
      { wrapper },
    );

    await waitFor(() =>
      expect(result.current.data?.map((d) => d.id)).toEqual([1, 2]),
    );
  });
});
