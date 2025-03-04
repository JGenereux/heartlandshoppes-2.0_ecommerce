import mongoose from 'mongoose'

const Schema = mongoose.Schema

const itemSchema = new Schema(
    {
        name: {type: String, required: true, unique: true},
        price: {type: Number, required: true},
        category: {type: [String], required: true},
        options: {type: Object, required: false},
        quantity: {type: Number, required: true},
        description: {type: String, required: true},
        photos: {type: [String], required: true}
    },
    {
        timestamps: true,
    }
)

const Items = mongoose.model('Items', itemSchema)

export {Items}