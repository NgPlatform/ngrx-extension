import {getState, patchState, signalStoreFeature, withHooks, withMethods} from '@ngrx/signals';
import * as R from 'remeda';
import {effect} from '@angular/core';

export type TConfig = {
  sync: boolean,
}

type TNodeItem = string | { [key in string]: TNodeItem[] };


/**
 * e.g.
 * keys:[{app:['todos':{'task':[ 'user' ]},'drink']}]
 */
export function withStorageSync(storage: Storage, nodes: TNodeItem[], config: Partial<TConfig>) {

  return signalStoreFeature(
    withMethods((store) => ({

      // write to storage
      writeToStorage(): void {
        const state = getState(store) as Record<string, unknown>

        wDfs(state, nodes, '', (key, keys, state) => {
          if (!(state as Record<string, object>).hasOwnProperty(key)) {
            throw new Error(`[${key}] ${key} not found`);
          }

          // Ensure that the value for the key is not undefined
          if (typeof (state as Record<string, object>)[key] === 'undefined') {
            throw new Error(`state[${key}] type is undefined`);
          }

          storage.setItem(keys, JSON.stringify((state as Record<string, object>)[key]));
        })
      },

      readFromStorage(): void {

        rDfs(nodes, '', ((key, keys) => {
          const item: string | null = storage.getItem(key);

          if (item === null) {
            return
          }

          const recordState = createObject(item, keys.split('-').filter(x => x !== ''), keys.split('-').filter(x => x !== '').length - 1, {});

          patchState(store, ((state) => {

            console.log('recordState', recordState);
            console.log('state', R.mergeDeep(state, recordState));

            return R.mergeDeep(state, recordState);
          }))


        }))
      }


    })),

    withHooks({
      onInit(store) {

        store.readFromStorage();

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

function wDfs(state: Record<string, unknown>, nodes: TNodeItem[], keys: string, callback: (key: string, keys: string, state: unknown) => void): void {
  nodes.forEach((node) => {
    if (typeof node === 'string') {
      callback(node, keys === '' ? node : `${keys}-${node}`, state);
    } else {
      for (const [key, childNode] of Object.entries(node)) {
        wDfs(state[key] as Record<string, unknown>, childNode, keys === '' ? key : `${keys}-${key}`, callback);
      }
    }
  })
}


function rDfs(nodes: TNodeItem[], keys: string, callback: (key: string, keys: string) => void): void {
  nodes.forEach((node) => {
    if (typeof node === 'string') {
      callback(node, keys === '' ? node : `${keys}-${node}`);
    } else {
      for (const [key, childNode] of Object.entries(node)) {
        rDfs(childNode, keys === '' ? key : `${keys}-${node}`, callback);
      }
    }
  })
}

function createObject(item: string, keys: string[], idx: number, state: Record<string, unknown>): Record<string, unknown> {
  if (idx === 0) {
    return {
      [keys[idx]]: JSON.parse(item),
    }
  }

  const recordState = {[keys[idx]]: state};
  idx -= idx;
  return createObject(item, keys, idx, recordState);
}
