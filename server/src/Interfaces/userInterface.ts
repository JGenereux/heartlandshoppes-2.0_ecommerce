import { Item } from "./itemInterface";
import { Order, Bill } from "./orderInterface";

interface CartItem {
    item: Item,
    quantity: number
}

interface User {
    email: string,
    password: string,
    billingInfo: Bill,
    orderHistory: Order[],
    cart: CartItem[],
    role: string,
}

export {User, CartItem}