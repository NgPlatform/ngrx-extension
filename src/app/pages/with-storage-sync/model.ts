// sample data is created by ChatGPT

export const initialAppState: AppState = {
  user: {
    id: 'user_001',
    name: '山田 太郎',
    profile: {
      address: {
        street: '桜通り',
        city: '東京都',
      },
    },
    isLoggedIn: false,
  },
  products: {
    items: [
      {
        id: 'product_001',
        name: 'Tシャツ',
        category: {
          id: 'cat_001',
          name: 'アパレル',
        },
        price: 2000,
      },
      {
        id: 'product_002',
        name: '靴',
        category: {
          id: 'cat_002',
          name: 'シューズ',
        },
        price: 5000,
      },
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

// 1. ユーザー情報のState
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

// 2. 商品情報のState
export interface ProductState {
  items: ProductItem[];
  selectedProductId: string | null;
  loading: boolean;
}

// 商品1件分の型
export interface ProductItem {
  id: string;
  name: string;
  category: {
    id: string;
    name: string;
  };
  price: number;
}

// 3. カート情報のState
export interface CartState {
  items: CartItem[];
  totalAmount: number;
  discount: {
    code: string;
    percentage: number;
  };
}

// カートの商品1件分の型
export interface CartItem {
  productId: string;
  quantity: number;
}

// 4. アプリ全体のState
export interface AppState {
  user: UserState;
  products: ProductState;
  cart: CartState;
}
