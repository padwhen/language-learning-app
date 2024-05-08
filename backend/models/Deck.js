const mongoose = require('mongoose')
const { Schema } = mongoose

const DeckSchema = new Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'},
    deckName: { type: String, required: true } ,
    deckPercentage: { type: String, default: 0}, 
    deckQuantity: { type: String, default: 0 },
    deckTags: [{ type: String, required: true }],
    cards: [{ 
        engCard: { type: String, required: true },
        userLangCard: { type: String, required: true },
        cardScore: { type: Number, default: 0 }
    }]
})

const DeckModel = mongoose.model('Deck', DeckSchema)
module.exports = DeckModel

