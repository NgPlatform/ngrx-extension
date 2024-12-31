import {TestBed} from '@angular/core/testing';
import {getState, patchState, signalStore, withState} from '@ngrx/signals';
import {AppState, generateProductsItem, initialAppState} from './model';
import {withStorageSync} from './with-storage-sync';

describe('withStorageSync', () => {


  beforeEach(() => {
    localStorage.clear();
  });

  it('should retrieve values from storage during initialization and update the store state based on keys', () => {

    const expectedProductsItems = [
      generateProductsItem(),
      generateProductsItem(),
    ]

    localStorage.setItem('products-items', JSON.stringify(expectedProductsItems))

    TestBed.runInInjectionContext(() => {

      const Store = signalStore(
        withState<AppState>(initialAppState),
        withStorageSync(localStorage, [{'products': ['items']}], '', {sync: true})
      )

      const store = new Store;

      expect(getState(store)).toEqual({
        ...initialAppState,
        products: {
          ...initialAppState.products,
          items: expectedProductsItems,
        }
      });
    });
  });


  it('should write to storage when the state changes if sync is enabled', () => {

    TestBed.runInInjectionContext(async () => {

      const Store = signalStore(
        {protectedState: false},
        withState<AppState>(initialAppState),
        withStorageSync(localStorage, [{'products': ['items']}], '', {sync: true})
      );

      const store = new Store();

      TestBed.flushEffects();

      const newItems = [generateProductsItem()];

      patchState(store, (state) => ({
        ...state,
        products: {
          ...state.products,
          items: newItems,
        }
      }));

      // Run effect()
      TestBed.flushEffects();

      expect(getState(store)).toEqual({
        ...initialAppState,
        products: {
          ...initialAppState.products,
          items: JSON.parse(localStorage.getItem('products-items')!)
        }
      });

    });
  });


  it('should not write to storage when sync is false and the state changes', () => {

    TestBed.runInInjectionContext(async () => {

      const Store = signalStore(
        {protectedState: false},
        withState<AppState>(initialAppState),
        withStorageSync(localStorage, [{'products': ['items']}], '', {sync: false})
      );

      const store = new Store();

      TestBed.flushEffects();

      const newItems = [generateProductsItem()];

      patchState(store, (state) => ({
        ...state,
        products: {
          ...state.products,
          items: newItems,
        }
      }));

      // Run effect()
      TestBed.flushEffects();

      expect(getState(store)).toEqual({
        ...initialAppState,
        products: {
          ...initialAppState.products,
          items: newItems,
        }
      });

    });
  });


  it('When `sync` is false and the `writeToStorage` function is called, the store\'s state is saved to localStorage.', () => {

    TestBed.runInInjectionContext(() => {

      const Store = signalStore(
        {protectedState: false},
        withState<AppState>(initialAppState),
        withStorageSync(localStorage, [{'products': ['items']}], '', {sync: false})
      );

      const store = new Store();

      expect(localStorage.getItem('products-items')).toBeNull();

      store.writeToStorage();

      expect(getState(store)).toEqual(
        {
          ...initialAppState,
          products: {
            ...initialAppState.products,
            items: JSON.parse(localStorage.getItem('products-items')!)
          }
        }
      )
    });
  });


  it('When the readFromStorage function is called, the store is updated.', () => {
    TestBed.runInInjectionContext(() => {

      const Store = signalStore(
        {protectedState: false},
        withState<AppState>(initialAppState),
        withStorageSync(localStorage, [{'products': ['items']}], '', {sync: false})
      )

      const store = new Store();

      expect(getState(store)).toEqual(initialAppState);

      const newItems = [generateProductsItem(), generateProductsItem()];

      localStorage.setItem('products-items', JSON.stringify(newItems));

      store.readFromStorage();

      expect(getState(store)).toEqual({
        ...initialAppState,
        products: {
          ...initialAppState.products,
          items: newItems
        }
      })
    });
  });

  it('prefixを指定した時、初期化時にストアの状態を保存しているか', () => {

    const prefix: string = 'internal' as const;

    TestBed.runInInjectionContext(() => {
      const Store = signalStore(
        withState<AppState>(initialAppState),
        withStorageSync(localStorage, [{'products': ['items']}], prefix, {sync: true})
      )

      const store = new Store();

      TestBed.flushEffects();

      expect(getState(store)).toEqual({
        ...initialAppState,
        products: {
          ...initialAppState.products,
          items: JSON.parse(localStorage.getItem(`${prefix}-products-items`)!)
        }
      })
    });
  });
});
