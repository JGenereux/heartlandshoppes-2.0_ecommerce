import mongoose from 'mongoose'

const Schema = mongoose.Schema

const itemSchema = new Schema(
    {
        name: {type: String, required: true},
        price: {type: Number, required: true},
        category: {type: [String], required: true},
        options: {type: JSON, required: false},
        quantity: {type: Number, required: true},
        description: {type: String, required: true},
        photos: {type: [String], required: true}
    },
    {
        timestamps: true,
    }
)

const Item = mongoose.model('Items', itemSchema)

module.exports = Item