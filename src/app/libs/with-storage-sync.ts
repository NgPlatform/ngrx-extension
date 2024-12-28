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
export function withStorageSync(storage: Storage, nodes: TNodeItem[], prefix: string, config: Partial<TConfig>) {

  return signalStoreFeature(
    withMethods((store) => ({

      // write to storage
      writeToStorage(): void {
        const state = getState(store) as Record<string, unknown>

        wDfs(state, nodes, prefix, (key, keys, state) => {
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

        rDfs(nodes, prefix, ((key, keys) => {
          const item: string | null = storage.getItem(keys);

          if (item === null) {
            return
          }

          const recordState = createObject(item, keys.split('-').filter(x => x !== prefix), keys.split('-').filter(x => x !== prefix).length - 1, {});


          patchState(store, ((state) => {
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
    console.log('idx === 0', state);
    return {
      [keys[idx]]: state,
    }
  }

  const recordState = {[keys[idx]]: state};

  if (idx === keys.length - 1) {
    recordState[keys[idx]] = JSON.parse(item);
  }

  idx -= 1;
  return createObject(item, keys, idx, recordState);
}
