import mongoose from 'mongoose'
import {billingSchema, orderSchema} from './Order'
const Schema = mongoose.Schema

const userSchema = new Schema(
    {
        email: {type: String, required: true},
        password: {type: String, required: true},
        billingInfo: {type: billingSchema, required: false},
        orderHistory: {type: [orderSchema], required: true, default: []},
        role: {type: String, required: true, default: 'user'}
    },
    {
        timestamps: true,
    }
)

const Users = mongoose.model('Users', userSchema)

export {Users}