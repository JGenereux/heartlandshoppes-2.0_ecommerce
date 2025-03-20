const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const tokenSchema = new Schema({
    email: { type: String, required: true, unique: true },
    refreshTokens: { type: String },
});


const Token = mongoose.model('Token', tokenSchema, 'tokens')

export {Token}
