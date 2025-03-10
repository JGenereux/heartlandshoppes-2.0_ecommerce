import { Item } from "./itemInterface";
import { Order, Bill } from "./orderInterface";

interface User {
    email: string,
    password: string,
    billingInfo: Bill,
    orderHistory: [Order],
    cart: [Item]
    role: string,
}

export {User}