import { Order, Bill } from "./orderInterface";

interface User {
    email: String,
    password: String,
    billingInfo: Bill,
    orderHistory: [Order]
}

export {User}