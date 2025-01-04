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

type TNodeItem = string | { [key: string]: TNodeItem[] };

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

/**
 * A helper function that traverses the store state in a Depth-First Search (DFS) manner,
 * calling a callback whenever a target key or node is found.
 *
 * @param currentState The current store state object.
 * @param nodes        The keys or nested node structures to traverse.
 * @param prefix       A combined prefix string from parent nodes, etc.
 * @param callback     A callback to be invoked when a key is found (taking key, fullKeyPath, objectState).
 */
function writeDfs(
	currentState: Record<string, unknown>,
	nodes: TNodeItem[],
	prefix: string,
	callback: (key: string, fullKeyPath: string, objectState: unknown) => void,
): void {
	for (const node of nodes) {
		if (typeof node === 'string') {
			const fullKeyPath = prefix === '' ? node : `${prefix}-${node}`;
			// If the current node is the end, call the callback to write data to storage
			callback(node, fullKeyPath, currentState);
		} else {
			for (const [key, childNode] of Object.entries(node)) {
				const nestedState = currentState[key] as Record<string, unknown>;
				const newPrefix = prefix === '' ? key : `${prefix}-${key}`;

				writeDfs(nestedState, childNode, newPrefix, callback);
			}
		}
	}
}

/**
 * A helper function that loads data from Storage by traversing prefix + node names in a
 * DFS manner. Each time a key is determined, the callback is called.
 *
 * @param nodes    The keys or nested structures to search for in DFS.
 * @param prefix   A combined prefix string from parent nodes, etc.
 * @param callback A callback that receives the final key (fullKeyPath).
 */
function readDfs(
	nodes: TNodeItem[],
	prefix: string,
	callback: (fullKeyPath: string) => void,
): void {
	for (const node of nodes) {
		if (typeof node === 'string') {
			const fullPathKey = prefix === '' ? node : `${prefix}-${node}`;
			callback(fullPathKey);
		} else {
			for (const [key, childNode] of Object.entries(node)) {
				const newPrefix = prefix === '' ? key : `${prefix}-${node}`;
				readDfs(childNode, newPrefix, callback);
			}
		}
		if (typeof node === 'string') {
			const fullPathKey = prefix === '' ? node : `${prefix}-${node}`;
			callback(fullPathKey);
		} else {
			for (const [key, childNode] of Object.entries(node)) {
				const newPrefix = prefix === '' ? key : `${prefix}-${node}`;
				readDfs(childNode, newPrefix, callback);
			}
		}
	}
}

/**
 * A helper function that parses a JSON string retrieved from Storage and recursively builds
 * an object matching the original state tree hierarchy.
 *
 * @param jsonString  The JSON string retrieved from Storage.
 * @param nodesPath   A list of node keys after removing the prefix (e.g., ['user', 'profile']).
 * @param nodesIdx    The current node index being processed (moving from the last element to 0).
 * @param currentState The state object currently being assembled.
 * @returns The object constructed according to the node hierarchy.
 */
function createObject(
	jsonString: string,
	nodesPath: string[],
	nodesIdx: number,
	currentState: Record<string, unknown>,
): Record<string, unknown> {
	const recordState = { [nodesPath[nodesIdx]]: currentState }; // e.g. users: {}

	// If we're at the last element, parse the data from storage and assign it
	if (nodesIdx === nodesPath.length - 1) {
		recordState[nodesPath[nodesIdx]] = JSON.parse(jsonString);
	}

	if (nodesIdx === 0) {
		return recordState;
	}

	return createObject(jsonString, nodesPath, nodesIdx - 1, recordState);
}
