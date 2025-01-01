# NgrxExtension

## Synchronize with storage `withStorageSync`

A feature that listens to store state changes and automatically saves them to localStorage (or sessionStorage).

```typescript
/**
 * An extension feature that saves and loads store states to/from Storage (e.g., localStorage or sessionStorage),
 * and synchronizes state changes automatically if desired.
 *
 * @param storage The Storage object to synchronize with (e.g., localStorage, sessionStorage).
 * @param nodes   The keys or nested structure of the store state to be synchronized (e.g. ['user', { settings: ['theme', 'language'] }]).
 * @param prefix  A prefix string attached to the keys when saving to Storage.
 * @param config  Optional settings (if `sync` is set to true, any state change is automatically written to Storage).
 * @returns An NgRx Signals store feature object providing methods and hooks for state synchronization.
 */
```

**Example Code**

```typescript
export const ShopSignalStore = signalStore(
  withState<AppState>(initialAppState),
  withStorageSync(localStorage, ['users', {'products': ['items']}], '', {sync: true}),
  withMethods((store) => ({}))
)
```
