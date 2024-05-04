require('dotenv').config()
const bcrypt = require('bcryptjs')

const PORT = process.env.PORT
const MONGODB_URI = process.env.MONGODB_URI
const JWT_SECRET = "randomstring"
const BCRYPT_SALT = bcrypt.genSaltSync(10)

module.exports = {
    MONGODB_URI, PORT, JWT_SECRET, BCRYPT_SALT
}