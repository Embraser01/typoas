import { describe, expect, it } from '@jest/globals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren, useEffect } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { createContext, addPet, Pet } from './sample-client';
import { ApiContextProvider } from '../api-context';
import { MockFetcher } from './mock-fetcher';
import { createMutationHook } from '../mutation-factory';

describe('createMutationHook', () => {
  const queryClient = new QueryClient();
  const fetcher = new MockFetcher();
  const ctx = createContext({ fetcher });

  const wrapper = ({ children }: PropsWithChildren) => (
    <ApiContextProvider context={ctx}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ApiContextProvider>
  );

  it('should work for simple cases', async () => {
    const useAddPetMutation = createMutationHook(addPet, {});
    fetcher.mockResponse<Pet>({
      id: 1,
      name: 'Rufus',
      status: 'available',
      photoUrls: [],
    });

    const { result } = renderHook(
      () => {
        const mutation = useAddPetMutation({});

        useEffect(() => {
          mutation.mutate([
            {},
            { id: 1, name: 'Rufus', status: 'available', photoUrls: [] },
          ]);
        }, [mutation.mutate]);

        return mutation.data;
      },
      { wrapper },
    );

    await waitFor(() =>
      expect(result.current).toEqual({
        id: 1,
        name: 'Rufus',
        status: 'available',
        photoUrls: [],
      }),
    );
  });
});
