import mongoose from 'mongoose'

const Schema = mongoose.Schema

const reviewSchema = new Schema({
    fullName: {type: String, required: true},
    stars: {type: Number, required: true},
    description: {type: String, required: true},
    photos: {type: [String], required: false}
})

const itemSchema = new Schema(
    {
        name: {type: String, required: true, unique: true},
        price: {type: Number, required: true},
        category: {type: [String], required: true},
        options: { type: Map, of: [String], required: false },
        quantity: {type: Number, required: true},
        description: {type: String, required: true},
        photos: {type: [String], required: true},
        reviews: {type: [reviewSchema], required: true, default: []}
    },
    {
        timestamps: true,
    }
)

const Items = mongoose.model('Items', itemSchema)

export {Items, itemSchema}