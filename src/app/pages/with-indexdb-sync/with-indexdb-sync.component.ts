import { withIndexDBSync } from '@/projects/ngrx-extension/src/lib/with-indexdb-sync/with-indexdb-sync';
import { Component, inject } from '@angular/core';
import { faker } from '@faker-js/faker';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

const UserSignalStore = signalStore(
	withState<{
		users: { id: number; name: string; age: number }[];
		tasks: { title: string; subTitle: string };
	}>({
		users: [
			{
				id: 1,
				name: 'mzkmnk',
				age: 14,
			},
			{
				id: 2,
				name: 'mnk',
				age: 21,
			},
		],
		tasks: {
			title: 'task1',
			subTitle: 'subtask1',
		},
	}),
	withIndexDBSync<
		'users' | 'tasks',
		{
			users: { id: number; name: string; age: number }[];
			tasks: { title: string; subTitle: string };
		}
	>({
		dbName: 'withIndexDBSync',
		nodes: ['users', 'tasks'],
		stores: {
			users: 'id',
			tasks: '++id, title, subTitle',
		},
		writeCallback: {
			users: async ({ db, key, targetState }) => {
				db.table(key).bulkPut(targetState);
			},
			tasks: async ({ db, key, targetState }) => {
				db.table(key).put(targetState);
			},
		},
	}),

	withMethods((store) => ({
		editUser(idx: number) {
			patchState(store, (state) => ({
				...state,
				users: state.users.map((user) => {
					if (user.id === idx) {
						return {
							name: faker.person.firstName(),
							age: 10,
							id: idx,
						};
					}
					return user;
				}),
			}));
		},
	})),
);

@Component({
	selector: 'app-with-indexdb-sync',
	providers: [UserSignalStore],
	template: `
        <div>
          @for (user of userSignalStore.users();track user.id){
            <p>username:{{ user.name }}</p>
            <p>userId:{{ user.age }}</p>

            <button class="border border-green-400 rounded-sm p-2" (click)="userSignalStore.editUser(user.id)">{{user.id}}をランダムに変更</button>
          }
        </div>
    `,
})
export class WithStorageSyncComponent {
	userSignalStore = inject(UserSignalStore);
}
