import { patchStateWithImmer } from '@/projects/ngrx-extension/src/lib/patch-state-with-immer/patch-state-with-immer';
import { Component, inject } from '@angular/core';
import { faker } from '@faker-js/faker';
import { signalStore, withMethods, withState } from '@ngrx/signals';

export const userSignalStore = signalStore(
	withState<{ user: { name: string; age: number } }>({
		user: { name: 'John Doe', age: 30 },
	}),
	withMethods((store) => ({
		editUser(name: string, age: number) {
			patchStateWithImmer(store, (state) => {
				state.user.name = name;
				state.user.age = age;
			});
		},
	})),
);

@Component({
	selector: 'app-patch-state-with-immer',
	providers: [userSignalStore],
	template: `
    <h1 class="text-3xl">Patch State With Immer</h1>
    <p>Name:{{ user.name() }}</p>
    <p>Age:{{ user.age() }}</p>

    <button (click)="editName(faker.person.firstName(),faker.number.int({min:0,max:100}))">Edit Name</button>
  `,
})
export class PatchStateWithImmerComponent {
	userSignalStore = inject(userSignalStore);

	user = this.userSignalStore.user;
	protected readonly faker = faker;

	editName = (name: string, age: number) => {
		this.userSignalStore.editUser(name, age);
	};
}
