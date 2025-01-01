# NgrxExtension

## Synchronize with storage `withStorageSync`

An extension feature that saves and loads store states to/from Storage (e.g., localStorage or sessionStorage), and synchronizes state changes automatically if desired.

Instead of saving all states, you can appropriately and persistently manage your application by saving only specific information to storage.

**Example Code**

```typescript
export const ShopSignalStore = signalStore(
  withState<AppState>(initialAppState),
  withStorageSync({
    storage: localStorage, // The Storage object to synchronize with (e.g., localStorage, sessionStorage).
    nodes: ['users', {'products': ['items']}], // The keys or nested structure of the store state to be synchronized (e.g. ['user', { settings: ['theme', 'language'] }]).
    prefix: '', // A prefix string attached to the keys when saving to Storage.
    sync: true, //Optional settings (if `sync` is set to true, any state change is automatically written to Storage).
  }),
  withMethods((store) => ({
    // ...
  }))
)
```
