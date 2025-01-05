# NgrxExtension

[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)
[![npm version](https://badge.fury.io/js/%40ngplatform%2Fngrx-extension.svg)](https://www.npmjs.com/@ngplatform/ngrx-extension)

## Synchronize with storage `withStorageSync`

An extension feature that saves and loads store states to/from Storage (e.g., localStorage or sessionStorage), and synchronizes state changes automatically if desired.

Instead of saving all states, you can appropriately and persistently manage your application by saving only specific information to storage.

**Example Code**

```ts
export const ShopSignalStore = signalStore(
  withState<AppState>(initialAppState),
  withStorageSync({
    storage: localStorage, // The Storage object to synchronize with (e.g., localStorage, sessionStorage).
    nodes: ['users', {'products': ['items']}], // The keys or nested structure of the store state to be synchronized (e.g. ['user', { settings: ['theme', 'language'] }]).
    prefix: '', // A prefix string attached to the keys when saving to Storage.
    sync: true, //Optional settings (if `sync` is set to true, any state change is automatically written to Storage).
  }),
  withMethods((store) => ({
    // ...
  }))
)
```

## `patchStateWithImmer`

This function leverages Immer's `produce` to let you write mutable-looking
changes in the `updater` callback while actually creating a new, immutable
state object under the hood.

**Example Code**

```ts
import {signalStore} from "@ngrx/signals";

export const UserSignalStore = signalStore(
  withState<{ name: string, age: number }>({name: 'John', age: 30}),
  withMethods((store) => ({
    editUser: (name: string) => {
      // here
      patchStateWithImmer(store, (state) => {
        state.user.name = name;
      });
    },
  }))
)
```
