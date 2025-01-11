import {
	type TNodeItem,
	writeDfs,
} from '@/projects/ngrx-extension/src/lib/helpers/graph';
import { effect } from '@angular/core';
import {
	getState,
	signalStoreFeature,
	withHooks,
	withMethods,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import Dexie from 'dexie';
import { pipe, tap } from 'rxjs';

export type IndexDBModel<Table extends string> = {
	dbName: string;
	version?: number;
	sync?: boolean;
	prefix?: string;
	nodes: TNodeItem[];
	stores: { [key in Table]: string };
};

export function withIndexDBSync<Table extends string>({
	dbName,
	version = 1,
	sync = true,
	nodes = [],
	prefix = '',
	stores,
}: IndexDBModel<Table>) {
	const db = new Dexie(dbName);

	db.version(version).stores(stores);

	return signalStoreFeature(
		withMethods((store) => ({
			writeToStorage: rxMethod(
				pipe(
					tap(() => {
						const currentState = getState(store) as Record<string, unknown>;

						writeDfs(
							currentState,
							nodes,
							prefix,
							async (key, fullKeyPath, objectState) => {
								await db
									.table(fullKeyPath)
									.add((objectState as Record<string, unknown>)[key]);
							},
						);
					}),
				),
			),

			readFromStorage: rxMethod(
				pipe(
					tap(() => {
						db.table('users').toArray();
					}),
				),
			),
		})),
		withHooks({
			onInit: (store) => {
				if (sync) {
					effect(() =>
						((_) => {
							store.writeToStorage({});
						})(getState(store)),
					);
				}
			},
		}),
	);
}
