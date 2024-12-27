import {signalStore, withMethods, withState} from "@ngrx/signals"
import {withStorageSync} from '../../libs/with-storage-sync';
import {AppState, initialAppState} from './model';


export const ShopSignalStore = signalStore(
  withState<AppState>(initialAppState),
  withStorageSync(localStorage, ['user', 'products', 'cart'], {sync: true}),
  withMethods(() => ({})),
)
