import { patchState, signalStoreFeature, withHooks, withMethods, withState } from "@ngrx/signals";
import { IDBPDatabase, openDB } from 'idb';

export type IndexDBModel = {
    dbName:string,
    version:number
}

export function withIndexDBSync({dbName,version = 1}:IndexDBModel){

    return signalStoreFeature(

        withState<{
            db:IDBPDatabase<unknown>|undefined
        }>({
            db:undefined
        }),

        withMethods((store) => ({

            initialize:( async () => {
                const db = await openDB(dbName,version,{
                    upgrade(db) {
                        const sampleStore = db.createObjectStore('sampleStore', { keyPath: 'id' });
                        sampleStore.createIndex('sampleIndex', 'name', { unique: true, multiEntry: true});
                    },
                });
                patchState(store,{db});

                const tc = store.db()?.transaction(['sampleStore'],'readwrite').objectStore('sampleStore');

                tc?.add({id:1,name:1})
            }),

        })),
        withHooks({
            onInit:(async (store) => {
                await store.initialize();
            }),
        })
    )

}