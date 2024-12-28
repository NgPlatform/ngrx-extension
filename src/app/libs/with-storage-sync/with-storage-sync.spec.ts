import {TestBed} from '@angular/core/testing';
import {getState, patchState, signalStore, withState} from '@ngrx/signals';
import {AppState, initialAppState} from './model';
import {withStorageSync} from './with-storage-sync';

const nodes = [{'user': ['id', 'name']}, 'products', 'cart'];


describe('withStorageSync', () => {

  it('初期化時にローカルストレージの値を取得しストアに保存されるか', () => {
    const key = 'products-items';
    const items = [
      {
        id: 'product_001',
        name: 'Tシャツ',
        category: [
          {
            id: 'cat_001',
            name: 'アパレ',
          }
        ],
        price: 2000,
      },
      {
        id: 'product_002',
        name: '靴',
        category: [
          {
            id: 'cat_002',
            name: 'storage',
          }
        ],
        price: 5000,
      },
    ];
    localStorage.setItem(key, JSON.stringify(items));
    TestBed.runInInjectionContext(() => {
      const Store = signalStore(
        withState<AppState>(initialAppState),
        withStorageSync(localStorage, [{'products': ['items']}], '', {sync: true}),
      )

      const store = new Store;

      expect(getState(store)).toEqual(
        {
          ...initialAppState,
          products: {
            ...initialAppState.products,
            items,
          }
        }
      );
    });
  });

  it('writeToStorage', () => {

    TestBed.runInInjectionContext(() => {

      const Store = signalStore(
        {protectedState: false},
        withState<AppState>(initialAppState),
        withStorageSync(localStorage, ['users'], '', {sync: true}),
      )

      const store = new Store;

      // users in state add new User;
      patchState(store, (state) => ({
        ...state,
        users: [
          ...state.users,
          {
            id: 'user_001',
            name: '山田 太郎',
            profile: {
              address: {
                street: '桜通り',
                city: '東京都',
              },
            },
            isLoggedIn: false,
          }
        ]
      }))

      // get users in localStorage
      const item = localStorage.getItem('users');

      expect(item).not.toBeNull();

      expect(getState(store)).toEqual({
        ...initialAppState,
        users: [...JSON.parse(item!)]
      })
    });
  });
})
