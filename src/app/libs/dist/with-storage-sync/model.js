// sample data is created by ChatGPT
import { faker } from '@faker-js/faker';
export const initialAppState = {
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
export function generateUser() {
    const profile = {
        address: {
            street: 'Sakura Street',
            city: 'Tokyo',
        },
    };
    return {
        id: faker.string.uuid(),
        name: faker.person.firstName(),
        profile: { ...profile },
        isLoggedIn: false,
    };
}
export function generateProductsItem() {
    return {
        id: faker.string.uuid(),
        name: faker.food.dish(),
        category: [
            {
                id: faker.string.sample({ min: 5, max: 10 }),
                name: faker.word.noun(),
            }
        ],
        price: faker.number.int(),
    };
}
