import {Component, inject} from '@angular/core';
import {ShopSignalStore} from './shop.signal-store';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-with-storage-sync',
  providers: [ShopSignalStore],
  template: `
    <div class="flex gap-4 flex-col p-3">
      <h1 class="text-3xl">With Storage Sync</h1>
      <div class="flex gap-2 flex-col border rounded-xl p-5 w-96">
        <h2 class="text-2xl">username:{{ user().name }}</h2>
        <h3 class="text-xl">userId:{{ user().id }}</h3>
      </div>
    </div>
  `,
  imports: [
    FormsModule
  ]
})
export class WithStorageSyncComponent {
  private readonly shopSignalStore = inject(ShopSignalStore);

  user = this.shopSignalStore.user;

  products = this.shopSignalStore.products;

  cart = this.shopSignalStore.cart;
}
