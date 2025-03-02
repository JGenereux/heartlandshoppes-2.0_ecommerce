import mongoose from 'mongoose'

const Schema = mongoose.Schema

const billingSchema = new mongoose.Schema({
    fullName: {type: String, required: true},
    address: {type: String, required: true},
    country: {type: String, required: true},
    province: {type: String, required: true},
    city: {type: String, required: true},
    postalCode: {type: String, required: true},
    email: {type: String, required: true},
    phone: {type: String, required: false}
})

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    items: { type: [String], required: true },
    totalPrice: { type: Number, required: true },
    billingInfo: { type: billingSchema, required: true }, 
    status: { type: Boolean, required: true },
    date: { type: Date, default: Date.now, required: true }
});
const Order = mongoose.model('Orders', orderSchema)

export {Order, orderSchema}