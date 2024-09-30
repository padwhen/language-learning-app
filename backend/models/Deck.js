const mongoose = require('mongoose');
const { Schema } = mongoose;

const DeckSchema = new Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    deckName: { type: String, required: true },
    deckPercentage: { type: String, default: '0%' },
    deckTags: [{ type: String, required: true }],
    cards: [{
        _id: { type: String, required: false },
        engCard: { type: String, required: true },
        userLangCard: { type: String, required: true },
        cardScore: { type: Number, default: 0 },
        favorite: { type: Boolean, default: false },
        learning: { type: Boolean, default: false }
    }]
});

const DeckModel = mongoose.model('Deck', DeckSchema);
module.exports = DeckModel;
