const mongoose = require('mongoose')

const CardSchema = new mongoose.Schema({
    engCard: { type: String, required: true },
    userLangCard: { type: String, required: true },
    cardScore: { type: Number, default: 0}
})

const CardModel = mongoose.model('Card', CardSchema)
module.exports = CardModel