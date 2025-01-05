import { patchStateWithImmer } from '@/projects/ngrx-extension/src/lib/patch-state-with-immer/patch-state-with-immer';
import { withHistory } from '@/projects/ngrx-extension/src/lib/with-history/with-history';
import { Component, effect, inject } from '@angular/core';
import { faker } from '@faker-js/faker';
import { signalStore, withMethods, withState } from '@ngrx/signals';

export type TUser = {
	name: string;
	age: number;
};

export type TUserState = {
	user: TUser;
};

export const UserSignalStore = signalStore(
	withState<TUserState>({ user: { name: 'John Doe', age: 30 } }),
	withHistory({}),
	withMethods((store) => ({
		editName(name: string): void {
			patchStateWithImmer(store, (state) => {
				state.user.name = name;
			});
		},
	})),
);

@Component({
	selector: 'app-with-history',
	providers: [UserSignalStore],
	template: `
    <div>
      <h1 class="text-3xl">With History</h1>
      <p>{{ userSignalStore.user.name() }}</p>
      <p>{{ userSignalStore.user.age() }}</p>
      <div class="flex flex-row gap-3 ">
        <button (click)="editName()" class="bg-green-500 rounded-lg p-2 text-white">change name</button>
        <button (click)="userSignalStore.undo()" class="bg-red-500 rounded-lg p-2 text-white">undo</button>
        <button (click)="userSignalStore.redo()" class="bg-blue-500 rounded-lg p-2 text-white">redo</button>
        <button (click)="userSignalStore.clearHistories()" class="bg-purple-500 rounded-lg p-2 text-white">clear
        </button>
      </div>
    </div>
  `,
})
export class WithHistoryComponent {
	userSignalStore = inject(UserSignalStore);

	constructor() {
		effect(() => {
			// console.log(this.userSignalStore.)
		});
	}

	editName(): void {
		this.userSignalStore.editName(faker.person.firstName());
	}
}
