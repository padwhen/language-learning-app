const mongoose = require('mongoose')
const { Schema } = mongoose

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    pin: {
        type: String,
        required: true
    },
    dockIds: [{
        type: String
    }]
})

const UserModel = mongoose.model('User', UserSchema)

module.exports = UserModel