import {TestBed} from '@angular/core/testing';
import {getState, signalStore, withState} from '@ngrx/signals';
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

      console.log(getState(store));
      console.log(initialAppState.products.items);

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
})
