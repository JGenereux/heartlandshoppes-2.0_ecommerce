import mongoose from 'mongoose'
import {billingSchema, orderSchema} from './Order'
import { itemSchema } from './Item'
const Schema = mongoose.Schema

const cartSchema = new Schema (
    {
        item:  {type: itemSchema, required: true, default: {}},
        quantity: {type: Number, required: true, default: 0}
    }
)

const userSchema = new Schema(
    {
        email: {type: String, required: true},
        password: {type: String, required: true},
        billingInfo: {type: billingSchema, required: false},
        orderHistory: {type: [orderSchema], required: true, default: []},
        role: {type: String, required: true, default: 'user'},
        cart: {type: [cartSchema],required: true, default: []}
    },
    {
        timestamps: true,
    }
)

const Users = mongoose.model('Users', userSchema)

export {Users}