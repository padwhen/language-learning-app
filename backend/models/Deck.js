const mongoose = require('mongoose')
const { Schema } = mongoose

const DeckSchema = new Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'},
    deckName: { type: String, required: true } ,
    deckPercentage: { type: String, default: 0}, 
    deckQuantity: { type: String, default: 0 },
    deckTags: [{ type: String, required: true }],
    cardIds: [{type: mongoose.Schema.Types.ObjectId, ref: 'Card' }]
})

const DeckModel = mongoose.model('Deck', DeckSchema)
module.exports = DeckModel

