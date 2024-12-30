import { EmptyFeatureResult, SignalStoreFeature } from '@ngrx/signals';
export type TConfig = {
    sync: boolean;
};
type TNodeItem = string | {
    [key: string]: TNodeItem[];
};
/**
 * An extension feature that saves and loads store states to/from Storage (e.g., localStorage or sessionStorage),
 * and synchronizes state changes automatically if desired.
 *
 * @param storage The Storage object to synchronize with (e.g., localStorage, sessionStorage).
 * @param nodes   The keys or nested structure of the store state to be synchronized (e.g. ['user', { settings: ['theme', 'language'] }]).
 * @param prefix  A prefix string attached to the keys when saving to Storage.
 * @param config  Optional settings (if `sync` is set to true, any state change is automatically written to Storage).
 * @returns An NgRx Signals store feature object providing methods and hooks for state synchronization.
 */
export declare function withStorageSync(storage: Storage, nodes: TNodeItem[], prefix: string, config: Partial<TConfig>): SignalStoreFeature<EmptyFeatureResult, {
    state: {};
    props: {};
    methods: {
        writeToStorage: () => void;
        readFromStorage: () => void;
    };
}>;
export {};
//# sourceMappingURL=with-storage-sync.d.ts.map