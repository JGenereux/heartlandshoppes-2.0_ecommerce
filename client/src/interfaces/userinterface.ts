import { Item } from "./iteminterface";
import { Bill, Order } from "./orderInterface";

interface User {
    email: string,
    password: string,
    billingInfo: Bill,
    orderHistory: [Order],
    cart: [Item]
    role: string,
}

export type {User}