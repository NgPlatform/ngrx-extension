import {Component, inject} from '@angular/core';
import {ShopSignalStore} from './shop.signal-store';
import {FormsModule} from '@angular/forms';
import {faker} from '@faker-js/faker';

@Component({
  selector: 'app-with-storage-sync',
  providers: [ShopSignalStore],
  template: `
    <div class="flex gap-4 flex-col p-3">
      <h1 class="text-3xl">With Storage Sync</h1>
      <div class="flex gap-2 justify-center flex-col">
        <h2 class="text-2xl">User</h2>
        @for (user of users(); let i = $index; track i) {
          <div class="flex gap-2 items-center">
            <div class="flex gap-2 flex-col border rounded-xl p-5 w-96">
              <p>username:{{ user.name }}</p>
              <p>userId:{{ user.id }}</p>
            </div>
            <button (click)="deleteUser(i)" class="border-2 border-red-500 p-2 rounded-xl">delete</button>
          </div>
        }
        <div>
          <button class="p-2 rounded-xl border-2 border-blue-500" (click)="addUser()">add user</button>
        </div>
      </div>

      <div class="flex gap-2 flex-col border rounded-xl p-5 w-96">
        <h2 class="text-2xl">products</h2>
        @for (item of products().items; let i = $index; track i) {
          <p>id:{{ item.id }}</p>
          <p>name:{{ item.name }}</p>
        }
      </div>
    </div>
  `,
  imports: [
    FormsModule
  ]
})
export class WithStorageSyncComponent {
  private readonly shopSignalStore = inject(ShopSignalStore);

  users = this.shopSignalStore.users;

  products = this.shopSignalStore.products;

  cart = this.shopSignalStore.cart;


  addUser = (): void => {
    this.shopSignalStore.addUser({id: faker.string.uuid(), name: faker.person.firstName()})
  }

  deleteUser = (idx: number): void => {
    this.shopSignalStore.deleteUser(idx)
  }
}
