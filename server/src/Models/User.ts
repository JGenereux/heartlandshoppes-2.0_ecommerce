import mongoose from 'mongoose'
import {billingSchema, orderSchema} from './Order'
const Schema = mongoose.Schema

const userSchema = new Schema(
    {
        email: {type: String, required: true},
        password: {type: String, required: true},
        billingInfo: {type: billingSchema, required: false},
        orderHistory: {type: [orderSchema], required: true, default: []}
    },
    {
        timestamps: true,
    }
)

const User = mongoose.model('Users', userSchema)

module.exports = User