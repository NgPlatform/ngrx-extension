import {
	type TNodeItem,
	createObject,
	readDfs,
	writeDfs,
} from '@/projects/ngrx-extension/src/lib/helpers/graph';
import { effect } from '@angular/core';
import {
	type EmptyFeatureResult,
	type SignalStoreFeature,
	getState,
	patchState,
	signalStoreFeature,
	withHooks,
	withMethods,
} from '@ngrx/signals';
import * as R from 'remeda';

export type TConfig = {
	storage: Storage;
	nodes: TNodeItem[];
	prefix: string;
	sync: boolean;
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
export function withStorageSync({
	storage,
	nodes,
	prefix,
	sync,
}: TConfig): SignalStoreFeature<
	EmptyFeatureResult,
	{
		state: {};
		props: {};
		methods: { writeToStorage: () => void; readFromStorage: () => void };
	}
> {
	return signalStoreFeature(
		withMethods((store) => ({
			// Writes the store data to the storage
			writeToStorage(): void {
				const currentState = getState(store) as Record<string, unknown>;

				writeDfs(
					currentState,
					nodes,
					prefix,
					(key, fullKeyPath, objectState) => {
						// If the store does not have the specified key
						if (!Object.hasOwn(objectState as Record<string, object>, key)) {
							throw new Error(`[${key}] ${key} not found`);
						}

						// The store has the key, but it is undefined
						// todo: Instead of throwing an error, returning early might be preferable
						if (
							typeof (objectState as Record<string, object>)[key] ===
							'undefined'
						) {
							throw new Error(`state[${key}] type is undefined`);
						}

						const value: object = (objectState as Record<string, object>)[key];
						storage.setItem(fullKeyPath, JSON.stringify(value));
					},
				);
			},

			// Reads data from the storage and saves it into the store
			readFromStorage(): void {
				readDfs(nodes, prefix, (fullKeyPath) => {
					const jsonString: string | null = storage.getItem(fullKeyPath);

					if (jsonString === null) {
						return;
					}

					const slicedKeys: string[] = fullKeyPath
						.split('-')
						.filter((x) => x !== prefix);
					const recordState = createObject(
						jsonString,
						slicedKeys,
						slicedKeys.length - 1,
						{},
					);

					patchState(store, (prevState) => {
						return R.mergeDeep(prevState, recordState);
					});
				});
			},
		})),

		withHooks({
			onInit(store) {
				store.readFromStorage();

				// If automatic sync is enabled, watch for state changes and write them to storage
				if (sync) {
					effect(() =>
						((_) => {
							store.writeToStorage();
						})(getState(store)),
					);
				}
			},
		}),
	);
}
