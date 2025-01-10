import { withIndexDBSync } from '@/projects/ngrx-extension/src/lib/with-indexdb-sync/with-indexdb-sync';
import { Component, inject } from '@angular/core';
import { signalStore, withState } from '@ngrx/signals';

const UserSignalStore = signalStore(
	withState<{ user: { name: string; id: string } }>({
		user: {
			name: 'mzkmnk',
			id: '00000000',
		},
	}),
	withIndexDBSync<'user'>({
		dbName: 'dbName',
		version: 1,
		stores: {
			user: '++id,name',
		},
	}),
);

@Component({
	selector: 'app-with-indexdb-sync',
	providers: [UserSignalStore],
	template: `
        <div>
            <p>username:{{ userSignalStore.user.name() }}</p>
            <p>userId:{{ userSignalStore.user.id() }}</p>
        </div>
    `,
})
export class WithStorageSyncComponent {
	userSignalStore = inject(UserSignalStore);

	onInit(): void {
		this.userSignalStore.write({ table: 'user' });
	}
}
