const mongoose = require('mongoose')
const { Schema } = mongoose

const UserSchema = new Schema({
    name: { type: String }, 
    username: { type: String, required: true, unique: true },
    pin: { type: String, required: true },
    deckIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Deck' }],
    avatarUrl: { type: String, default: 'https://github.com/shadcn.png'}
})

const UserModel = mongoose.model('User', UserSchema)

module.exports = UserModel