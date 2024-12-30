// sample data is created by ChatGPT

import {faker} from '@faker-js/faker';

export const initialAppState: AppState = {
  users: [
    generateUser(),
    generateUser(),
    generateUser(),
  ],
  products: {
    items: [
      generateProductsItem(),
      generateProductsItem(),
    ],
    selectedProductId: null,
    loading: false,
  },
  cart: {
    items: [],
    totalAmount: 0,
    discount: {
      code: '',
      percentage: 0,
    },
  },
};

export function generateUser(): UserState {
  const profile = {
    address: {
      street: 'Sakura Street',
      city: 'Tokyo',
    },
  } as const;

  return {
    id: faker.string.uuid(),
    name: faker.person.firstName(),
    profile: {...profile},
    isLoggedIn: false,
  }
}

export function generateProductsItem(): ProductItem {
  return {
    id: faker.string.uuid(),
    name: faker.food.dish(),
    category: [
      {
        id: faker.string.sample({min: 5, max: 10}),
        name: faker.word.noun(),
      }
    ],
    price: faker.number.int(),
  }
}


export interface UserState {
  id: string;
  name: string;
  profile: {
    address: {
      street: string;
      city: string;
    };
  };
  isLoggedIn: boolean;
}

export interface ProductState {
  items: ProductItem[];
  selectedProductId: string | null;
  loading: boolean;
}

export interface ProductItem {
  id: string;
  name: string;
  category: {
    id: string;
    name: string;
  }[];
  price: number;
}

export interface CartState {
  items: CartItem[];
  totalAmount: number;
  discount: {
    code: string;
    percentage: number;
  };
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface AppState {
  users: UserState[];
  products: ProductState;
  cart: CartState;
}
