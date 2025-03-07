import { Order, Bill } from "./orderInterface";

interface User {
    email: string,
    password: string,
    billingInfo: Bill,
    orderHistory: [Order],
    role: string,
}

export {User}