import { withIndexDBSync } from '@/projects/ngrx-extension/src/lib/with-indexdb-sync/with-indexdb-sync';
import { Component, inject } from '@angular/core';
import { signalStore, withState } from '@ngrx/signals';

const UserSignalStore = signalStore(
	withState<{
		users: { name: string; age: number }[];
		tasks: { title: string; subTitle: string };
	}>({
		users: [
			{
				name: 'mzkmnk',
				age: 14,
			},
		],
		tasks: {
			title: 'task1',
			subTitle: 'subtask1',
		},
	}),
	withIndexDBSync<'users' | 'tasks'>({
		dbName: 'withIndexDBSync',
		nodes: ['users', 'tasks'],
		stores: {
			users: '++id',
			tasks: '++id, title, subTitle',
		},
	}),
);

@Component({
	selector: 'app-with-indexdb-sync',
	providers: [UserSignalStore],
	template: `
        <div>
          @for (user of userSignalStore.users();track user){
            <p>username:{{ user.name }}</p>
            <p>userId:{{ user.age }}</p>
          }
        </div>
    `,
})
export class WithStorageSyncComponent {
	userSignalStore = inject(UserSignalStore);
}
