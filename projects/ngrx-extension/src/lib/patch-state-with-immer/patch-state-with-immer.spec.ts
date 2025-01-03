import { patchStateWithImmer } from '@/projects/ngrx-extension/src/lib/patch-state-with-immer/patch-state-with-immer';
import {
	type AppState,
	generateProductsItem,
	initialAppState,
} from '@/testsData/model';
import { TestBed } from '@angular/core/testing';
import { getState, signalStore, withMethods, withState } from '@ngrx/signals';

describe('patchStateWithImmer', () => {
	it('updates products.items as expected when the setItems method is called', () => {
		const expectedItems = [generateProductsItem(), generateProductsItem()];
		TestBed.runInInjectionContext(() => {
			const Store = signalStore(
				{ protectedState: false },
				withState<AppState>(initialAppState),
				withMethods((store) => ({
					setItems() {
						patchStateWithImmer(store, (state) => {
							state.products.items = expectedItems;
						});
					},
				})),
			);

			const store = new Store();

			store.setItems();

			expect(getState(store).products.items).toEqual(expectedItems);
		});
	});
});
