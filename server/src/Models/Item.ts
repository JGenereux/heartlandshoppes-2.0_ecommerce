import mongoose from 'mongoose'

const Schema = mongoose.Schema

const priceOptionsSchema = new Schema({
    priceOptions: {
        type: Map, of: Number, default: {}
    }
})

const reviewSchema = new Schema({
    fullName: {type: String, required: true},
    stars: {type: Number, required: true},
    description: {type: String, required: true},
    photos: {type: [String], required: false}
})

const itemSchema = new Schema(
    {
        name: {type: String, required: true},
        price: {type: Number, required: true},
        priceOptions: {type: priceOptionsSchema, required: false},
        category: {type: [String], required: true},
        options: { type: Map, of: [String], required: false },
        quantity: {type: Number, required: true},
        description: {type: String, required: true},
        photos: {type: [String], required: true},
        isBundle: {type: Boolean, required: true},
        reviews: {type: [reviewSchema], required: true, default: []}
    },
    {
        timestamps: true,
    }
)

const Items = mongoose.model('Items', itemSchema)

export {Items, itemSchema}