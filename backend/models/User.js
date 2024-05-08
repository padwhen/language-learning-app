const mongoose = require('mongoose')
const { Schema } = mongoose

const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    pin: { type: String, required: true },
    deckIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Deck' }]
})

const UserModel = mongoose.model('User', UserSchema)

module.exports = UserModel