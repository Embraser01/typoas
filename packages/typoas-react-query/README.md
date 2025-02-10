# `@typoas/react-query`

> This package is related to the [_Typoas_](https://github.com/Embraser01/typoas) project.

This package provides a set of hook factories to interact with a generated _Typoas_ client in a React application with [`react-query`](https://tanstack.com/query/latest).

## Install

This dependency should be added into your dependencies.

```shell
# @typoas/react-query depends on @tanstack/react-query and @typoas/runtime (peer dependencies)
yarn add @typoas/react-query @tanstack/react-query @typoas/runtime
```

## Usage

### Configuration

First, you will need to add the `ApiContextProvider` to your react application:

```tsx
import { ApiContextProvider } from '@typoas/react-query';
import { createContext } from './generated/client';

const client = createContext();

export function App() {
  return (
    <ApiContextProvider client={client}>
      <MyComponent />
    </ApiContextProvider>
  );
}
```

Once the `ApiContextProvider` is added, you can use one of the hook factories to interact with your generated client:

- [`createQueryHook`](#createqueryhook)
- [`createInfiniteQueryHook`](#createinfinitequeryhook)
- [`createMutationHook`](#createmutationhook)

### `createQueryHook`

```tsx
import { createQueryHook } from '@typoas/react-query';
import { findPetsByStatus } from './generated/client';

const useFindPetsByStatus = createQueryHook(findPetsByStatus, {
  // Base options used for all queries created with this hook
});

export function MyComponent() {
  const { data, isLoading } = useFindPetsByStatus({
    // These options are typed based on the operation's parameters
    // All react-query options are supported except for 'queryFn'
    queryKey: [{ status: 'available' }],
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ul>
      {data.map((pet) => (
        <li key={pet.id}>{pet.name}</li>
      ))}
    </ul>
  );
}
```

### `createInfiniteQueryHook`

Similar as the `createQueryHook`, supporting infinite queries.

```tsx
import { createQueryHook } from '@typoas/react-query';
import { findPetsByStatus } from './generated/client';

const useFindPetsByStatus = createInfiniteQueryHook(findPetsByStatus, {
  initialPageParam: { page: 1 },
  getNextPageParam: (lastPage, allPages) => {
    if (allPages.length === 1) {
      return { page: 2 };
    }
    return undefined;
  },
});

export function MyComponent() {
  const { data, isLoading } = useFindPetsByStatus({
    // These options are typed based on the operation's parameters
    // All react-query options are supported except for 'queryFn'
    queryKey: [{ status: 'available' }],
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ul>
      {data.pages.map((page) =>
        page.map((pet) => <li key={pet.id}>{pet.name}</li>),
      )}
    </ul>
  );
}
```

### `createMutationHook`

Mutation are also supported:

```tsx
import { useCallback } from 'react';
import { createQueryHook } from '@typoas/react-query';
import { addPet } from './generated/client';

const useAddPetMutation = createMutationHook(addPet, {});

export function MyComponent() {
  const mutation = useAddPetMutation({});

  const onClick = useCallback(() => {
    mutation.mutate([
      {}, // Path params
      { id: 1, name: 'Rufus', status: 'available', photoUrls: [] }, // Body
    ]);
  }, [mutation.mutate]);

  return <button onClick={onClick}></button>;
}
```

### `getQueryFunctionKey`

Sometimes you may need to use `queryClient.setQueryData` or `queryClient.invalidateQueries` with a query hook.
In this case, you can use the `getQueryFunctionKey` function to get the queryKey matching the query:

```tsx
import {
  getQueryFunctionKey,
  createMutationHook,
  createQueryHook,
} from '@typoas/react-query';
import { findPetsByStatus, addPet } from './generated/client';

const useAddPetMutation = createMutationHook(addPet, {
  onMutate() {
    queryClient.invalidateQueries({
      queryKey: [getQueryFunctionKey(findPetsByStatus)],
    });
  },
});

const useFindPetsByStatus = createQueryHook(findPetsByStatus, {});
```

## Notes

Each hook factory accepts a second argument which is the base options for the query/mutation. This also allows 2 additional options:

- `fetcherData`: Object to be passed to the _Typoas_ fetcher
- `successStatus`: Status code to consider the request as successful (default: 2XX, same as the `ok` function in `@typoas/runtime`)

Note that `fetcherData` can also be passed in the hook options (will override the base one if provided).

If you need, you can also use the `useApiContext` hook to access the client directly:

```tsx
import { useEffect } from 'react';
import { useApiContext } from '@typoas/react-query';
import { addPet } from './generated/client';

// Must be used as a child of the ApiContextProvider
export function MyComponent() {
  const ctx = useApiContext();

  // Use the client
  useEffect(() => {
    addPet(
      ctx,
      {},
      { id: 1, name: 'Rufus', status: 'available', photoUrls: [] },
    );
  }, []);

  return <div></div>;
}
```
