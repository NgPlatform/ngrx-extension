import {
	type TNodeItem,
	buildNestedState,
	traverseAndRead,
	traverseAndWrite,
} from '@/projects/ngrx-extension/src/lib/helpers/graph';
import { effect } from '@angular/core';
import {
	getState,
	patchState,
	signalStoreFeature,
	withHooks,
	withMethods,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import Dexie from 'dexie';
import * as R from 'remeda';
import { pipe, tap } from 'rxjs';

export type IndexDBModel<K extends string> = {
	dbName: string;
	version?: number;
	sync?: boolean;
	nodes: TNodeItem[];
	schema: { [key in K]: string };
};

/**
 * developer preview
 *
 * **Content**
 * この関数はストアの状態とIndexDBを同期させるための関数。
 * #### writeToIndexDB
 *
 * #### readFromIndexDB
 * この関数は現在**配列**のみに対応。
 * テーブル情報を取得しストアの状態に反映を行う。
 *
 * @param dbName
 * @param version
 * @param sync
 * @param nodes
 * @param stores
 */
export function withIndexDBSync<
	K extends string,
	S extends { [key in K]: unknown[] },
>({ dbName, version = 1, sync = true, nodes, schema }: IndexDBModel<K>) {
	const db = new Dexie(dbName);

	db.version(version).stores(schema);

	return signalStoreFeature(
		withMethods((store) => ({
			writeToIndexDB: rxMethod(
				pipe(
					tap(() => {
						const currentState = getState(store) as Record<string, unknown>;

						traverseAndWrite(
							currentState,
							nodes,
							'',
							async (table, _, objectState) => {
								const targetState: S[K] = (objectState as Record<string, S[K]>)[
									table
								];

								await db.table(table).bulkPut(targetState);
							},
						);
					}),
				),
			),

			readFromIndexDB() {
				traverseAndRead(nodes, '', (fullKeyPath) => {
					const slicedKeys: string[] = fullKeyPath.split('-');

					db.table(slicedKeys[slicedKeys.length - 1])
						.toArray()
						.then((data) => {
							const recordState = buildNestedState(
								JSON.stringify(data),
								slicedKeys,
								slicedKeys.length - 1,
								{},
							);

							patchState(store, (prevState) => {
								return R.mergeDeep(prevState, recordState);
							});
						});
				});
			},
		})),
		withHooks({
			onInit: (store) => {
				store.readFromIndexDB();

				if (sync) {
					effect(() =>
						((_) => {
							store.writeToIndexDB({});
						})(getState(store)),
					);
				}
			},
		}),
	);
}
