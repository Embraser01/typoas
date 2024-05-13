import { describe, expect, it } from '@jest/globals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { createContext, findPetsByStatus, Pet } from './sample-client';
import { ApiContextProvider } from '../api-context';
import { MockFetcher } from './mock-fetcher';
import { createInfiniteQueryHook } from '../infinite-query-factory';

describe('createInfiniteQueryHook', () => {
  const queryClient = new QueryClient();
  const fetcher = new MockFetcher();
  const ctx = createContext({ fetcher });

  const wrapper = ({ children }: PropsWithChildren) => (
    <ApiContextProvider context={ctx}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ApiContextProvider>
  );

  it('should work for simple cases', async () => {
    const useFindPetsByStatus = createInfiniteQueryHook(findPetsByStatus, {
      initialPageParam: { page: 1 },
      getNextPageParam: (lastPage, allPages) => {
        if (allPages.length === 1) {
          return { page: 2 };
        }
        return undefined;
      },
    });
    fetcher
      .mockResponseOnce<Pet[]>([
        { id: 3, name: 'Rocky', status: 'available', photoUrls: [] },
        { id: 4, name: 'Beethoven', status: 'available', photoUrls: [] },
      ])
      .mockResponseOnce<Pet[]>([
        { id: 1, name: 'Bob', status: 'available', photoUrls: [] },
        { id: 2, name: 'Rufus', status: 'available', photoUrls: [] },
      ]);

    const { result } = renderHook(
      () => useFindPetsByStatus({ queryKey: [{ status: 'available' }] }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.data?.pages.length).toEqual(1);
      expect(result.current.data?.pages[0].map((d) => d.id)).toEqual([1, 2]);
    });

    result.current.fetchNextPage();

    await waitFor(() => {
      expect(result.current.data?.pages.length).toEqual(2);
      expect(result.current.data?.pages[1].map((d) => d.id)).toEqual([3, 4]);
    });
  });
});
