import { Order } from "./orderInterface";

interface User {
    email: String,
    password: String,
    orderHistory: [Order]
}

export {User}