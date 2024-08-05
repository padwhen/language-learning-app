const mongoose = require('mongoose')

const CardSchema = new mongoose.Schema({
    engCard: { type: String, required: true },
    userLangCard: { type: String, required: true },
    cardScore: { type: Number, default: 0},
    deck: { type: mongoose.Schema.Types.ObjectId, ref: 'Deck' },
    favorite: { type: Boolean, default: false }
})

const CardModel = mongoose.model('Card', CardSchema)
module.exports = CardModel