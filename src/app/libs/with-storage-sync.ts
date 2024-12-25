import {getState, signalStoreFeature, withHooks, withMethods, withProps} from '@ngrx/signals';
import {effect} from '@angular/core';

export const SOURCE =  Symbol('SOURCE')

export type TConfig = {
  sync:boolean,
}

export function withStorageSync(storage:Storage,key:string,config:Partial<TConfig>){
  return signalStoreFeature(
    withProps((store) => ({[SOURCE]:key})),
    withMethods((store) => ({

      writeToStorage():void{
        const state = getState(store);

        console.log('write to storage',state);

        storage.setItem(key,JSON.stringify(state));
      },

    })),
    withHooks({
      onInit(store){
        if(config.sync){

          // storeの状態を見て自動更新を行う。
          effect(() => ((_state) => {
            store.writeToStorage()
          })(getState(store)))
        }
      },
    })
  )
}
