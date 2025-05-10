import mongoose from 'mongoose'

const Schema = mongoose.Schema

const itemInvoiceSchema = new mongoose.Schema({
    description: {type: String, required: true},
    amount: { type: Number, required: true },
    quantity: { type: Number, required: true },
})

const billingSchema = new mongoose.Schema({
    fullName: {type: String, required: true},
    address: {type: String, required: true},
    country: {type: String, required: true},
    province: {type: String, required: true},
    city: {type: String, required: true},
    postalCode: {type: String, required: true},
    email: {type: String, required: true},
    phone: {type: String, required: false}
}, {_id: false})

const orderSchema = new mongoose.Schema({
    _id: { type: Schema.Types.ObjectId, auto: true },
    items: { type: [itemInvoiceSchema], required: true },
    totalPrice: { type: Number, required: true },
    billingInfo: { type: billingSchema, required: true }, 
    status: { type: String, required: true },
    trackingNumber: {type: String, required: false},
    date: { type: Date, default: Date.now, required: true },
    invoiceUrl: {type: String, required: true},
    local: {type: Boolean, required: true}
});

const Orders = mongoose.model('Orders', orderSchema)

export {Orders, orderSchema, billingSchema}