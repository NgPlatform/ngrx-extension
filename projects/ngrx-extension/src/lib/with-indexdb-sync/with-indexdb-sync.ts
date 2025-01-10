import { signalStoreFeature, withHooks, withMethods } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import Dexie from 'dexie';
import { from, pipe, switchMap } from 'rxjs';

export type IndexDBModel<Table extends string> = {
	dbName: string;
	version: number;
	stores: { [key in Table]: string };
};

export function withIndexDBSync<Table extends string>({
	dbName,
	version = 1,
	stores,
}: IndexDBModel<Table>) {
	const db = new Dexie(dbName);

	db.version(version).stores(stores);

	return signalStoreFeature(
		withMethods((store) => ({
			write: rxMethod<{ table: Table }>(
				pipe(
					switchMap(() => {
						return from(
							db.table('tasks').add({ title: 'task1', name: 'name1' }),
						);
					}),
				),
			),
		})),
		withHooks({
			onInit: (store) => {
				// store.write({});
			},
		}),
	);
}
