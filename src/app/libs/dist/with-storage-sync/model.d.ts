export declare const initialAppState: AppState;
export declare function generateUser(): UserState;
export declare function generateProductsItem(): ProductItem;
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
//# sourceMappingURL=model.d.ts.map