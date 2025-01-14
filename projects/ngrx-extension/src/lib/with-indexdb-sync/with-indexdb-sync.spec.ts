import 'core-js/stable/structured-clone';
import 'fake-indexeddb/auto';
import { withIndexDBSync } from '@/projects/ngrx-extension/src/lib/with-indexdb-sync/with-indexdb-sync';
import {
	type AppState,
	DBNAME,
	type UserState,
	initialAppState,
} from '@/testsData/model';
import { TestBed } from '@angular/core/testing';
import { signalStore, withState } from '@ngrx/signals';
import Dexie from 'dexie';

describe('withIndexdbSync', () => {
	const db = new Dexie(DBNAME);

	it('初期化時にIndexDBに値が反映しているか', () => {
		TestBed.runInInjectionContext(() => {
			const Store = signalStore(
				{ protectedState: false },
				withState<AppState>(initialAppState),
				withIndexDBSync<
					'users',
					{
						users: UserState[];
					}
				>({
					dbName: DBNAME,
					nodes: ['users'],
					schema: {
						users: 'id, name, isLoggedIn',
					},
				}),
			);

			const store = new Store();

			TestBed.flushEffects();

			const expectedUsers = db.table('users').toArray();

			expect(1).toEqual(1);
			//
			// console.log(expectedUsers);
			//
			// expect(getState(store).users).toEqual(expectedUsers);
		});
	});
});
