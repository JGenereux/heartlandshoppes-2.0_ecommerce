import mongoose from 'mongoose'

const Schema = mongoose.Schema

const categorySchema = new Schema(
    {
        category: {type: String, required: true, unique: true}
    },
    {
        timestamps: false
    }
)

const Category = mongoose.model('category', categorySchema)

module.exports = Category