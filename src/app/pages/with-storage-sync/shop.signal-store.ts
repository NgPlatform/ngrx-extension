import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { withStorageSync } from 'ngrx-extension';
import {
	AppState,
	initialAppState,
	UserState,
} from '@/testsData/with-storage-sync/model';

export const ShopSignalStore = signalStore(
	withState<AppState>(initialAppState),
	withStorageSync({
		storage: localStorage,
		nodes: ['users', { products: ['items'] }],
		prefix: '',
		sync: true,
	}),
	withMethods((store) => ({
		addUser(user: Pick<UserState, 'id' | 'name'>) {
			patchState(store, (state) => {
				return {
					...state,
					users: [
						...state.users,
						{
							...user,
							profile: {
								address: {
									street: '桜通り',
									city: '東京都',
								},
							},
							isLoggedIn: false,
						},
					],
				};
			});
		},

		editUser(idx: number, editUser: Pick<UserState, 'id' | 'name'>) {
			patchState(store, (state) => ({
				...state,
				users: state.users.map((user, i) => {
					if (i === idx) {
						return {
							...user,
							...editUser,
						};
					}
					return user;
				}),
			}));
		},

		deleteUser(idx: number) {
			patchState(store, (state) => ({
				...state,
				users: state.users.filter((_, i) => i !== idx),
			}));
		},
	})),
);
