import {patchState, signalStore, withMethods, withState} from "@ngrx/signals"
import {AppState, initialAppState, UserState} from '../../../../projects/ngrx-extension/src/lib/model';
import {withStorageSync} from 'ngrx-extension';


export const ShopSignalStore = signalStore(
  withState<AppState>(initialAppState),
  withStorageSync(localStorage, ['users', {'products': ['items']}], '', {sync: true}),
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
            }
          ]
        }
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
            }
          }
          return user
        })
      }));
    },

    deleteUser(idx: number) {
      patchState(store, (state) => ({
        ...state,
        users: state.users.filter((_, i) => i !== idx),
      }))
    }
  })),
)
