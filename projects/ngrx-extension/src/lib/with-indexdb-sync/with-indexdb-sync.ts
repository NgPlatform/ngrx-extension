import {
	type TNodeItem,
	readDfs,
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

export type IndexDBModel<
	Table extends string,
	ObjectState extends Partial<{ [key in Table]: unknown }>,
> = {
	dbName: string;
	version?: number;
	sync?: boolean;
	nodes: TNodeItem[];
	writeCallback: Partial<{
		[key in Table]: ({
			db,
			key,
			targetState,
		}: {
			db: Dexie;
			key: string;
			targetState: ObjectState[key];
		}) => Promise<void>;
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

export function withIndexDBSync<
	Table extends string,
	ObjectState extends Partial<{ [key in Table]: unknown }>,
>({
	dbName,
	version = 1,
	sync = true,
	nodes = [],
	writeCallback,
	stores,
}: IndexDBModel<Table, ObjectState>) {
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
							'',
							async (key, _fullKeyPath, objectState) => {
								const targetState: ObjectState[Table] = (
									objectState as Record<string, ObjectState[Table]>
								)[key];

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
						readDfs(nodes, '', async (fullKeyPath) => {
							const data = await db.table(fullKeyPath).toArray();

							console.log('data', data);
						});
					}),
				),
			),
		})),
		withHooks({
			onInit: (store) => {
				store.readFromStorage({});

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
