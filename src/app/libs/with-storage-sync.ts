import {getState, patchState, signalStoreFeature, withHooks, withMethods} from '@ngrx/signals';
import {effect} from '@angular/core';

export type TConfig = {
  initialize: boolean,
  sync: boolean,
}

export type TStorageItem<T> = {
  [key in string]: T
}

export function withStorageSync<T>(storage: Storage, key: string, config: Partial<TConfig>) {

  return signalStoreFeature(
    withMethods((store) => ({

      writeToStorage(): void {
        const state = getState(store) as TStorageItem<T>;

        // Check if the state contains the specified key
        if (!state.hasOwnProperty(key)) {
          throw new Error(`[${key}] ${key} not found`);
        }

        // Ensure that the value for the key is not undefined
        if (typeof state[key] === 'undefined') {
          throw new Error(`state[${key}] type is undefined`);
        }

        storage.removeItem(key);
        storage.setItem(key, JSON.stringify(state[key]));
      },

      readToStorage(): void {
        const item: string | null = storage.getItem(key);

        if (item === null) {
          return
        }

        patchState(store, ((state) => {
          return {
            ...state,
            [key]: JSON.parse(item),
          }
        }))
      }

    })),

    withHooks({
      onInit(store) {

        if (config.initialize) {
          store.readToStorage();
        }

        if (config.sync) {

          // Set up an effect to synchronize state changes to storage if sync is enabled
          effect(() => ((_state) => {
            store.writeToStorage()
          })(getState(store)))

        }
      },
    })
  )
}
