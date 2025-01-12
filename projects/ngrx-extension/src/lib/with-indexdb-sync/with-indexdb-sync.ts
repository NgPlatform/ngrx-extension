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
	writeCallback: Partial<{
		[key in Table]: ({
			db,
			key,
			targetState,
		}: { db: Dexie; key: string; targetState: unknown }) => Promise<void>;
	}>;
	stores: { [key in Table]: string };
};

export const baseWriteCallback = async (
	db: Dexie,
	key: string,
	targetState: unknown,
) => {
	if (Array.isArray(targetState)) {
		await db.table(key).bulkPut(targetState);
		return;
	}

	await db.table(key).put(targetState);
};

export function withIndexDBSync<Table extends string>({
	dbName,
	version = 1,
	sync = true,
	nodes = [],
	prefix = '',
	writeCallback,
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
							async (key, _fullKeyPath, objectState) => {
								const targetState = (objectState as Record<string, unknown>)[
									key
								];

								if (Object.hasOwn(writeCallback, key)) {
									// fixme key type check
									await writeCallback[key as Table]?.({ db, key, targetState });
								} else {
									await baseWriteCallback(db, key, targetState);
								}
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
