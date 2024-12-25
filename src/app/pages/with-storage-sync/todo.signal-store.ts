import { signalStore, withMethods, withState } from "@ngrx/signals"
import { withStorageSync } from "../../libs/with-storage-sync"

export const TodoSignalStore = signalStore(
    withState({}),
    withStorageSync(localStorage,'todo',{sync:true}),
    withMethods(() => ({})),
)